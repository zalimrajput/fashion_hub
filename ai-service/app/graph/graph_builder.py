from langgraph.graph import StateGraph, END

from app.graph.state import GraphState
from app.graph.nodes import GraphNodes
from app.graph.router import router


class FashionGraph:

    def __init__(
        self,
        product_tool,
        recommendation_tool,
        order_tool,
        llm,
        history,
    ):

        self.nodes = GraphNodes(
            product_tool,
            recommendation_tool,
            order_tool,
            llm,
            history,
        )

        workflow = StateGraph(GraphState)

        workflow.add_node("product", self.nodes.product_node)
        workflow.add_node("recommendation", self.nodes.recommendation_node)
        workflow.add_node("order", self.nodes.order_node)
        workflow.add_node("llm", self.nodes.llm_node)

        workflow.set_conditional_entry_point(
            router,
            {
                "product": "product",
                "recommendation": "recommendation",
                "order": "order",
                "llm": "llm",
            },
        )

        workflow.add_edge("product", "llm")
        workflow.add_edge("recommendation", "llm")
        workflow.add_edge("order", "llm")
        workflow.add_edge("llm", END)

        self.graph = workflow.compile()

    def invoke(self, state):
        return self.graph.invoke(state)



    #             Router
    #       ┌──────┼───────┐
    #       ▼      ▼       ▼
    #   Product Recommendation Order
    #       │      │       │
    #       └──────┼───────┘
    #              ▼
    #           LLM Node
    #              ▼
    #             END