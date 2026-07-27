import logging

from app.graph.builder import build_graph
from app.memory.chat_memory import (
    load_session_state,
    save_session_state,
    load_message_history,
)

logger = logging.getLogger("fashionhub.workflow")


class Workflow:

    def __init__(self, nodes):
        self.graph = build_graph(nodes)

    async def run(
        self,
        session_id,
        message,
        customer_id=None,
        platform=None,
        history=None,
    ):
        # Load persisted session state from MongoDB
        saved_state = await load_session_state(session_id)

        # Load message history from MongoDB for memory
        db_history = await load_message_history(session_id)

        # Merge: backend-provided history takes precedence, fallback to DB history
        if not history:
            history = db_history

        initial_state = {
            "session_id": session_id,
            "customer_id": customer_id,
            "platform": platform,
            "message": message,
            "customer": None,
            "conversation": None,
            "history": history or [],
            "intent": {},
            "sentiment": {},
            "entities": {},
            "customer_goal": "",
            "products": [],
            "recommendations": [],
            "order": None,
            "delivery": None,
            "policies": None,
            "settings": None,
            "cart": [],
            # Restore persisted session state
            "checkout_stage": saved_state.get("checkout_stage", "idle"),
            "purchase_confirmed": saved_state.get("purchase_confirmed", False),
            "purchase_result": saved_state.get("purchase_result"),
            "temp_product": saved_state.get("temp_product"),
            "temp_quantity": saved_state.get("temp_quantity", 1),
            "temp_name": saved_state.get("temp_name", ""),
            "temp_phone": saved_state.get("temp_phone", ""),
            "temp_address": saved_state.get("temp_address", ""),
            "temp_city": saved_state.get("temp_city", ""),
            "temp_payment": saved_state.get("temp_payment", "Cash on Delivery"),
            "last_shown_products": saved_state.get("last_shown_products", []),
            "reply": "",
        }

        result = await self.graph.ainvoke(initial_state)

        # Persist session state back to MongoDB
        try:
            await save_session_state(session_id, result)
        except Exception as e:
            logger.error("Failed to save session state: %s", str(e)[:200])

        return result
