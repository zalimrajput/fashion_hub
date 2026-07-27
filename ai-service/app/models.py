from pydantic import BaseModel

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str


# FastAPI uses these models to validate requests and generate API documentation automatically.