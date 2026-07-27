# FashionHub AI Assistant

An intelligent e-commerce fashion assistant powered by AI that enables customers to browse products, get recommendations, manage carts, and complete purchases through a natural language chat interface.

## Features

- **AI-Powered Chat** — Natural language understanding for product search, purchase, checkout, order tracking, and returns
- **Product Search** — Search by name, category, color, size, price range, season, and gender
- **Personalized Recommendations** — AI-driven product recommendations based on customer preferences
- **Shopping Cart** — Full cart management with add, remove, view, and clear operations
- **Checkout Flow** — Guided checkout collecting name, phone, address, city, and payment method
- **Order Management** — Order placement, tracking, and cancellation with stock restoration
- **Multi-Platform** — Web (React), WhatsApp, and Instagram channels
- **Customer Management** — Auto-creation for WhatsApp/Instagram leads, customer profiles with order history
- **Admin Dashboard** — Manage products, customers, orders, and settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express.js, Mongoose |
| AI Service | Python, FastAPI, LangGraph, LangChain |
| Database | MongoDB Atlas |
| AI Model | OpenAI GPT-4.1-mini via OpenRouter |
| AI Orchestration | LangGraph (stateful workflow with conditional routing) |
| Messaging | WhatsApp Cloud API, Instagram Graph API |
| Containerization | Docker, Docker Compose |

## Folder Structure

```
FashiobHUb/
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # React components (Chat, Sidebar, Header, etc.)
│   │   ├── hooks/            # Custom hooks (useChat)
│   │   └── services/         # API client (axios)
│   ├── public/
│   └── dist/                 # Production build output
├── backend/                  # Node.js Express API
│   ├── controllers/          # Route handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route definitions
│   ├── services/             # Business logic (aiService, etc.)
│   ├── middleware/            # Auth middleware
│   ├── config/               # Configuration
│   ├── seed/                 # Database seed data
│   └── uploads/              # Product images
├── ai-service/               # Python AI orchestration
│   ├── app/
│   │   ├── graph/            # LangGraph workflow (nodes, builder)
│   │   ├── llm/              # Prompts, response generation, intent understanding
│   │   ├── tools/            # Tool implementations (product, cart, order, etc.)
│   │   ├── services/         # Business services (order, recommendation)
│   │   ├── repositories/     # Database access layer
│   │   ├── memory/           # Chat session persistence
│   │   └── models/           # Pydantic request/response models
│   ├── tests/
│   └── Dockerfile
├── docker-compose.yml
└── .gitignore
```

## Installation

### Prerequisites
- Node.js >= 18
- Python >= 3.11
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key

### Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# AI Service
cd ../ai-service
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

## Environment Variables

### Backend (`backend/.env`)
```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/fashionhub
AI_SERVICE_URL=http://127.0.0.1:8000/chat
ADMIN_EMAIL=admin@fashionhub.local
JWT_SECRET=your_jwt_secret
```

### AI Service (`ai-service/.env`)
```
OPENROUTER_API_KEY=sk-or-v1-...
MODEL_NAME=openai/gpt-4.1-mini
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/ai_sales_assistant
DATABASE_NAME=ai_sales_assistant
HOST=127.0.0.1
PORT=8000
DEBUG=True
PUBLIC_URL=http://localhost:5000
```

## Running

### Frontend (port 5173)
```bash
cd frontend
npm run dev
```

### Backend (port 5000)
```bash
cd backend
npm start
```

### AI Service (port 8000)
```bash
cd ai-service
.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Overview

### Chat
- `POST /api/chat` — Send a chat message to the AI assistant
  - Body: `{ session_id, message, customer_id?, platform?, history? }`
  - Response: `{ reply, intent, sentiment, entities, products }`

### Customer Auth
- `POST /api/customer-auth/register` — Register new customer
- `POST /api/customer-auth/login` — Login customer

### Admin
- `POST /api/admin/login` — Admin login (default: admin@fashionhub.local / 12345)
- CRUD for products, customers, orders, settings

### WhatsApp / Instagram
- `POST /api/whatsapp/webhook` — WhatsApp message webhook
- `POST /api/instagram/webhook` — Instagram message webhook

## Architecture

The AI assistant uses a stateful LangGraph workflow that processes each message through:

1. **Understand Node** — Classifies intent and extracts entities using LLM
2. **Route Intent** — Routes to the appropriate business node based on intent + checkout stage
3. **Business Nodes** — Execute domain logic (product search, cart, checkout, purchase, etc.)
4. **Response Node** — Generates natural language reply using LLM with full context

State is persisted to MongoDB between turns, enabling multi-turn conversations with context retention.

## Deployment

```bash
# Build frontend
cd frontend && npm run build   # outputs to dist/

# Using Docker Compose
docker-compose up --build
```

The production deployment consists of three containers:
- **Frontend** — Nginx serving the React build, proxying API calls
- **Backend** — Express API server
- **AI Service** — FastAPI + LangGraph workflow

## Contributors

- M Mujeeb ur Rahman  (https://github.com/Engr-Mujeeb-Rahman)
- Hasham Mustafa
- Muhammad Anas
- Muaz Nadeem
- Minahil Azhar (https://github.com/zalimrajput)
- Arbaz Khalid
- Qatada

## License

MIT License
