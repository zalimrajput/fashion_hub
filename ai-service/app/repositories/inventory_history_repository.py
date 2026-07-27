import logging
from datetime import datetime
from app.database import get_database

logger = logging.getLogger("fashionhub.repository")

class InventoryHistoryRepository:

    def __init__(self):
        self.collection = get_database()["inventory_history"]

    async def record(self, entry: dict) -> dict:
        entry["createdAt"] = datetime.utcnow()
        result = await self.collection.insert_one(entry)
        entry["_id"] = str(result.inserted_id)
        logger.info("InventoryHistory: order=%s product=%s delta=%d type=%s",
                     entry.get("orderId", "?"),
                     entry.get("productName", "?"),
                     entry.get("delta", 0),
                     entry.get("changeType", "?"))
        return entry

    async def get_by_order(self, order_id: str) -> list:
        cursor = self.collection.find({"orderId": order_id}).sort("createdAt", 1)
        entries = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            entries.append(doc)
        return entries

    async def get_by_product(self, product_id: str) -> list:
        cursor = self.collection.find({"productId": product_id}).sort("createdAt", -1).limit(50)
        entries = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            entries.append(doc)
        return entries
