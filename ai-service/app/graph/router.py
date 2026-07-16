from app.graph.state import GraphState


def router(state: GraphState):

    message = state["message"].lower()

    if "recommend" in message:
        return "recommendation"

    if "order" in message:
        return "order"

    if (
        "shoe" in message
        or "shirt" in message
        or "hoodie" in message
    ):
        return "product"

    return "llm"