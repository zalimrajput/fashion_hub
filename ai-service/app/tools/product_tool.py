from app.repositories.product_repository import ProductRepository


class ProductTool:

    def __init__(self):
        self.repository = ProductRepository()

    def get_all_products(self):
        return self.repository.get_all_products()

    def get_product_by_name(self, product_name):
        return self.repository.get_product_by_name(product_name)

    def get_products_by_category(self, category):
        return self.repository.get_products_by_category(category)

    def search_products(self, keyword):
        return self.repository.search_products(keyword)

    def get_best_sellers(self):
        return self.repository.get_best_sellers()

    def get_trending_products(self):
        return self.repository.get_trending_products()