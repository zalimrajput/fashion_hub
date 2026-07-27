from datetime import datetime
import uuid
from bson import ObjectId

from app.database import get_database

from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.customer_repository import CustomerRepository

from app.services.setting_service import SettingService
from app.services.inventory_history_service import InventoryHistoryService



class OrderService:


    def __init__(self):

        self.order_repository = OrderRepository()

        self.product_repository = ProductRepository()

        self.customer_repository = CustomerRepository()

        self.setting_service = SettingService()

        self.inventory_history = InventoryHistoryService()



    async def generate_order_id(self):

        return "ORD-" + uuid.uuid4().hex[:8].upper()




    async def create_order(

        self,

        customer_id,

        items,

        shipping_address,

        city,

        province,

        payment_method="Cash on Delivery",

        notes=""

    ):


        database = get_database()

        client = database.client


        session = await client.start_session()



        try:


            async with session.start_transaction():


                order_items = []

                subtotal = 0

                total_discount = 0



                # =========================
                # Validate Products
                # =========================


                for item in items:


                    product = await self.product_repository.get_by_id(
                        item["product"]
                    )


                    if not product:

                        raise Exception(
                            "Product not found"
                        )



                    quantity = item.get(
                        "quantity",
                        1
                    )



                    if product["stock"] < quantity:

                        raise Exception(
                            f"{product['productName']} is out of stock"
                        )



                    price = product["price"]


                    discount_percentage = product.get(
                        "discount",
                        0
                    )



                    discount_amount = (
                        price *
                        discount_percentage /
                        100
                    )



                    final_price = (
                        price -
                        discount_amount
                    )



                    item_total = (
                        final_price *
                        quantity
                    )



                    subtotal += item_total


                    total_discount += (
                        discount_amount *
                        quantity
                    )



                    order_items.append({

                        "product": product["_id"],

                        "productName":
                            product["productName"],

                        "quantity":
                            quantity,

                        "selectedSize":
                            item.get("selectedSize",""),

                        "selectedColor":
                            item.get("selectedColor",""),

                        "originalPrice":
                            price,

                        "discountPercentage":
                            discount_percentage,

                        "discountAmount":
                            discount_amount,

                        "finalPrice":
                            final_price,

                        "subtotal":
                            item_total

                    })



                # =========================
                # Delivery Calculation
                # =========================


                delivery_data = await self.setting_service.calculate_delivery_charge(

                    city,

                    province

                )


                delivery_charge = delivery_data["charge"]



                delivery_settings = await self.setting_service.get_delivery_settings()



                if subtotal >= delivery_settings["freeDeliveryAbove"]:

                    delivery_charge = 0



                grand_total = (

                    subtotal +

                    delivery_charge

                )



                # =========================
                # Create Order
                # =========================


                order = {


                    "orderId":
                        await self.generate_order_id(),


                    "customer":
                        customer_id,


                    "products":
                        order_items,


                    "subtotal":
                        subtotal,


                    "totalDiscount":
                        total_discount,


                    "deliveryCharges":
                        delivery_charge,


                    "grandTotal":
                        grand_total,


                    "paymentMethod":
                        payment_method,


                    "paymentStatus":
                        "Pending",


                    "status":
                        "Pending",


                    "trackingNumber":
                        "",


                    "shippingAddress":
                        shipping_address,


                    "city":
                        city,


                    "province":
                        province,


                    "notes":
                        notes,


                    "createdAt":
                        datetime.utcnow(),


                    "updatedAt":
                        datetime.utcnow()

                }



                saved_order = await self.order_repository.create(

                    order,

                    session=session

                )



                # =========================
                # Reduce Stock
                # =========================


                for item in items:


                    await self.product_repository.update_stock(

                        item["product"],

                        item["quantity"],

                        session=session

                    )



                # =========================
                # Customer History
                # =========================


                await self.customer_repository.add_order_history(

                    customer_id,

                    saved_order["_id"],

                    session=session

                )


                return saved_order




        except Exception as error:


            await session.abort_transaction()

            raise error



        finally:

            await session.end_session()




    async def get_order(self, order_id):

        return await self.order_repository.get_by_id(
            order_id
        )



    async def get_customer_orders(self, customer_id):

        return await self.order_repository.get_by_customer(
            customer_id
        )



    async def update_status(self, order_id, status):

        return await self.order_repository.update_status(
            order_id,
            status
        )



    async def update_tracking(self, order_id, tracking_number):

        return await self.order_repository.update_tracking(
            order_id,
            tracking_number
        )
        
        
    async def get_orders(self):

     return await self.order_repository.get_all()  
 
 
    async def update_order(
     self,
     order_id,
     data
    ):

     return await self.order_repository.update(
        order_id,
        data
    )  
     
     
     
    async def delete_order(
     self,
     order_id
    ):

     return await self.order_repository.delete(
        order_id
    )
     
     
     
    async def get_order_by_number(
     self,
     order_number
    ):

     return await self.order_repository.get_by_order_number(
        order_number
    ) 
     
     
    async def cancel_order(
    self,
    order_number
):

     return await self.order_repository.cancel_order(
        order_number
    )

    async def get_order_by_tracking(
        self,
        tracking_number
    ):
        return await self.order_repository.get_by_tracking(
            tracking_number
        )
    
    
    async def cancel_order_with_restore(
        self,
        order_number
    ):
        order = await self.order_repository.get_by_order_number(order_number)
        if not order:
            raise ValueError(f"Order {order_number} not found.")
        if order.get("status") == "Cancelled":
            raise ValueError(f"Order {order_number} is already cancelled.")

        database = get_database()
        client = database.client
        session = await client.start_session()

        try:
            async with session.start_transaction():
                for item in order.get("products", []):
                    product_id = str(item.get("product", ""))
                    if product_id and ObjectId.is_valid(product_id):
                        product = await self.product_repository.get_by_id(product_id)
                        if product:
                            qty_before = product["stock"]
                            await self.product_repository.increase_stock(
                                product_id, item.get("quantity", 1), session=session
                            )
                            await self.inventory_history.record_cancellation(
                                order_id=order["orderId"],
                                product_id=product_id,
                                product_name=item.get("productName", ""),
                                quantity_before=qty_before,
                                quantity_after=qty_before + item.get("quantity", 1),
                                quantity_restored=item.get("quantity", 1),
                            )

                await self.order_repository.update_status(
                    order_number, "Cancelled", session=session
                )

            return await self.order_repository.get_by_order_number(order_number)

        except Exception as error:
            await session.abort_transaction()
            raise error
        finally:
            await session.end_session()