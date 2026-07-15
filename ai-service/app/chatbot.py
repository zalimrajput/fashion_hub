from app.services.ai_service import AIService

ai = AIService()


def ask_chatbot(session_id: str, message: str):
    return ai.chat(session_id, message)