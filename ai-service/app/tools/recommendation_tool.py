from app.repositories.product_repository import ProductRepository


class RecommendationTool:

    def __init__(self):
        self.repository = ProductRepository()

    def recommend_by_category(self, category):
        return self.repository.get_products_by_category(category)

    def recommend_by_price(self, max_price):
        return self.repository.get_products_by_price(max_price)

    def recommend_by_gender(self, gender):
        return self.repository.get_products_by_gender(gender)

    def recommend_by_season(self, season):
        return self.repository.get_products_by_season(season)
    
    def recommend(self, filters):
        return self.repository.get_products_by_filters(filters)