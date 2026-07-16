from langchain_core.messages import SystemMessage

from app.prompts import SYSTEM_PROMPT
from app.graph.state import GraphState


class GraphNodes:

    def __init__(
        self,
        product_tool,
        recommendation_tool,
        order_tool,
        llm,
        history,
    ):

        self.product_tool = product_tool
        self.recommendation_tool = recommendation_tool
        self.order_tool = order_tool
        self.llm = llm
        self.history = history

    # -----------------------------
    # Product Node
    # -----------------------------

    def product_node(self, state: GraphState):

        message = state["message"].lower()

        products = None

        if "shoe" in message:
            products = self.product_tool.get_products_by_category("Shoes")

        elif "shirt" in message:
            products = self.product_tool.get_products_by_category("Shirts")

        elif "hoodie" in message:
            products = self.product_tool.get_products_by_category("Hoodies")

        state["products"] = products

        return state

    # -----------------------------
    # Recommendation Node
    # -----------------------------

    def recommendation_node(self, state: GraphState):

        message = state["message"].lower()

        filters = {}

        if "shoe" in message:
            filters["category"] = "Shoes"

        elif "shirt" in message:
            filters["category"] = "Shirts"

        elif "hoodie" in message:
            filters["category"] = "Hoodies"

        if "men" in message:
            filters["gender"] = "Men"

        elif "women" in message:
            filters["gender"] = "Women"

        if "winter" in message:
            filters["season"] = "Winter"

        elif "summer" in message:
            filters["season"] = "Summer"

        state["recommendations"] = self.recommendation_tool.recommend(filters)

        return state

    # -----------------------------
    # Order Node
    # -----------------------------

    def order_node(self, state: GraphState):

        words = state["message"].split()

        order_id = None

        for word in words:

            if any(char.isdigit() for char in word):

                order_id = word.strip(".,!?")
                break

        if order_id:

            state["order"] = self.order_tool.get_order_by_order_id(order_id)

        return state

    # -----------------------------
    # LLM Node
    # -----------------------------

    def llm_node(self, state: GraphState):

        # Save current user message
        self.history.add_user_message(
            state["session_id"],
            state["message"]
        )

        messages = [
            SystemMessage(content=SYSTEM_PROMPT)
        ]

        if state.get("products"):

            messages.append(
                SystemMessage(
                    content=f"""
    Available Products:

    {state["products"]}

    Use ONLY these products.
    Do not invent products.
    """
                )
            )

        elif state.get("recommendations"):

            messages.append(
                SystemMessage(
                    content=f"""
    Recommended Products:

    {state["recommendations"]}

    Use ONLY these products.
    Do not invent products.
    """
                )
            )

        elif state.get("order"):

            messages.append(
                SystemMessage(
                    content=f"""
    Order Information:

    {state["order"]}

    Use ONLY this order information.
    Do not invent order details.
    """
                )
            )

        messages.extend(
            self.history.get_messages(
                state["session_id"]
            )
        )

        response = self.llm.invoke(messages)

        self.history.add_ai_message(
            state["session_id"],
            response.content
        )

        state["response"] = response.content

        return state