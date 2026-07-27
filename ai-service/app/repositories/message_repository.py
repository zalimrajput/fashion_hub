from datetime import datetime
from app.database import get_database


class MessageRepository:

    def __init__(self):
        self.collection = get_database()["messages"]

    async def add_message(self, session_id: str, role: str, content: str, metadata: dict = None):
        doc = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow(),
        }
        await self.collection.insert_one(doc)
        return doc

    async def get_session_messages(self, session_id: str, limit: int = 50):
        cursor = (
            self.collection
            .find({"session_id": session_id})
            .sort("timestamp", 1)
            .limit(limit)
        )
        messages = []
        async for msg in cursor:
            msg["_id"] = str(msg["_id"])
            messages.append(msg)
        return messages

    async def delete_session_messages(self, session_id: str):
        await self.collection.delete_many({"session_id": session_id})
