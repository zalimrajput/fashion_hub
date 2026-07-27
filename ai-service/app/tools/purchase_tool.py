import logging
from bson import ObjectId
from app.services.order_service import OrderService
from app.services.inventory_history_service import InventoryHistoryService
from app.repositories.product_repository import ProductRepository
from app.repositories.customer_repository import CustomerRepository

logger = logging.getLogger("fashionhub.tool")

class PurchaseTool:

    def __init__(self):
        self.order_service = OrderService()
        self.inventory_history = InventoryHistoryService()
        self.product_repo = ProductRepository()
        self.customer_repo = CustomerRepository()

    async def execute_purchase(self, customer_id: str, items: list,
                                shipping_address: str, city: str, province: str,
                                payment_method: str = "Cash on Delivery") -> dict:
        if not customer_id or not ObjectId.is_valid(customer_id):
            raise ValueError("Please select your customer profile before placing an order.")
        customer = await self.customer_repo.get_by_id(customer_id)
        if not customer:
            raise ValueError("Please select your customer profile before placing an order.")
        order = await self.order_service.create_order(
            customer_id=customer_id,
            items=items,
            shipping_address=shipping_address,
            city=city,
            province=province,
            payment_method=payment_method,
        )
        # Record inventory changes for audit trail
        for item in items:
            product = await self.product_repo.get_by_id(item["product"])
            if product:
                qty_before = product["stock"] + item.get("quantity", 1)
                qty_after = product["stock"]
                await self.inventory_history.record_purchase(
                    order_id=order["orderId"],
                    product_id=item["product"],
                    product_name=item.get("productName", ""),
                    quantity_before=qty_before,
                    quantity_after=qty_after,
                    quantity_purchased=item.get("quantity", 1),
                )
        return order

    async def cancel_order_with_restore(self, order_number: str) -> dict:
        order = await self.order_service.cancel_order_with_restore(order_number)
        return order
