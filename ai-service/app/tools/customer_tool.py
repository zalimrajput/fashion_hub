from app.services.customer_service import (
    CustomerService
)



class CustomerTool:


    def __init__(self):

        self.service = CustomerService()



    async def create_customer(
        self,
        data
    ):

        return await self.service.create_customer(
            data
        )


    async def get_all_customers(
        self
    ):

        return await self.service.get_all_customers()
    
    
    async def whatsapp_customer(
        self,
        number
    ):

        return await self.service.get_whatsapp_customer(
            number
        )



    async def instagram_customer(
        self,
        instagram_id
    ):

        return await self.service.get_instagram_customer(
            instagram_id
        )
        
        
        
        
        
    async def get_customer_by_id(
        self,
        customer_id
    ):

        return await self.service.get_customer_by_id(
            customer_id
        )



    async def update_customer(
        self,
        customer_id,
        data
    ):

        return await self.service.update_customer(
            customer_id,
            data
        )



    async def delete_customer(
        self,
        customer_id
    ):

        return await self.service.delete_customer(
            customer_id
        )     
        
        
        
        
    async def get_customer(
      self,
      customer_id
    ):
      return await self.service.get_customer(
        customer_id
    )    