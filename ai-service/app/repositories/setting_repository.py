from bson import ObjectId

from app.database import get_database


class SettingRepository:

    def __init__(self):
        self.collection = get_database()["settings"]


    async def create(self, data):

        result = await self.collection.insert_one(
            data
        )

        data["_id"] = str(
            result.inserted_id
        )

        return data



    async def get_settings(self):

        settings = await self.collection.find_one()

        if settings:
            settings["_id"] = str(
                settings["_id"]
            )

        return settings



    async def update_settings(self, data):

        settings = await self.collection.find_one()

        if not settings:
            return None


        await self.collection.update_one(

            {
                "_id": settings["_id"]
            },

            {
                "$set": data
            }

        )


        return await self.get_settings()



    async def get_by_id(
        self,
        setting_id
    ):

        return await self.collection.find_one(

            {
                "_id": ObjectId(setting_id)
            }

        )



    async def delete_settings(self):

        settings = await self.collection.find_one()

        if not settings:
            return False


        result = await self.collection.delete_one(

            {
                "_id": settings["_id"]
            }

        )


        return result.deleted_count > 0
