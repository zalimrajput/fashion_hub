from datetime import datetime
from app.database import get_database


class ChatSessionRepository:

    def __init__(self):
        self.collection = get_database()["chatsessions"]

    async def get_by_session_id(self, session_id: str):
        doc = await self.collection.find_one({"session_id": session_id})
        return doc

    async def upsert(self, session_id: str, data: dict):
        data["updatedAt"] = datetime.utcnow()
        await self.collection.update_one(
            {"session_id": session_id},
            {"$set": data, "$setOnInsert": {"createdAt": datetime.utcnow()}},
            upsert=True,
        )
        return await self.get_by_session_id(session_id)

    async def delete_by_session_id(self, session_id: str):
        await self.collection.delete_one({"session_id": session_id})
