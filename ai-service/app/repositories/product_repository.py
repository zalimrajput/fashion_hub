from warnings import filters

from app.core.database import Database


class ProductRepository:

    def __init__(self):
        self.db = Database.get_database()
        self.collection = self.db["products"]

    def get_all_products(self):
        return list(self.collection.find())

    def get_product_by_name(self, product_name):
        return self.collection.find_one(
            {
                "productName": {
                    "$regex": product_name,
                    "$options": "i"
                }
            }
        )
    
    def get_products_by_category(self, category):
        return list(
            self.collection.find(
                {
                    "category": {
                        "$regex": category,
                        "$options": "i"
                    }
                }
            )
        )
    

    def search_products(self, keyword):
        return list(
            self.collection.find(
                {
                    "$or": [
                        {
                            "productName": {
                                "$regex": keyword,
                                "$options": "i"
                            }
                        },
                        {
                            "description": {
                                "$regex": keyword,
                                "$options": "i"
                            }
                        }
                    ]
                }
            )
        )
    

    def get_best_sellers(self):
        return list(
            self.collection.find(
                {
                    "isBestSeller": True
                }
            )
        )
    

    def get_trending_products(self):
        return list(
            self.collection.find(
                {
                    "isTrending": True
                }
            )
        )
    

    def get_products_by_price(self, max_price):
        return list(
            self.collection.find(
                {
                    "price": {
                        "$lte": max_price
                    }
                }
            )
        )


    def get_products_by_gender(self, gender):
        return list(
            self.collection.find(
                {
                    "gender": {
                        "$regex": gender,
                        "$options": "i"
                    }
                }
            )
        )


    def get_products_by_season(self, season):
        return list(
            self.collection.find(
                {
                    "season": {
                        "$regex": season,
                        "$options": "i"
                    }
                }
            )
        )
    

    def get_products_by_filters(self, filters):
        return list(self.collection.find(filters))



# No business logic.
# Just database access.
# That's the repository's only responsibility.