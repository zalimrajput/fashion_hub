from app.services.conversation_service import (
    ConversationService
)


class ConversationTool:


    def __init__(self):

        self.service = ConversationService()


    async def create_conversation(
        self,
        customer_id,
        platform,
        message,
        metadata=None
    ):

        return await self.service.create_conversation(

            customer_id,

            platform,

            message,

            metadata

        )


    async def get_conversations(self):

        return await self.service.get_conversations()


    async def get_conversation_by_id(
        self,
        conversation_id
    ):

        return await self.service.get_conversation_by_id(
            conversation_id
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

        return await self.service.update_conversation(

            conversation_id,

            sender,

            message,

            message_type,

            metadata,

            intent,

            sentiment,

            is_resolved

        )


    async def delete_conversation(
        self,
        conversation_id
    ):

        return await self.service.delete_conversation(
            conversation_id
        )
        
        
        
    async def update_conversation_by_id(
     self,
     conversation_id,
     data
    ):

     return await self.service.update_conversation_by_id(
        conversation_id,
        data
    )
     
     
     
    async def get_customer_conversations(
     self,
     customer_id
    ):
     return await self.service.get_customer_conversations(
        customer_id
    ) 