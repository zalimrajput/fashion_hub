from app.database import get_database
from bson import ObjectId


def _serialize(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


class OrderRepository:

    def __init__(self):
        self.collection = get_database()["orders"]

    async def create(self, order: dict, session=None):
        result = await self.collection.insert_one(order, session=session)
        order["_id"] = str(result.inserted_id)
        return order

    async def get_by_customer(self, customer_id: str):
        orders = []
        cursor = self.collection.find({"customer": customer_id}).sort("createdAt", -1)
        async for order in cursor:
            orders.append(_serialize(order))
        return orders

    async def update_status(self, order_id, status, session=None):
        await self.collection.update_one(
            {"orderId": order_id},
            {"$set": {"status": status}},
            session=session,
        )
        return await self.get_by_id(order_id)

    async def update_tracking(self, order_id, tracking_number, session=None):
        await self.collection.update_one(
            {"orderId": order_id},
            {"$set": {"trackingNumber": tracking_number}},
            session=session,
        )
        return await self.get_by_id(order_id)

    async def get_latest_order(self):
        order = await self.collection.find_one({}, sort=[("createdAt", -1)])
        return _serialize(order)

    async def order_exists(self, order_id):
        order = await self.collection.find_one({"orderId": order_id})
        return order is not None

    async def get_all(self):
        orders = []
        cursor = self.collection.find()
        async for order in cursor:
            orders.append(_serialize(order))
        return orders

    async def update(self, order_id, data):
        await self.collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": data},
        )
        return _serialize(await self.collection.find_one({"_id": ObjectId(order_id)}))

    async def delete(self, order_id):
        result = await self.collection.delete_one({"_id": ObjectId(order_id)})
        return result.deleted_count > 0

    async def get_by_order_number(self, order_number):
        order = await self.collection.find_one({"orderId": order_number})
        return _serialize(order)

    async def get_by_id(self, order_id):
        if ObjectId.is_valid(order_id):
            order = await self.collection.find_one({"_id": ObjectId(order_id)})
        else:
            order = await self.collection.find_one({"orderId": order_id})
        return _serialize(order)

    async def cancel_order(self, order_number):
        await self.collection.update_one(
            {"orderId": order_number},
            {"$set": {"status": "Cancelled"}},
        )
        return _serialize(await self.collection.find_one({"orderId": order_number}))

    async def get_by_tracking(self, tracking_number):
        order = await self.collection.find_one({"trackingNumber": tracking_number})
        return _serialize(order)
