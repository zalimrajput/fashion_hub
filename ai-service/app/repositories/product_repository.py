import logging
from app.database import get_database
from bson import ObjectId

logger = logging.getLogger("fashionhub.repository")


def _serialize(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


class ProductRepository:

    def __init__(self):
        self.collection = get_database()["products"]

    async def create_product(self, product_data: dict):
        result = await self.collection.insert_one(product_data)
        return await self.get_by_id(str(result.inserted_id))

    async def search(self, query: dict, page: int = 1, limit: int = 20, sort: list = None):
        logger.info("product_repository.search: query=%s page=%s limit=%s sort=%s", query, page, limit, sort)
        products = []
        skip = (page - 1) * limit
        cursor = self.collection.find(query, {"description": 0})
        if sort:
            cursor = cursor.sort(sort)
        cursor = cursor.skip(skip).limit(limit)
        async for product in cursor:
            products.append(_serialize(product))
        total = await self.collection.count_documents(query)
        logger.info("product_repository.search: total=%d returned=%d", total, len(products))
        return {
            "items": products,
            "total": total,
            "page": page,
            "limit": limit,
            "has_next": (page * limit) < total,
        }

    async def get_all(self, skip=0, limit=20):
        products = []
        cursor = (
            self.collection
            .find({}, {"description": 0})
            .skip(skip)
            .limit(limit)
        )
        async for product in cursor:
            products.append(_serialize(product))
        return products

    async def get_by_id(self, product_id: str):
        if not ObjectId.is_valid(product_id):
            return None
        product = await self.collection.find_one(
            {"_id": ObjectId(product_id)},
            {"description": 0}
        )
        return _serialize(product)

    async def update_stock(self, product_id, quantity, session=None):
        await self.collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$inc": {"stock": -quantity}},
            session=session,
        )
        return await self.get_by_id(product_id)

    async def increase_stock(self, product_id, quantity, session=None):
        await self.collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$inc": {"stock": quantity}},
            session=session,
        )
        return await self.get_by_id(product_id)

    async def update_product(self, product_id: str, update_data: dict):
        if not ObjectId.is_valid(product_id):
            return None
        await self.collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data},
        )
        return await self.get_by_id(product_id)

    async def delete_product(self, product_id: str):
        if not ObjectId.is_valid(product_id):
            return False
        result = await self.collection.delete_one(
            {"_id": ObjectId(product_id)}
        )
        return result.deleted_count > 0
