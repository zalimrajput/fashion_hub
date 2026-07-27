from app.services.order_service import OrderService



class OrderTool:


    def __init__(self):

        self.service = OrderService()



    async def create_order(

        self,

        customer,

        items,

        shipping_address,

        city,

        province,

        payment_method="Cash on Delivery",

        notes=""

    ):


        return await self.service.create_order(

            customer_id=customer,

            items=items,

            shipping_address=shipping_address,

            city=city,

            province=province,

            payment_method=payment_method,

            notes=notes

        )



    async def get_order(self, order_id):

        return await self.service.get_order(
            order_id
        )



    async def get_customer_orders(self, customer_id):

        return await self.service.get_customer_orders(
            customer_id
        )



    async def update_status(self, order_id, status):

        return await self.service.update_status(
            order_id,
            status
        )



    async def update_tracking(self, order_id, tracking_number):

        return await self.service.update_tracking(
            order_id,
            tracking_number
        )
        
        
        
    async def get_orders(self):

     return await self.service.get_orders()   
 
 
    async def update_order(
     self,
     order_id,
     data
    ):

     return await self.service.update_order(
        order_id,
        data
    ) 
     
     
     
    async def delete_order(
     self,
     order_id
    ):

     return await self.service.delete_order(
        order_id
    ) 
     
     
     
     
    async def get_order_by_number(
    self,
    order_number
   ):

     return await self.service.get_order_by_number(
        order_number
    )  
     
     
     
    async def cancel_order(
    self,
    order_number
):

     return await self.service.cancel_order(
        order_number
    )

    async def get_order_by_tracking(
        self,
        tracking_number
    ):
        return await self.service.get_order_by_tracking(
            tracking_number
        ) 