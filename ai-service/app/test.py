from app.tools.recommendation_tool import RecommendationTool

tool = RecommendationTool()

products = tool.recommend({
    "category": "Shoes"
})

print(products)