from datetime import datetime
from bson import ObjectId

from app.repositories.conversation_repository import (
    ConversationRepository
)


class ConversationService:

    def __init__(self):

        self.repository = ConversationRepository()

    async def create_conversation(
        self,
        customer_id,
        platform,
        message,
        metadata=None
    ):

        existing = await self.repository.get_active_conversation(

            customer_id,

            platform

        )

        if existing:

            await self.add_message(

                existing["_id"],

                "Customer",

                message,

                "Text",

                metadata

            )

            return await self.repository.get_by_id(
                existing["_id"]
            )

        conversation = {

            "customer": ObjectId(customer_id),

            "platform": platform,

            "messages": [

                {

                    "sender": "Customer",

                    "message": message,

                    "messageType": "Text",

                    "metadata": metadata or {},

                    "timestamp": datetime.utcnow()

                }

            ],

            "lastMessage": message,

            "intent": "",

            "lastIntent": "",

            "sentiment": "Neutral",

            "isResolved": False,

            "createdAt": datetime.utcnow(),

            "updatedAt": datetime.utcnow()

        }

        return await self.repository.create(
            conversation
        )

    async def get_conversations(self):

        return await self.repository.get_all()

    async def get_conversation_by_id(
        self,
        conversation_id
    ):

        return await self.repository.get_by_id(
            conversation_id
        )

    async def get_customer_conversations(
        self,
        customer_id
    ):

        return await self.repository.get_by_customer(
            customer_id
        )

    async def update_conversation(
        self,
        conversation_id,
        sender,
        message,
        message_type="Text",
        metadata=None,
        intent=None,
        sentiment=None,
        is_resolved=None
    ):

        await self.add_message(

            conversation_id,

            sender,

            message,

            message_type,

            metadata

        )

        if intent is not None or sentiment is not None:

            await self.update_analysis(

                conversation_id,

                intent or "",

                sentiment or "Neutral"

            )

        if is_resolved:

            await self.resolve_conversation(
                conversation_id
            )

        return await self.repository.get_by_id(
            conversation_id
        )

    async def delete_conversation(
        self,
        conversation_id
    ):

        return await self.repository.delete(
            conversation_id
        )

    async def add_message(
        self,
        conversation_id,
        sender,
        message,
        message_type="Text",
        metadata=None
    ):

        message_data = {

            "sender": sender,

            "message": message,

            "messageType": message_type,

            "metadata": metadata or {},

            "timestamp": datetime.utcnow()

        }

        return await self.repository.add_message(

            conversation_id,

            message_data

        )

    async def update_analysis(
        self,
        conversation_id,
        intent,
        sentiment
    ):

        return await self.repository.update_analysis(

            conversation_id,

            intent,

            sentiment

        )

    async def resolve_conversation(
        self,
        conversation_id
    ):

        return await self.repository.resolve(
            conversation_id
        )
        
        
    async def update_conversation_by_id(
       self,
       conversation_id,
       data
    ):

      return await self.repository.update(
        conversation_id,
        data
    )     