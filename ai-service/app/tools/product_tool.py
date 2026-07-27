import logging
from app.services.product_service import ProductService

logger = logging.getLogger("fashionhub.tool")


class ProductTool:


    def __init__(self):

        self.service = ProductService()


    async def create_product(
       self,
       product_data: dict
   ):

     return await self.service.create_product(
        product_data
    )
     
    async def search_products(
        self,
        filters: dict
    ):

        logger.info("product_tool.search_products: filters=%s", filters)
        return await self.service.search_products(
            filters
        )



    async def get_product(
        self,
        product_id: str
    ):

        return await self.service.get_product(
            product_id
        )



    async def get_all_products(
        self,
        page: int = 1,
        limit: int = 20
    ):

        return await self.service.get_all_products(
            page,
            limit
        )
        
        
        
    async def update_product(
        self,
        product_id: str,
        update_data: dict
    ):

        return await self.service.update_product(
            product_id,
            update_data
        )



    async def delete_product(
        self,
        product_id: str
    ):

        return await self.service.delete_product(
            product_id
        )     
        
        
        
        
    async def get_product_by_id(
        self,
        product_id: str
    ):
        return await self.service.get_product_by_id(
            product_id
        )    