# Changelog

All notable changes to Fashion Hub AI Assistant are documented in this file.

## [2.2] - 2026-07-24

### Added
- Complete system documentation (FashionHub_AI_Assistant_Complete_System_Documentation.docx)
- GitHub repository preparation files (README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, etc.)
- Docker support with docker-compose.yml and production Dockerfiles
- Mermaid architecture diagrams for all system components
- API_REFERENCE.md with complete endpoint documentation
- DATABASE.md with collection schemas and relationships
- AI_ARCHITECTURE.md with LangGraph workflow documentation
- FRONTEND.md with React component documentation
- BACKEND.md with FastAPI service documentation

## [2.1] - 2026-07-23

### Added
- React 19 frontend with Vite and Tailwind CSS v4
- ChatGPT-style chat interface with Markdown rendering
- Session management with sidebar (create, switch, delete sessions)
- Pulse-dot loading animation and message entrance animations
- Connection status indicator with ping animation
- Glass-morphism header with responsive design
- Mobile-responsive sidebar overlay

### Changed
- Frontend migrated from static HTML to full React SPA
- Layout restructured to ChatGPT/Claude pattern (sidebar full-height)
- CSS framework migrated to Tailwind CSS v4 with Vite plugin

## [2.0] - 2026-07-22

### Added
- Transactional inventory system with audit trail
- Inventory history collection for stock change tracking
- Automatic inventory restoration on order cancellation
- Complete multi-turn checkout flow (address, city, payment, confirm)
- Cart management with stock validation
- Direct purchase flow via "I want to buy X" intent
- Enhanced delivery charge calculation (city/province based)
- Free delivery threshold configuration

### Changed
- Order service rewritten with atomic stock operations
- Purchase flow integrated with checkout multi-turn system
- Graph state extended for cart and purchase data

## [1.5] - 2026-07-21

### Added
- Intent-specific response prompts (product, cart, checkout, order, etc.)
- Confidence threshold routing (0.3 minimum for domain-specific intents)
- Sentiment-based response tone adjustment
- Comparison response prompt for product comparisons
- Human support routing with contact information
- Enhanced extraction rules for price ranges (minPrice, maxPrice, budget)

### Changed
- Prompt engineering overhauled with SYSTEM_CORE architecture
- Response prompts extended from 6 to 11 specialized variants
- Entity extraction improved with example-based instructions

## [1.0] - 2026-07-20

### Added
- Initial FastAPI AI service with LangGraph workflow
- Gemini 2.5 Flash integration via LangChain
- Intent detection for 20+ conversation scenarios
- Sentiment analysis (happy, interested, neutral, frustrated, angry)
- Entity extraction for products, orders, and customer data
- Product search with multi-field filtering and sorting
- Personalized recommendation engine
- Order tracking and cancellation
- Delivery charge inquiry and policy information
- Conversation history support
- MongoDB Atlas integration with 6 collections
- MongoDB index management
- Express.js backend with admin API
- WhatsApp Business API integration
- JWT authentication (admin and customer)
- Multer-based product image upload
- Mongoose schemas with validation
- Basic test suite for services and repositories
