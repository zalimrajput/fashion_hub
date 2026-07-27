from app.repositories.customer_channel_repository import (
    CustomerChannelRepository
)


from app.models.customer_channel import (
    customer_channel_model
)



class CustomerChannelService:


    def __init__(self):

        self.repository = CustomerChannelRepository()



    async def get_or_create_channel(
        self,
        customer_id,
        platform,
        platform_user_id
    ):


        existing = await self.repository.find_by_platform_user(
            platform,
            platform_user_id
        )


        if existing:

            return existing



        channel = customer_channel_model(

            customer_id,

            platform,

            platform_user_id

        )


        return await self.repository.create(
            channel
        )



    async def find_customer_channel(
      self,
      platform,
      platform_user_id
    ):

       channel = await self.repository.find_by_platform_user(
           platform,
           platform_user_id
        )


       if channel:

         return channel


       return None