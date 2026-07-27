# Deployment Guide

## Prerequisites

- Python 3.13+
- Node.js 20+
- npm 10+
- MongoDB Atlas account (or local MongoDB 7+)
- Google Gemini API key

---

## Local Development Deployment

### 1. Clone and Configure

```bash
git clone <repository-url>
cd fashion-hub-ai-assistant
```

### 2. AI Service Setup

```bash
cd ai-service
python -m venv myenv
# Windows:
myenv\Scripts\activate
# macOS/Linux:
# source myenv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Run the Services

**Terminal 1 — AI Service:**
```bash
cd ai-service
myenv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend (optional for frontend development):**
```bash
cd frontend
npm run dev
```

**Terminal 3 — Backend (optional for admin API):**
```bash
cd backend
node server.js
```

The frontend Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`.
Access the app at `http://localhost:5173`.

---

## Docker Deployment

### Build and Run All Services

```bash
docker-compose up --build
```

Services:
- **ai-service** — FastAPI on port 8000
- **frontend** — Nginx on port 80 (serves React SPA and proxies /api to ai-service)
- ~~mongodb~~ — Optional (uncomment in docker-compose.yml for local MongoDB)

### Container Details

| Container | Port | Base Image | Health Check |
|-----------|------|------------|--------------|
| fashionhub-ai | 8000 | python:3.13-slim | GET / |
| fashionhub-frontend | 80 | nginx:alpine | — |

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f ai-service
docker-compose logs -f frontend
```

---

## Production Deployment

### AI Service (FastAPI)

For production, run the AI service with multiple workers:

```bash
cd ai-service
pip install gunicorn
gunicorn app.main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile -
```

### Frontend (React SPA)

Build the production bundle:

```bash
cd frontend
npm run build
```

Serve the `dist/` directory with any web server (nginx, Caddy, Apache).

Example nginx configuration (deploy to `/etc/nginx/sites-available/fashionhub`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/fashionhub;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }
}
```

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Configure IP whitelist (include your deployment IPs)
3. Create a database user with read/write permissions
4. Copy the connection string to your `.env` file

### Environment Variables

Ensure these variables are set in production:

**ai-service/.env:**
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fashionhub
DATABASE_NAME=fashionhub
GEMINI_API_KEY=<your-gemini-key>
MODEL_NAME=gemini-2.5-flash
DEBUG=False
```

**Production security settings:**
```bash
# Restrict CORS origins (in main.py)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Troubleshooting

### AI Service won't start
- Check MongoDB URI is correct and IP is whitelisted
- Verify Gemini API key is valid
- Check `ai-service/.env` file exists and has correct values

### Frontend can't connect to backend
- Ensure AI service is running on port 8000
- Check Vite proxy configuration in `vite.config.js`
- For Docker, ensure services are on the same network

### LLM responses are empty
- Check Gemini API key quota
- Verify MODEL_NAME is set correctly
- Check network connectivity to Google AI API

### Docker issues
- Rebuild with `docker-compose build --no-cache`
- Check logs with `docker-compose logs`
- Ensure ports 80 and 8000 are not in use
