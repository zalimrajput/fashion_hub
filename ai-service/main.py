# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from ai_engine import get_ai_response

app = FastAPI()

class Message(BaseModel):
    customer_message: str
    history: list[dict] = []

@app.post("/reply")
def reply(msg: Message):
    return get_ai_response(msg.customer_message, msg.history)