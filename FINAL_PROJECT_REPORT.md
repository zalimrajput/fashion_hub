# FashionHub AI Assistant — Final Project Report

## Executive Summary

FashionHub AI Assistant is an intelligent e-commerce conversational agent that allows customers to browse fashion products, receive personalized recommendations, manage shopping carts, and complete purchases through a natural language interface. The system integrates a React frontend, Node.js/Express backend, and a Python AI orchestration service powered by LangGraph and OpenAI's GPT-4.1-mini. It also supports WhatsApp and Instagram messaging channels for broader customer reach.

## Objectives

- Build an AI-powered fashion shopping assistant with natural language understanding
- Enable product discovery, cart management, and checkout through chat
- Support multiple platforms (web, WhatsApp, Instagram)
- Provide admin dashboard for managing products, customers, and orders
- Ensure production-grade reliability with proper error handling and session management

## System Architecture

```
User Browser / WhatsApp / Instagram
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   AI Service    │
│   React + Vite  │     │   Express.js    │     │   FastAPI       │
│   Port 5173     │     │   Port 5000     │     │   Port 8000     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   MongoDB       │     │   LangGraph     │
                        │   Atlas         │     │   Workflow      │
                        └─────────────────┘     └─────────────────┘
                                                       │
                                                       ▼
                                                ┌─────────────────┐
                                                │   OpenRouter    │
                                                │   GPT-4.1-mini  │
                                                └─────────────────┘
```

### LangGraph AI Workflow

Each chat message flows through a stateful graph:

1. **understand_node** — LLM classifies intent and extracts entities from the raw message
2. **route_intent** — Conditional routing based on intent name and current checkout stage
3. **Business Nodes:**
   - `product_node` — Searches products by extracted criteria
   - `recommendation_node` — Generates product recommendations
   - `delivery_node` — Looks up delivery charges
   - `policy_node` — Returns store policies
   - `order_node` — Order tracking and cancellation
   - `purchase_node` — Initiates purchase flow for a product
   - `cart_node` — Cart add/remove/view/clear operations
   - `checkout_node` — Multi-stage checkout (name → phone → address → city → payment → confirm)
4. **response_node** — LLM generates a natural language reply using full context (products, cart, order, delivery, history)

State is persisted to MongoDB between turns via `save_session_state()` and `load_session_state()`.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express.js, Mongoose ODM |
| AI Service | Python 3.13+, FastAPI, LangGraph, LangChain |
| Database | MongoDB Atlas |
| AI Model | OpenAI GPT-4.1-mini (via OpenRouter) |
| Messaging | WhatsApp Cloud API, Instagram Graph API |
| Containerization | Docker, Docker Compose |
| Authentication | JWT, bcrypt |

## Features

### Customer Features
- Natural language product search (by name, category, color, size, price, season)
- AI-powered product recommendations
- Shopping cart management via chat
- Guided checkout flow with address and payment collection
- Order placement and tracking
- Multi-channel support (web, WhatsApp, Instagram)

### Admin Features
- Product management (add, edit, delete, bulk import)
- Customer management with order history
- Order management (view, update status)
- Delivery settings configuration
- Admin dashboard with analytics

### Technical Features
- Auto-creation of customer profiles for WhatsApp/Instagram leads
- Customer validation at order boundary
- Stale session state detection and cleanup
- 60-second API timeout for LLM response window

## Frontend

The React SPA uses a modular component architecture with:
- **ChatInterface** — Main chat UI with message bubbles
- **Sidebar** — Session management with New Chat, history list, delete
- **Header** — Customer profile selector dropdown
- **ChatInput** — Message input with send button
- Custom `useChat` hook for session management with unique session IDs
- Axios-based API client with 60-second timeout

## Backend

The Express server provides RESTful APIs organized by domain:
- `/api/admin/*` — Admin authentication and dashboard
- `/api/products/*` — Product CRUD
- `/api/customers/*` — Customer management
- `/api/orders/*` — Order management
- `/api/chat` — Chat message relay to AI service
- `/api/whatsapp/webhook` — WhatsApp message ingestion
- `/api/instagram/webhook` — Instagram message ingestion

## Testing

### Validation Tests
- Customer validation at order boundary verified
- Auto-create customer for new WhatsApp/Instagram contacts verified
- Returning customer deduplication verified
- Session isolation with unique session IDs verified
- Fallthrough guard prevents order placement without valid customer ID

### Known Issues
- Delivery charge in bot confirmation prompt uses 0 when state delivery is None
- LLM may occasionally hallucinate product details when data is ambiguous

## Deployment

```bash
# Production build
cd frontend && npm run build

# Docker deployment
docker-compose up --build
```

Three containers:
- **nginx-frontend** — Serves React build, proxies /api to backend
- **express-backend** — Node.js API server
- **fastapi-ai** — Python AI service

Environment configuration via `.env` files for each service.

## Challenges

| Challenge | Solution |
|-----------|----------|
| LLM hallucinating order success | Three-layer guard: customer validation, fallthrough check, response_node early return |
| Session memory leaking between conversations | Unique session IDs using timestamp+random |
| Intent classification without context | Added checkout stage context to understanding prompt |
| WhatsApp/Instagram leads rejected | Auto-create customer profiles on first contact |
| OpenRouter credit exhaustion | Configurable model fallback to free tier models |

## Future Scope

- Implement delivery charge calculation in the confirmation prompt
- Add customer self-registration frontend page
- Integrate payment gateway (Stripe, PayPal)
- Add product image upload with cloud storage
- Implement real-time order tracking with notifications
- Add multilingual support
- Implement A/B testing for AI prompts
- Add comprehensive test suite with CI/CD pipeline

## Conclusion

FashionHub AI Assistant demonstrates a production-ready conversational AI system for e-commerce. The LangGraph-based workflow provides robust state management across multi-turn conversations. The three-tier architecture separates concerns cleanly, and the platform-agnostic design enables expansion to additional messaging channels. With proper monitoring and gradual enhancement of the identified known issues, this system is ready for production deployment.
