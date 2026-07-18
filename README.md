# FashionHub AI Sales Assistant

Admin dashboard + Node API + Python AI service for WhatsApp sales automation.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB
- **AI:** FastAPI + LangGraph (`ai-service`)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit MONGO_URI, JWT_SECRET, AI_SERVICE_URL, Twilio keys
npm install
npm run dev
```

Runs on `http://localhost:5000`.

### 2. AI service

```bash
cd ai-service
# set GOOGLE_API_KEY, MONGODB_URI, DATABASE_NAME in .env
pip install -r requirements.txt
# also install: pymongo langchain-google-genai
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, register an admin, then use the console.

## What the admin can do

- Add / edit / delete products
- View customers, orders, conversations
- Train AI Q&A responses
- Test AI chat (and optionally persist conversations)
- Export CSV data
- Update store settings

## AI + WhatsApp flow

1. Customer messages WhatsApp (Twilio webhook → `POST /api/whatsapp/webhook`)
2. Backend finds/creates customer + conversation
3. Backend calls AI service `POST /chat`
4. Reply is saved and sent back via Twilio

Use **AI Tester** in the dashboard to exercise the same path without Twilio.
