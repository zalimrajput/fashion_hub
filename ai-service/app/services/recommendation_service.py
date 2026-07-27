from app.repositories.customer_repository import CustomerRepository
from app.repositories.product_repository import ProductRepository


class RecommendationService:

    def __init__(self, product_tool):
        self.product_tool = product_tool
        self.product_repository = ProductRepository()
        self.customer_repository = CustomerRepository()

    async def recommend_products(
        self,
        customer_id=None,
        gender=None,
        budget=None,
        color=None,
        category=None,
        season=None,
        trend=None,
        bestSeller=None,
    ):
        filters = {}
        if gender:
            filters["gender"] = gender
        if category:
            filters["category"] = category
        if str(trend).lower() == "true":
            filters["isTrending"] = True
        if str(bestSeller).lower() == "true":
            filters["isBestSeller"] = True
        if season:
            filters["season"] = season
        if color:
            filters["colors"] = {"$in": [color]}
        if budget:
            parsed = int(budget) if str(budget).lstrip("-").isdigit() else 0
            if parsed:
                filters["price"] = {"$lte": parsed}

        result = await self.product_repository.search(filters, limit=5)
        products = result["items"] if isinstance(result, dict) else result

        if products:
            return products

        if customer_id:
            customer = await self.customer_repository.get_by_id(customer_id)
            if customer:
                preferences = customer.get("preferences", {})
                history_filters = {}
                if preferences.get("favoriteCategory"):
                    history_filters["category"] = preferences["favoriteCategory"]
                if preferences.get("favoriteColor"):
                    history_filters["colors"] = {"$in": [preferences["favoriteColor"]]}
                if history_filters:
                    result = await self.product_repository.search(history_filters, limit=5)
                    products = result["items"] if isinstance(result, dict) else result
                    if products:
                        return products

        result = await self.product_repository.search({}, limit=5)
        return result["items"] if isinstance(result, dict) else result
