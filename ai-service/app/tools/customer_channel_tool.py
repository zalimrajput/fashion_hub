from app.services.customer_channel_service import (
    CustomerChannelService
)


class CustomerChannelTool:


    def __init__(self):

        self.service = CustomerChannelService()



    async def find_customer(
        self,
        platform,
        platform_user_id
    ):


        channel = await self.service.find_customer_channel(

            platform,

            platform_user_id

        )


        if not channel:

            return None


        return str(
            channel["customerId"]
        )