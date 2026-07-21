from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import GOOGLE_API_KEY
from app.core.history import ConversationHistory

from app.tools.product_tool import ProductTool
from app.tools.recommendation_tool import RecommendationTool
from app.tools.order_tool import OrderTool

from app.graph.graph_builder import FashionGraph


class AIService:

    def __init__(self):

        # Initialize Gemini
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.4,
        )

        # Shared services
        self.history = ConversationHistory()

        # Tools
        self.product_tool = ProductTool()
        self.recommendation_tool = RecommendationTool()
        self.order_tool = OrderTool()

        # LangGraph
        self.graph = FashionGraph(
            product_tool=self.product_tool,
            recommendation_tool=self.recommendation_tool,
            order_tool=self.order_tool,
            llm=self.llm,
            history=self.history,
        )

    def chat(self, session_id: str, message: str):

        state = {
            "session_id": session_id,
            "message": message,
            "products": None,
            "recommendations": None,
            "order": None,
            "response": None,
        }

        result = self.graph.invoke(state)

        return result["response"]