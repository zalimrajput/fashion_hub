# Project Structure

```
fashion-hub-ai-assistant/
├── ai-service/                # FastAPI AI microservice
│   ├── app/
│   │   ├── main.py            # FastAPI entry point, lifespan, endpoints
│   │   ├── config.py          # Environment config via pydantic-settings
│   │   ├── database.py        # MongoDB connection, index management
│   │   ├── graph/             # LangGraph workflow engine
│   │   │   ├── state.py       # GraphState TypedDict
│   │   │   ├── builder.py     # Graph construction + intent routing
│   │   │   ├── nodes.py       # Node implementations (10 nodes)
│   │   │   └── workflow.py    # Workflow wrapper with initial state
│   │   ├── llm/               # LLM integration layer
│   │   │   ├── ai_engine.py   # Gemini LLM instantiation
│   │   │   ├── prompts.py     # All prompt templates
│   │   │   ├── understand.py  # NLU: intent + sentiment + entities
│   │   │   └── response.py    # Response generation with context
│   │   ├── models/            # Pydantic schemas and data models
│   │   │   ├── request.py     # Chat request schema
│   │   │   ├── schemas.py     # Product CRUD schemas
│   │   │   ├── customer.py    # Customer document model
│   │   │   └── customer_channel.py
│   │   ├── tools/             # Domain operation tools
│   │   │   ├── product_tool.py
│   │   │   ├── cart_tool.py
│   │   │   ├── checkout_tool.py
│   │   │   ├── order_tool.py
│   │   │   ├── purchase_tool.py
│   │   │   ├── recommendation_tool.py
│   │   │   ├── setting_tool.py
│   │   │   ├── conversation_tool.py
│   │   │   ├── customer_tool.py
│   │   │   └── customer_channel_tool.py
│   │   ├── services/          # Business logic layer
│   │   │   ├── product_service.py
│   │   │   ├── cart_service.py
│   │   │   ├── checkout_service.py
│   │   │   ├── order_service.py
│   │   │   ├── recommendation_service.py
│   │   │   ├── inventory_history_service.py
│   │   │   ├── setting_service.py
│   │   │   ├── conversation_service.py
│   │   │   ├── customer_service.py
│   │   │   └── customer_channel_service.py
│   │   ├── repositories/      # Data access layer
│   │   │   ├── product_repository.py
│   │   │   ├── cart_repository.py
│   │   │   ├── order_repository.py
│   │   │   ├── customer_repository.py
│   │   │   ├── conversation_repository.py
│   │   │   ├── inventory_history_repository.py
│   │   │   ├── setting_repository.py
│   │   │   └── customer_channel_repository.py
│   │   └── utils/             # Utilities
│   │       ├── filter_builder.py  # MongoDB query builder
│   │       └── logger.py          # Logging configuration
│   ├── tests/                 # Test suite
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   └── Dockerfile             # Production container
│
├── backend/                   # Express.js admin backend
│   ├── server.js              # Express entry point
│   ├── config/                # Database and API configuration
│   │   ├── db.js              # Mongoose connection
│   │   └── metaConfig.js      # WhatsApp Meta config
│   ├── models/                # Mongoose schemas
│   │   ├── Customer.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Conversation.js
│   │   ├── Admin.js
│   │   ├── CustomerChannel.js
│   │   ├── ChatSession.js
│   │   ├── AITraining.js
│   │   └── Setting.js
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   │   ├── aiService.js       # Proxies to FastAPI AI service
│   │   ├── orderService.js    # Transactional order creation
│   │   └── whatsappService.js # Meta Cloud API sender
│   ├── routes/                # Route definitions
│   ├── middleware/             # Auth, upload, error handling
│   ├── utils/                 # JWT generation, helpers
│   ├── seed/                  # Database seeding scripts
│   └── uploads/products/      # Product image uploads
│
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── main.jsx           # React root + BrowserRouter
│   │   ├── App.jsx            # Route definitions
│   │   ├── index.css          # Tailwind CSS v4 + custom animations
│   │   ├── pages/
│   │   │   └── Home.jsx       # Main layout (sidebar + header + chat)
│   │   ├── components/
│   │   │   ├── Header.jsx         # Status bar with connection indicator
│   │   │   ├── Sidebar.jsx        # Session list with CRUD
│   │   │   ├── ChatWindow.jsx     # Message list + empty state
│   │   │   ├── ChatInput.jsx      # Textarea with auto-resize
│   │   │   ├── MessageBubble.jsx  # User/AI message with Markdown
│   │   │   └── LoadingIndicator.jsx  # Pulse-dot animation
│   │   ├── hooks/
│   │   │   └── useChat.js     # Session state + message send
│   │   └── services/
│   │       └── api.js         # Axios client
│   ├── vite.config.js         # Vite config + proxy + tailwind
│   ├── index.html             # HTML entry with Inter font
│   ├── Dockerfile             # Multi-stage production build
│   ├── nginx.conf             # Nginx config for Docker
│   └── package.json
│
├── docker-compose.yml         # Multi-container orchestration
├── .gitignore
├── LICENSE                    # MIT License
├── README.md                  # Project overview and quick start
├── CONTRIBUTING.md            # Contribution guidelines
├── CODE_OF_CONDUCT.md         # Code of conduct
├── CHANGELOG.md               # Version history
├── SECURITY.md                # Security policy
├── DEPLOYMENT.md              # Deployment guide
├── PROJECT_STRUCTURE.md       # This file
├── API_REFERENCE.md           # Full API documentation
├── DATABASE.md                # Database design documentation
├── AI_ARCHITECTURE.md         # LangGraph and LLM architecture
├── FRONTEND.md                # React frontend documentation
└── BACKEND.md                 # FastAPI backend documentation
```

## Key Architectural Directories

### `ai-service/app/graph/`
The LangGraph workflow engine. Contains the graph state definition (state.py), graph construction with intent routing (builder.py), node implementations (nodes.py), and the workflow runner (workflow.py). This is the core orchestration layer.

### `ai-service/app/llm/`
LLM integration layer. Manages the Gemini model (ai_engine.py), prompt templates (prompts.py), natural language understanding (understand.py), and response generation (response.py).

### `ai-service/app/tools/`
Domain operation tools that act as the interface between the LangGraph workflow and business services. Each tool wraps a corresponding service and provides a clean API for graph nodes.

### `ai-service/app/services/`
Business logic services implementing domain rules: product search algorithms, cart management with stock validation, multi-turn checkout flow, transactional order processing, personalized recommendations, delivery charge calculations.

### `ai-service/app/repositories/`
MongoDB data access layer using Motor async driver. Each repository handles CRUD for a single collection with optimized queries using defined indexes.

### `frontend/src/components/`
React components organized by responsibility. Each component has a single purpose: rendering messages, handling input, managing sessions, displaying status.

### `backend/models/`
Mongoose schema definitions with validation rules, data types, and relationships. These define the data contract for the Express backend.
