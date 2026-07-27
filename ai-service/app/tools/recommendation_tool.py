class RecommendationTool:


    def __init__(
        self,
        service
    ):

        self.service = service



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


        return await self.service.recommend_products(

            customer_id=customer_id,

            gender=gender,

            budget=budget,

            color=color,

            category=category,

            season=season,
            trend=trend,

            bestSeller=bestSeller

        )