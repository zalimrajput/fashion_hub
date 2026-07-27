import logging
from app.repositories.inventory_history_repository import InventoryHistoryRepository

logger = logging.getLogger("fashionhub.service")

class InventoryHistoryService:

    def __init__(self):
        self.repo = InventoryHistoryRepository()

    async def record_purchase(self, order_id: str, product_id: str,
                               product_name: str, quantity_before: int,
                               quantity_after: int, quantity_purchased: int):
        return await self.repo.record({
            "orderId": order_id,
            "productId": product_id,
            "productName": product_name,
            "changeType": "purchase",
            "quantityBefore": quantity_before,
            "quantityAfter": quantity_after,
            "delta": -quantity_purchased,
        })

    async def record_cancellation(self, order_id: str, product_id: str,
                                   product_name: str, quantity_before: int,
                                   quantity_after: int, quantity_restored: int):
        return await self.repo.record({
            "orderId": order_id,
            "productId": product_id,
            "productName": product_name,
            "changeType": "cancellation",
            "quantityBefore": quantity_before,
            "quantityAfter": quantity_after,
            "delta": quantity_restored,
        })
