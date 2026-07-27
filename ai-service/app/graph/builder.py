import logging

from langgraph.graph import StateGraph

from app.graph.state import GraphState

logger = logging.getLogger("fashionhub.graph")



def build_graph(nodes):


    graph = StateGraph(
        GraphState
    )


    # ===============================
    # Nodes
    # ===============================


    graph.add_node(
        "understand",
        nodes.understand_node
    )


    graph.add_node(
        "product",
        nodes.product_node
    )


    graph.add_node(
        "recommendation",
        nodes.recommendation_node
    )


    graph.add_node(
        "delivery",
        nodes.delivery_node
    )


    graph.add_node(
        "policy",
        nodes.policy_node
    )


    graph.add_node(
        "order",
        nodes.order_node
    )


    graph.add_node(
        "purchase",
        nodes.purchase_node
    )


    graph.add_node(
        "cart",
        nodes.cart_node
    )


    graph.add_node(
        "checkout",
        nodes.checkout_node
    )


    graph.add_node(
        "response",
        nodes.response_node
    )



    # ===============================
    # Entry
    # ===============================


    graph.set_entry_point(
        "understand"
    )



    # ===============================
    # Routing
    # ===============================


    graph.add_conditional_edges(

        "understand",

        route_intent,


        {

            "product":
                "product",

            "recommendation":
                "recommendation",

            "delivery":
                "delivery",

            "policy":
                "policy",

            "order":
                "order",

            "purchase":
                "purchase",

            "cart":
                "cart",

            "checkout":
                "checkout",

            "response":
                "response"

        }

    )



    # ===============================
    # Business Flow
    # ===============================


    graph.add_edge(
        "product",
        "response"
    )


    graph.add_edge(
        "recommendation",
        "response"
    )


    graph.add_edge(
        "delivery",
        "response"
    )


    graph.add_edge(
        "policy",
        "response"
    )


    graph.add_edge(
        "order",
        "response"
    )


    graph.add_edge(
        "purchase",
        "response"
    )


    graph.add_edge(
        "cart",
        "response"
    )


    graph.add_edge(
        "checkout",
        "response"
    )



    graph.set_finish_point(
        "response"
    )


    return graph.compile()





# ==================================================
# Intent Router
# ==================================================


CONFIDENCE_THRESHOLD = 0.3


def route_intent(state):

    intent = state.get("intent", {})
    intent_name = intent.get("intent", "other")
    confidence = intent.get("confidence", 0)
    checkout_stage = state.get("checkout_stage", "idle")

    # ==============================
    # Checkout in progress — override routing
    # ==============================
    if checkout_stage not in ("idle", "complete"):
        logger.debug("route_intent: checkout in progress (stage=%s) -> checkout", checkout_stage)
        return "checkout"

    if intent_name not in ("greeting", "goodbye", "other", "general_question") and confidence < CONFIDENCE_THRESHOLD:
        logger.debug("route_intent: low confidence %s for %s -> response", confidence, intent_name)
        return "response"

    # Recommendation

    if intent_name == "recommendation":

        logger.debug("route_intent: recommendation")
        return "recommendation"



    # Products

    product_intents = [

        "product_search",

        "product_details",

        "price_inquiry",

        "discount_inquiry",

        "size_inquiry",

        "color_inquiry",

        "stock_inquiry",

        "availability",

        "compare_products"

    ]


    if intent_name in product_intents:

        # If a size/color inquiry has no product name but last_shown_products exists,
        # treat it as a follow-up purchase reference, not a fresh search.
        if intent_name in ("size_inquiry", "color_inquiry") and state.get("last_shown_products"):
            logger.debug("route_intent: follow-up %s with last_shown_products -> purchase", intent_name)
            return "purchase"

        logger.debug("route_intent: product_intent=%s", intent_name)
        return "product"



    # Delivery

    if intent_name == "delivery_inquiry":

        logger.debug("route_intent: delivery_inquiry")
        return "delivery"



    # Policies

    policy_intents = [

        "return_policy",

        "exchange_policy",

        "refund_request"

    ]


    if intent_name in policy_intents:

        logger.debug("route_intent: policy_intent=%s", intent_name)
        return "policy"



    # Orders (tracking, cancellation — placement now goes to purchase)

    order_intents = [

        "order_tracking",

        "order_cancellation",

    ]


    if intent_name in order_intents:

        logger.debug("route_intent: order_intent=%s", intent_name)
        return "order"



    # Purchase

    if intent_name == "purchase":

        logger.debug("route_intent: purchase")
        return "purchase"



    # Cart

    cart_intents = [

        "cart_add",

        "cart_remove",

        "cart_show",

        "cart_clear",

    ]


    if intent_name in cart_intents:

        logger.debug("route_intent: cart_intent=%s", intent_name)
        return "cart"



    # Checkout

    if intent_name == "checkout":

        logger.debug("route_intent: checkout")
        return "checkout"



    logger.debug("route_intent: fallthrough to response (intent=%s)", intent_name)
    return "response"