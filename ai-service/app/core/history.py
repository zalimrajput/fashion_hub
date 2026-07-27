from collections import defaultdict
from langchain_core.messages import HumanMessage, AIMessage

class ConversationHistory:

    def __init__(self):
        self.history = defaultdict(list)

    def add_user_message(self, session_id: str, message: str):
        self.history[session_id].append(
            HumanMessage(content=message)
        )

    def add_ai_message(self, session_id: str, message: str):
        self.history[session_id].append(
            AIMessage(content=message)
        )

    def get_messages(self, session_id: str):
        return self.history[session_id]

    def clear(self, session_id: str):
        self.history[session_id] = []