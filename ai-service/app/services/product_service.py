import logging
from app.repositories.product_repository import ProductRepository
from app.utils.filter_builder import build_product_filter, build_sort_config

logger = logging.getLogger("fashionhub.service")


class ProductService:

    def __init__(self):
        self.repository = ProductRepository()

    async def search_products(self, filters: dict, page: int = 1, limit: int = 20):
        sort_config = build_sort_config(filters)
        query = build_product_filter(filters)
        logger.info("product_service.search_products: built query=%s sort=%s", query, sort_config)
        if not query:
            logger.warning("product_service.search_products: empty query, returning []")
            return []
        result = await self.repository.search(query, page=page, limit=limit, sort=sort_config)
        logger.info("product_service.search_products: total=%d items=%d", result["total"], len(result["items"]))
        return result["items"]

    async def get_product(self, product_id: str):
        return await self.repository.get_by_id(product_id)

    async def get_all_products(self, page=1, limit=20):
        skip = (page - 1) * limit
        return await self.repository.get_all(skip, limit)

    async def update_product(self, product_id: str, update_data: dict):
        return await self.repository.update_product(product_id, update_data)

    async def delete_product(self, product_id: str):
        return await self.repository.delete_product(product_id)

    async def get_product_by_id(self, product_id: str):
        return await self.repository.get_by_id(product_id)

    async def create_product(self, product_data: dict):
        return await self.repository.create_product(product_data)
