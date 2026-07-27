# Architecture — AI Fashion Sales Assistant

## 1. High-Level Diagram (textual)

```
Instagram DM ──┐
                ├──> Webhook Receiver (Express) ──> Message Router
WhatsApp msg ───┘                                        │
                                                          ▼
                                          Session/Memory Manager (LangChain)
                                                          │
                                                          ▼
                                        Intent + Entity Detection (OpenAI API)
                                                          │
                              ┌───────────────────────────┼────────────────────────────┐
                              ▼                           ▼                            ▼
                     Product Search Service      Order/Cart Service            Sentiment/Complaint
                     (MongoDB: Products)         (MongoDB: Orders, Customers)  Handler
                              │                           │
                              └─────────────┬─────────────┘
                                            ▼
                                 Response Composer (text + image + buttons)
                                            │
                                            ▼
                              Channel Adapter (IG Graph API / WhatsApp API)
                                            │
                                            ▼
                                        Customer
```

Admin Dashboard (React + Tailwind) talks to the same backend via REST APIs for Products, Customers, Orders, Conversations.

n8n sits alongside as an automation layer for things like: notifying admin of new orders, scheduled re-engagement messages, syncing stock, exporting data.

## 2. Components

### 2.1 Frontend (Admin Dashboard)
- React.js + Tailwind CSS
- Pages: Products, Customers, Orders, Conversations, AI Training/Responses, Export

### 2.2 Backend
- Node.js + Express.js
- REST endpoints for dashboard + webhook endpoints for IG/WhatsApp
- Auth middleware for admin routes

### 2.3 AI Layer
- OpenAI API for language understanding/generation
- LangChain for:
  - Prompt templates (system prompt = brand persona + rules)
  - **Chat session/memory node** — this is the piece the bug report is about. It should use a memory class (e.g., buffer or summary memory) backed by a MongoDB-based chat message history store, keyed by `sessionId = customerId + channel`.
  - Tool-calling: a "search_products" tool and a "create_order" tool the LLM can call instead of hallucinating data.

### 2.4 Database (MongoDB)
Collections: `Products`, `Customers`, `Orders`, `Conversations` (or `ChatSessions` + `Messages`).

### 2.5 Messaging Integration
- Instagram Graph API (DM automation)
- WhatsApp Business API (chat automation, catalog sharing)

## 3. Data Flow for the Reported Bug (Product Search → Order)

1. Customer message arrives at webhook → normalized into `{ channel, customerId, text }`.
2. Session Manager loads/creates a `ChatSession` document and loads recent memory from MongoDB (not just local variable).
3. LLM (with tools) decides intent. If "product_search" → calls `search_products(filters)` tool → real DB query → returns structured product list (image URL, sizes, price).
4. Response Composer formats this into a message with image attachments per channel format (IG carousel / WhatsApp catalog message).
5. If customer replies "buy" / "add to cart" → LLM calls `start_order(productId, size, color)` tool → backend creates a **draft order** and asks follow-up questions (name, phone, address, payment method) using a small state machine (`awaiting_field`) stored on the session document — this avoids losing track mid-conversation.
6. Once all required fields are collected → `create_order` tool finalizes the order, computes total, writes to `Orders`, updates `Customers.orderHistory`, returns Order ID + status.
7. Every inbound and outbound message in this whole flow is appended to `Messages` in MongoDB immediately (write-through, not just cached in memory) — this is what makes the session persistence testable.

## 4. Testing the "Chat Session / DB Persistence" Bug
- Unit test: send 3 sequential messages for the same `sessionId`, then query MongoDB directly and assert message count == 6 (3 customer + 3 AI) and that memory content used in prompt #3 includes content from message #1.
- Integration test: restart the server process between message 2 and 3, confirm context is still recalled (proves it's not just in-process memory).
