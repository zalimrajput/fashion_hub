from app.database import get_database


class CustomerChannelRepository:


    def __init__(self):

        self.collection = get_database()["customerchannels"]



    async def create(
        self,
        data
    ):

        result = await self.collection.insert_one(
            data
        )

        data["_id"] = str(
            result.inserted_id
        )

        return data



    async def find_by_platform_user(
        self,
        platform,
        platform_user_id
    ):

        print("\n========== FIND CHANNEL ==========")
        print("Platform:", platform)
        print("Platform User ID:", platform_user_id)


        channel = await self.collection.find_one(

            {
                "platform": platform,
                "platformUserId": platform_user_id
            }

        )


        print("Channel Found:")
        print(channel)


        if channel:

            channel["_id"] = str(
                channel["_id"]
            )


        return channel



    async def get_by_customer(
        self,
        customer_id
    ):

        channels = []


        cursor = self.collection.find(

            {
                "customerId": customer_id
            }

        )


        async for channel in cursor:


            channel["_id"] = str(
                channel["_id"]
            )


            channels.append(
                channel
            )


        return channels