from bson import ObjectId
from datetime import datetime

from app.database import get_database


def _serialize(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


class ConversationRepository:

    def __init__(self):
        self.collection = get_database()["conversations"]

    async def create(self, conversation: dict):
        result = await self.collection.insert_one(conversation)
        conversation["_id"] = str(result.inserted_id)
        return conversation

    async def get_all(self):
        conversations = []
        cursor = self.collection.find()
        async for conversation in cursor:
            conversations.append(_serialize(conversation))
        return conversations

    async def get_by_id(self, conversation_id):
        conversation = await self.collection.find_one(
            {"_id": ObjectId(conversation_id)}
        )
        return _serialize(conversation)

    async def get_by_customer(self, customer_id):
        conversations = []
        cursor = self.collection.find({"customer": ObjectId(customer_id)})
        async for conversation in cursor:
            conversations.append(_serialize(conversation))
        return conversations

    async def get_active_conversation(self, customer_id, platform):
        conversation = await self.collection.find_one(
            {
                "customer": ObjectId(customer_id),
                "platform": platform,
                "isResolved": False,
            },
            sort=[("updatedAt", -1)],
        )
        return _serialize(conversation)

    async def update(self, conversation_id, data):
        data["updatedAt"] = datetime.utcnow()
        await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": data},
        )
        return await self.get_by_id(conversation_id)

    async def delete(self, conversation_id):
        result = await self.collection.delete_one(
            {"_id": ObjectId(conversation_id)}
        )
        return result.deleted_count > 0

    async def add_message(self, conversation_id, message_data):
        await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$push": {"messages": message_data},
                "$set": {
                    "lastMessage": message_data["message"],
                    "updatedAt": datetime.utcnow(),
                },
            },
        )
        return await self.get_by_id(conversation_id)

    async def update_analysis(self, conversation_id, intent, sentiment):
        await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": {
                    "intent": intent,
                    "lastIntent": intent,
                    "sentiment": sentiment,
                    "updatedAt": datetime.utcnow(),
                }
            },
        )
        return await self.get_by_id(conversation_id)

    async def resolve(self, conversation_id):
        await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"isResolved": True, "updatedAt": datetime.utcnow()}},
        )
        return await self.get_by_id(conversation_id)
