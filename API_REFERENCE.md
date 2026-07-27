# Fashion Hub AI Assistant — API Reference

**Version:** 2.0.0  
**Base URLs:**
| Service          | Base URL               |
|------------------|------------------------|
| FastAPI AI       | `http://localhost:8000` |
| Express Backend  | `http://localhost:5000` |

---

## 1. FastAPI AI Service

### POST /chat

**Description:** Main chat endpoint that processes natural language messages through the LangGraph workflow. Accepts a user message along with session and optional customer context, runs it through intent classification, entity extraction, sentiment analysis, and a multi-node graph pipeline, then returns an AI-generated reply.

#### Request Schema

```json
{
  "session_id": "string (required)",
  "message": "string (required)",
  "customer_id": "string (optional)",
  "platform": "string (optional, e.g. 'web', 'whatsapp')",
  "history": [
    {
      "role": "string ('user' | 'assistant')",
      "content": "string"
    }
  ]
}
```

| Field         | Type     | Required | Description                                        |
|---------------|----------|----------|----------------------------------------------------|
| `session_id`  | string   | Yes      | Unique identifier for the chat session             |
| `message`     | string   | Yes      | The user's natural language message                |
| `customer_id` | string   | No       | Registered customer ID (if authenticated)          |
| `platform`    | string   | No       | Source platform (defaults to `"web"` if omitted)   |
| `history`     | array    | No       | Previous conversation turns for context            |

**history item schema:**

| Field     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `role`    | string | Either `"user"` or `"assistant"`     |
| `content` | string | The message text                     |

#### Response Schema

```json
{
  "reply": "string",
  "intent": {
    "intent": "string",
    "confidence": 0.0,
    "customer_goal": "string"
  },
  "sentiment": {
    "sentiment": "string"
  },
  "entities": {
    "category": "string",
    "subCategory": "string",
    "productName": "string",
    "gender": "string",
    "color": "string",
    "size": "string",
    "season": "string",
    "budget": "string",
    "minPrice": "string",
    "maxPrice": "string",
    "trend": "string",
    "city": "string",
    "province": "string",
    "order_id": "string",
    "tracking_number": "string",
    "quantity": "string",
    "bestSeller": "string",
    "discount": "string",
    "rating": "string",
    "sort_by": "string",
    "sort_order": "string"
  }
}
```

| Field       | Type   | Description                                                |
|-------------|--------|------------------------------------------------------------|
| `reply`     | string | AI-generated natural language response to the user         |
| `intent`    | object | Classified intent with confidence score and customer goal  |
| `sentiment` | object | Detected sentiment of the user message                     |
| `entities`  | object | Extracted entities (product properties, location, etc.)    |

**Valid intents:**

`greeting`, `goodbye`, `product_search`, `product_details`, `recommendation`, `price_inquiry`, `discount_inquiry`, `size_inquiry`, `color_inquiry`, `stock_inquiry`, `delivery_inquiry`, `order_placement`, `order_tracking`, `order_cancellation`, `return_policy`, `exchange_policy`, `refund_request`, `complaint`, `human_support`, `general_question`, `availability`, `compare_products`, `purchase`, `cart_add`, `cart_remove`, `cart_show`, `cart_clear`, `checkout`, `other`

**Valid sentiments:** `happy`, `interested`, `neutral`, `frustrated`, `angry`

#### Status Codes

| Code | Description                            |
|------|----------------------------------------|
| 200  | Success — AI response generated        |
| 422  | Validation Error — required fields missing or malformed (Pydantic) |
| 500  | Internal Server Error — AI service not ready or unexpected failure |

---

#### Example: Greeting

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_001",
    "message": "Hello",
    "customer_id": null,
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "Hello! Welcome to Fashion Hub. How can I assist you today? You can ask me about products, check your order status, or get style recommendations.",
  "intent": {
    "intent": "greeting",
    "confidence": 0.98,
    "customer_goal": "Hello"
  },
  "sentiment": {
    "sentiment": "happy"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Product Search

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_001",
    "message": "Show me black jackets under 5000",
    "customer_id": null,
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "Here are the black jackets within your budget of PKR 5,000:\n\n1. **Classic Black Bomber Jacket** — PKR 4,500 (Sizes: M, L, XL)\n2. **Slim Fit Black Leather Jacket** — PKR 4,990 (Sizes: S, M, L)\n\nWould you like more details on any of these?",
  "intent": {
    "intent": "product_search",
    "confidence": 0.95,
    "customer_goal": "Show me black jackets under 5000"
  },
  "sentiment": {
    "sentiment": "interested"
  },
  "entities": {
    "category": "jackets",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "Black",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "5000",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Add to Cart

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_002",
    "message": "Add 2 Premium Polo Shirts to my cart",
    "customer_id": "cust_456",
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "I've added **2× Premium Polo Shirt** (PKR 1,299 each) to your cart. Your cart total is now PKR 2,598. Would you like to continue shopping or proceed to checkout?",
  "intent": {
    "intent": "cart_add",
    "confidence": 0.97,
    "customer_goal": "Add 2 Premium Polo Shirts to my cart"
  },
  "sentiment": {
    "sentiment": "interested"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "Premium Polo Shirt",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "2",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Show Cart

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_002",
    "message": "Show my cart",
    "customer_id": "cust_456",
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "Here's your cart:\n\n1. **Premium Polo Shirt** × 2 — PKR 2,598\n2. **Denim Jeans** × 1 — PKR 1,999\n\n**Total: PKR 4,597**\n\nWould you like to checkout or add more items?",
  "intent": {
    "intent": "cart_show",
    "confidence": 0.99,
    "customer_goal": "Show my cart"
  },
  "sentiment": {
    "sentiment": "neutral"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Price Inquiry

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_003",
    "message": "What is the price of Premium Polo Shirt",
    "customer_id": null,
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "The **Premium Polo Shirt** is priced at PKR 1,299. It's available in Black, White, and Navy. Would you like to add it to your cart?",
  "intent": {
    "intent": "price_inquiry",
    "confidence": 0.96,
    "customer_goal": "What is the price of Premium Polo Shirt"
  },
  "sentiment": {
    "sentiment": "interested"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "Premium Polo Shirt",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Recommendation

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_004",
    "message": "Give me some recommendations for winter clothes",
    "customer_id": null,
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "Here are our top winter recommendations for you:\n\n1. **Wool Blend Overcoat** — PKR 6,499 (Black, Grey)\n2. **Fleece Hoodie** — PKR 2,299 (Navy, Maroon)\n3. **Thermal Innerwear Set** — PKR 1,499\n4. **Leather Gloves** — PKR 899\n\nAll items are in stock. Would you like details on any of these?",
  "intent": {
    "intent": "recommendation",
    "confidence": 0.94,
    "customer_goal": "Give me some recommendations for winter clothes"
  },
  "sentiment": {
    "sentiment": "interested"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "",
    "size": "",
    "season": "winter",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Order Tracking

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_005",
    "message": "Track order ORD-1004",
    "customer_id": "cust_456",
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "**Order ORD-1004**\n- **Status:** Shipped\n- **Items:** 1× Premium Polo Shirt (Black, M)\n- **Total:** PKR 1,299\n- **Estimated Delivery:** July 28, 2026\n- **Courier:** TCS (Tracking: TCS-789012)\n\nYour package is on its way!",
  "intent": {
    "intent": "order_tracking",
    "confidence": 0.98,
    "customer_goal": "Track order ORD-1004"
  },
  "sentiment": {
    "sentiment": "neutral"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "ORD-1004",
    "tracking_number": "TCS-789012",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Delivery Inquiry

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_006",
    "message": "What are your delivery charges for Lahore",
    "customer_id": null,
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "For **Lahore**, we offer:\n- **Standard Delivery:** PKR 150 (3–5 business days)\n- **Express Delivery:** PKR 350 (1–2 business days)\n- **Free Shipping** on orders above PKR 3,000\n\nCash on Delivery is available for Lahore. Would you like to place an order?",
  "intent": {
    "intent": "delivery_inquiry",
    "confidence": 0.93,
    "customer_goal": "What are your delivery charges for Lahore"
  },
  "sentiment": {
    "sentiment": "neutral"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "Lahore",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Checkout

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_002",
    "message": "Checkout",
    "customer_id": "cust_456",
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "Let's proceed with checkout!\n\n**Cart Summary:**\n1. Premium Polo Shirt × 2 — PKR 2,598\n2. Denim Jeans × 1 — PKR 1,999\n**Total: PKR 4,597**\n\nPlease confirm your delivery address and payment method:\n1. **Address:** 123 Main Street, Lahore\n2. **Payment:** Cash on Delivery\n\nReply 'confirm' to place your order or provide changes.",
  "intent": {
    "intent": "checkout",
    "confidence": 0.97,
    "customer_goal": "Checkout"
  },
  "sentiment": {
    "sentiment": "interested"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

#### Example: Purchase

**Request:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_007",
    "message": "I want to buy a shirt",
    "customer_id": null,
    "platform": "web",
    "history": []
  }'
```

**Response (200):**
```json
{
  "reply": "Great choice! Here are our shirts:\n\n1. **Premium Polo Shirt** — PKR 1,299 (Black, White, Navy)\n2. **Casual Linen Shirt** — PKR 1,799 (Blue, Grey)\n3. **Formal Dress Shirt** — PKR 2,299 (White, Light Blue)\n\nWhich one would you like to purchase? Please specify the color and size as well.",
  "intent": {
    "intent": "purchase",
    "confidence": 0.88,
    "customer_goal": "I want to buy a shirt"
  },
  "sentiment": {
    "sentiment": "interested"
  },
  "entities": {
    "category": "",
    "subCategory": "",
    "productName": "",
    "gender": "",
    "color": "",
    "size": "",
    "season": "",
    "budget": "",
    "minPrice": "",
    "maxPrice": "",
    "trend": "",
    "city": "",
    "province": "",
    "order_id": "",
    "tracking_number": "",
    "quantity": "",
    "bestSeller": "",
    "discount": "",
    "rating": "",
    "sort_by": "",
    "sort_order": ""
  }
}
```

---

### GET /

**Description:** Health check endpoint for the AI service.

**Response (200):**
```json
{
  "status": "running",
  "service": "FashionHub AI"
}
```

---

## 2. Express.js Backend API

Base URL: `http://localhost:5000`

### Products

| Method | Endpoint             | Auth   | Description                          |
|--------|----------------------|--------|--------------------------------------|
| GET    | `/api/products`      | Public | List all products (with optional filters) |
| GET    | `/api/products/:id`  | Public | Get a single product by ID           |
| POST   | `/api/products`      | Admin  | Create a product (multipart/form-data with images) |
| PUT    | `/api/products/:id`  | Admin  | Update a product (multipart/form-data with images) |
| DELETE | `/api/products/:id`  | Admin  | Delete a product                     |

**Auth:** `authMiddleware` (admin JWT token in `Authorization: Bearer <token>` header) for create/update/delete.  
**Note:** POST and PUT accept `multipart/form-data` with up to 5 image files via the `images` field.

---

### Orders

| Method | Endpoint            | Auth   | Description              |
|--------|---------------------|--------|--------------------------|
| GET    | `/api/orders`       | Admin  | List all orders          |
| GET    | `/api/orders/:id`   | Admin  | Get order by ID          |
| POST   | `/api/orders`       | Admin  | Create a new order       |
| PUT    | `/api/orders/:id`   | Admin  | Update an order          |
| DELETE | `/api/orders/:id`   | Admin  | Delete an order          |

**Auth:** `authMiddleware` on all routes.

---

### Customers

| Method | Endpoint              | Auth   | Description              |
|--------|-----------------------|--------|--------------------------|
| GET    | `/api/customers`      | Admin  | List all customers       |
| GET    | `/api/customers/:id`  | Admin  | Get customer by ID       |
| POST   | `/api/customers`      | Admin  | Create a new customer    |
| PUT    | `/api/customers/:id`  | Admin  | Update a customer        |
| DELETE | `/api/customers/:id`  | Admin  | Delete a customer        |

**Auth:** `authMiddleware` on all routes.

---

### Customer Auth

| Method | Endpoint                          | Auth     | Description                       |
|--------|-----------------------------------|----------|-----------------------------------|
| POST   | `/api/customer-auth/register`     | Public   | Register a new customer account   |
| POST   | `/api/customer-auth/login`        | Public   | Login and receive JWT token       |
| GET    | `/api/customer-auth/profile`      | Customer | Get authenticated customer profile |
| PUT    | `/api/customer-auth/profile`      | Customer | Update authenticated profile      |
| PUT    | `/api/customer-auth/change-password` | Customer | Change password                 |

**Auth:** `customerAuthMiddleware` (customer JWT token) for profile and password routes.

---

### Admin

| Method | Endpoint                   | Auth   | Description                       |
|--------|----------------------------|--------|-----------------------------------|
| POST   | `/api/admin/register`      | Public | Register a new admin account      |
| POST   | `/api/admin/login`         | Public | Login and receive JWT token       |
| GET    | `/api/admin/profile`       | Admin  | Get authenticated admin profile   |
| PUT    | `/api/admin/profile`       | Admin  | Update authenticated admin profile |

**Auth:** `authMiddleware` for profile routes.

---

### Chat

| Method | Endpoint    | Auth   | Description                                      |
|--------|-------------|--------|--------------------------------------------------|
| POST   | `/api/chat` | Public | Send a message through the AI assistant           |

**Request body:**
```json
{
  "session_id": "string",
  "message": "string",
  "customer_id": "string (optional)",
  "platform": "string (optional)",
  "phoneNumber": "string (optional)",
  "history": []
}
```

The backend proxies this request to the FastAPI AI service (`http://127.0.0.1:8000/chat`) and stores the conversation in MongoDB before returning the AI response.

---

### WhatsApp

| Method | Endpoint                   | Auth   | Description                                      |
|--------|----------------------------|--------|--------------------------------------------------|
| GET    | `/api/whatsapp/webhook`    | Public | Meta webhook verification (handles hub.challenge) |
| POST   | `/api/whatsapp/webhook`    | Public | Receive incoming WhatsApp messages from Meta      |

The GET webhook endpoint handles the verification challenge from Meta. The POST endpoint receives incoming WhatsApp messages and processes them through the AI assistant.

---

### Conversations

| Method | Endpoint                   | Auth   | Description              |
|--------|----------------------------|--------|--------------------------|
| GET    | `/api/conversations`       | Admin  | List all conversations   |
| POST   | `/api/conversations`       | Admin  | Create a conversation    |
| GET    | `/api/conversations/:id`   | Admin  | Get conversation by ID   |
| PUT    | `/api/conversations/:id`   | Admin  | Update a conversation    |
| DELETE | `/api/conversations/:id`   | Admin  | Delete a conversation    |

**Auth:** `authMiddleware` on all routes.

---

### Settings

| Method | Endpoint             | Auth   | Description                                  |
|--------|----------------------|--------|----------------------------------------------|
| GET    | `/api/settings`      | Admin  | Get store settings (singleton)               |
| POST   | `/api/settings`      | Admin  | Create store settings (singleton)            |
| PUT    | `/api/settings/:id`  | Admin  | Update store settings by ID                  |
| DELETE | `/api/settings/:id`  | Admin  | Delete store settings by ID                  |

**Auth:** `authMiddleware` on all routes.

---

### Customer Channels

| Method | Endpoint                         | Auth   | Description                         |
|--------|----------------------------------|--------|-------------------------------------|
| POST   | `/api/customer-channel`          | Public | Create a customer-channel mapping   |

**Request body (example):**
```json
{
  "customer_id": "string",
  "channel": "whatsapp",
  "channel_id": "string"
}
```

Used to map external platform identities (e.g., WhatsApp phone numbers) to internal customer records.

---

### AI Training

| Method | Endpoint                   | Auth   | Description              |
|--------|----------------------------|--------|--------------------------|
| POST   | `/api/training`            | Admin  | Create training data     |
| GET    | `/api/training`            | Admin  | List all training data   |
| GET    | `/api/training/:id`        | Admin  | Get training data by ID  |
| PUT    | `/api/training/:id`        | Admin  | Update training data     |
| DELETE | `/api/training/:id`        | Admin  | Delete training data     |

**Auth:** `authMiddleware` on all routes.

---

## 3. Error Codes

| Code | Description                                      |
|------|--------------------------------------------------|
| 200  | **Success** — The request was processed successfully |
| 400  | **Bad Request** — Malformed request body or invalid parameters |
| 401  | **Unauthorized** — Missing or invalid JWT token   |
| 404  | **Not Found** — The requested resource does not exist |
| 422  | **Validation Error** — Request failed Pydantic validation (FastAPI) — includes field-level error details |
| 500  | **Internal Server Error** — An unexpected error occurred on the server |
