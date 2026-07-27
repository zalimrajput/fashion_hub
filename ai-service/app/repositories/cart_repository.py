import logging
from datetime import datetime
from app.database import get_database

logger = logging.getLogger("fashionhub.repository")

CART_ITEM_FIELDS = [
    "productId", "productName", "quantity", "selectedColor", "selectedSize",
    "price", "discountPercentage", "discountAmount", "finalPrice", "subtotal"
]

class CartRepository:

    def __init__(self):
        self.collection = get_database()["carts"]

    async def get_cart(self, customer_id: str, session_id: str) -> dict:
        query = self._build_query(customer_id, session_id)
        cart = await self.collection.find_one(query)
        if cart:
            cart["_id"] = str(cart["_id"])
        return cart

    async def upsert_cart(self, customer_id: str, session_id: str, items: list) -> dict:
        now = datetime.utcnow()
        query = self._build_query(customer_id, session_id)
        update = {
            "$set": {
                "customer_id": customer_id,
                "session_id": session_id,
                "items": items,
                "updatedAt": now,
            },
            "$setOnInsert": {
                "createdAt": now,
            }
        }
        result = await self.collection.update_one(query, update, upsert=True)
        cart = await self.collection.find_one(query)
        if cart:
            cart["_id"] = str(cart["_id"])
        return cart

    async def delete_cart(self, customer_id: str, session_id: str):
        query = self._build_query(customer_id, session_id)
        await self.collection.delete_one(query)

    def _build_query(self, customer_id: str, session_id: str) -> dict:
        if customer_id and customer_id != "string":
            return {"customer_id": customer_id}
        return {"session_id": session_id}
