import logging

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger("fashionhub.database")


class Database:
    client: AsyncIOMotorClient = None
    db = None


database = Database()


async def connect_database():
    database.client = AsyncIOMotorClient(
        settings.MONGO_URI,
        maxPoolSize=10,
        minPoolSize=1,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )
    database.db = database.client[settings.DATABASE_NAME]
    await _ensure_indexes()
    logger.info("Connected to MongoDB: %s", settings.DATABASE_NAME)


async def _ensure_indexes():
    from pymongo.errors import DuplicateKeyError, OperationFailure

    products = database.db["products"]
    orders = database.db["orders"]
    conversations = database.db["conversations"]
    customers = database.db["customers"]
    carts = database.db["carts"]
    inventory_history = database.db["inventory_history"]

    try:
        await products.create_index("productName")
        await products.create_index("category")
        await products.create_index("gender")
        await products.create_index("price")
        await products.create_index([("productName", "text"), ("category", "text"), ("description", "text")])
        await products.create_index("isBestSeller")
        await products.create_index("isTrending")
        await products.create_index("season")
        await products.create_index("colors")

        await orders.create_index("orderId", unique=True)
        await orders.create_index("customer")
        await orders.create_index("status")

        await conversations.create_index("customer")
        await conversations.create_index("platform")
        await conversations.create_index("updatedAt")

        await customers.create_index("whatsappNumber")
        await customers.create_index("instagramId")

        await carts.create_index("customer_id")
        await carts.create_index("session_id")
        await carts.create_index("updatedAt")

        await inventory_history.create_index("orderId")
        await inventory_history.create_index("productId")
        await inventory_history.create_index("createdAt")

        # Chat Sessions — persisted multi-turn state
        chatsessions = database.db["chatsessions"]
        await chatsessions.create_index("session_id", unique=True)
        await chatsessions.create_index("updatedAt")

        # Messages — every customer/AI message keyed by sessionId
        messages = database.db["messages"]
        await messages.create_index("session_id")
        await messages.create_index([("session_id", 1), ("timestamp", 1)])

        logger.info("Database indexes ensured")
    except (DuplicateKeyError, OperationFailure) as e:
        logger.warning("Index creation skipped (likely already exists): %s", str(e)[:200])


async def close_database():
    if database.client:
        database.client.close()
        logger.info("MongoDB connection closed")


def get_database():
    return database.db
