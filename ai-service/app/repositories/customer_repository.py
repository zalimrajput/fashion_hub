from datetime import datetime

from bson import ObjectId

from app.database import get_database



class CustomerRepository:


    def __init__(self):

        self.collection = get_database()["customers"]



    async def create(
        self,
        customer
    ):

        result = await self.collection.insert_one(
            customer
        )


        customer["_id"] = str(
            result.inserted_id
        )


        return customer


    async def get_all(self):

        customers = []

        cursor = self.collection.find()

        async for customer in cursor:

            customer["_id"] = str(
                customer["_id"]
            )

            customers.append(
                customer
            )

        return customers
    
    
    async def get_by_id(
        self,
        customer_id
    ):

        if not ObjectId.is_valid(customer_id):

            return None


        customer = await self.collection.find_one(

            {
                "_id": ObjectId(customer_id)
            }

        )


        if customer:

            customer["_id"] = str(
                customer["_id"]
            )


        return customer




    async def find_by_whatsapp(
      self,
      number
    ):

      customer = await self.collection.find_one(
        {
            "whatsappNumber": number
        }
    )

      if customer:
        customer["_id"] = str(customer["_id"])

      return customer
  
  
    async def find_by_instagram(
      self,
      instagram_id
    ):

      customer = await self.collection.find_one(
        {
            "instagramId": instagram_id
        }
    )

      if customer:
        customer["_id"] = str(customer["_id"])

      return customer




    async def update(
        self,
        customer_id,
        data,
        session=None
    ):


        data["updatedAt"] = datetime.utcnow()



        await self.collection.update_one(

            {
                "_id": ObjectId(customer_id)
            },

            {
                "$set": data
            },

            session=session

        )


        return await self.get_by_id(
            customer_id
        )


    async def delete(
        self,
        customer_id
    ):

        result = await self.collection.delete_one(

            {
                "_id": ObjectId(customer_id)
            }

        )

        return result.deleted_count > 0

    async def add_order_history(

        self,

        customer_id,

        order_id,

        session=None

    ):


        await self.collection.update_one(

            {
                "_id": ObjectId(customer_id)
            },


            {

                "$push":
                {

                    "orderHistory": ObjectId(order_id)

                }

            },


            session=session

        )


        return await self.get_by_id(
            customer_id
        )