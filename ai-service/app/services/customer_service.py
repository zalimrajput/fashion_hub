from datetime import datetime

from app.repositories.customer_repository import (
    CustomerRepository
)


class CustomerService:


    def __init__(self):

        self.repository = CustomerRepository()



    async def create_customer(
        self,
        data
    ):

        customer = {

            "name": data.get("name",""),

            "phoneNumber":
                data.get("phoneNumber",""),

            "whatsappNumber":
                data.get("whatsappNumber",""),

            "instagramId":
                data.get("instagramId",""),

            "email":
                data.get("email",""),

            "address":
                data.get("address",""),

            "city":
                data.get("city",""),


            "preferences":
                {},


            "orderHistory":
                [],


            "createdAt":
                datetime.utcnow(),


            "updatedAt":
                datetime.utcnow()

        }


        return await self.repository.create(
            customer
        )


    async def get_all_customers(
        self
    ):

        return await self.repository.get_all()
    
    async def get_whatsapp_customer(
        self,
        whatsapp_number
    ):

        return await self.repository.find_by_whatsapp(
            whatsapp_number
        )



    async def get_instagram_customer(
        self,
        instagram_id
    ):

        return await self.repository.find_by_instagram(
            instagram_id
        )
        
        
        
    async def get_customer_by_id(
        self,
        customer_id
    ):

        return await self.repository.get_by_id(
            customer_id
        )



    async def update_customer(
        self,
        customer_id,
        data
    ):

        return await self.repository.update(
            customer_id,
            data
        )



    async def delete_customer(
        self,
        customer_id
    ):

        return await self.repository.delete(
            customer_id
        )      
        
        
        
    async def get_customer(
      self,
      customer_id
    ):
     return await self.repository.get_by_id(
        customer_id
    )    
     
     
     
    
    async def get_all_customers(
     self
    ):
     return await self.repository.get_all()
 