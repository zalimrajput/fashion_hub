import logging
from app.services.cart_service import CartService

logger = logging.getLogger("fashionhub.tool")

class CartTool:

    def __init__(self):
        self.service = CartService()

    async def get_cart(self, customer_id: str, session_id: str) -> list:
        return await self.service.get_cart(customer_id, session_id)

    async def add_item(self, customer_id: str, session_id: str,
                       product_id: str, quantity: int = 1,
                       color: str = "", size: str = "") -> list:
        return await self.service.add_item(customer_id, session_id, product_id, quantity, color, size)

    async def update_item_quantity(self, customer_id: str, session_id: str,
                                    product_id: str, quantity: int,
                                    color: str = "", size: str = "") -> list:
        return await self.service.update_item_quantity(customer_id, session_id, product_id, quantity, color, size)

    async def remove_item(self, customer_id: str, session_id: str,
                          product_id: str, color: str = "", size: str = "") -> list:
        return await self.service.remove_item(customer_id, session_id, product_id, color, size)

    async def clear_cart(self, customer_id: str, session_id: str):
        await self.service.clear_cart(customer_id, session_id)

    def calculate_totals(self, items: list) -> dict:
        return self.service.calculate_totals(items)
