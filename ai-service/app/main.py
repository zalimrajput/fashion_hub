from fastapi import FastAPI

from app.chatbot import ask_chatbot
from app.models import ChatRequest, ChatResponse
from app.core.database import Database

app = FastAPI(
    title="FashionHub AI Service"
)

Database.connect()


@app.get("/")
def home():
    return {
        "message": "FashionHub AI Service Running"
    }


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    answer = ask_chatbot(
        request.session_id,
        request.message
    )

    return ChatResponse(reply=answer)