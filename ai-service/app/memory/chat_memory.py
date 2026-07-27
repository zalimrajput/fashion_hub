import logging
from datetime import datetime

from app.repositories.chat_session_repository import ChatSessionRepository
from app.repositories.message_repository import MessageRepository

logger = logging.getLogger("fashionhub.memory")

_session_repo = None
_message_repo = None


def _get_repos():
    global _session_repo, _message_repo
    if _session_repo is None:
        _session_repo = ChatSessionRepository()
    if _message_repo is None:
        _message_repo = MessageRepository()
    return _session_repo, _message_repo


def reset_repos():
    """Invalidate cached repos so they re-resolve on next use (e.g. after DB restart)."""
    global _session_repo, _message_repo
    _session_repo = None
    _message_repo = None


async def load_session_state(session_id: str) -> dict:
    """Load persisted session state from MongoDB for the given session_id."""
    if not session_id:
        return {}
    session_repo, _ = _get_repos()
    doc = await session_repo.get_by_session_id(session_id)
    if not doc:
        logger.debug("load_session_state: no existing session for %s", session_id)
        return {}
    state = dict(doc)
    state.pop("_id", None)
    state.pop("session_id", None)
    logger.info(
        "load_session_state: session=%s stage=%s",
        session_id,
        state.get("checkout_stage", "idle"),
    )
    return state


async def save_session_state(session_id: str, state: dict):
    """Persist session state to MongoDB."""
    if not session_id:
        return
    doc = {
        "session_id": session_id,
        "checkout_stage": state.get("checkout_stage", "idle"),
        "temp_name": state.get("temp_name", ""),
        "temp_phone": state.get("temp_phone", ""),
        "temp_address": state.get("temp_address", ""),
        "temp_city": state.get("temp_city", ""),
        "temp_payment": state.get("temp_payment", "Cash on Delivery"),
        "purchase_confirmed": state.get("purchase_confirmed", False),
        "purchase_result": state.get("purchase_result"),
    }
    tp = state.get("temp_product")
    if tp:
        doc["temp_product"] = {
            "_id": tp.get("_id"),
            "productName": tp.get("productName"),
            "price": tp.get("price"),
            "discount": tp.get("discount", 0),
            "category": tp.get("category"),
            "sizes": tp.get("sizes", []),
            "colors": tp.get("colors", []),
            "images": tp.get("images", []),
            "stock": tp.get("stock", 0),
        }
    else:
        doc["temp_product"] = None
    doc["temp_quantity"] = state.get("temp_quantity", 1)
    # Persist any extra fields from state not covered above
    known = {"checkout_stage", "temp_name", "temp_phone", "temp_address",
             "temp_city", "temp_payment", "purchase_confirmed", "purchase_result",
             "temp_product", "temp_quantity"}
    for k, v in state.items():
        if k not in known:
            doc[k] = v
    session_repo, _ = _get_repos()
    await session_repo.upsert(session_id, doc)
    logger.debug("save_session_state: session=%s stage=%s", session_id, doc["checkout_stage"])


async def load_message_history(session_id: str, limit: int = 50) -> list:
    """Load previous messages for the session ordered by timestamp."""
    if not session_id:
        return []
    _, message_repo = _get_repos()
    messages = await message_repo.get_session_messages(session_id, limit)
    history = []
    for msg in messages:
        history.append({"role": msg["role"], "content": msg["content"]})
    logger.debug("load_message_history: session=%s count=%d", session_id, len(history))
    return history


async def save_message(session_id: str, role: str, content: str, metadata: dict = None):
    """Persist a single message to MongoDB immediately."""
    if not session_id:
        return
    _, message_repo = _get_repos()
    await message_repo.add_message(session_id, role, content, metadata)
    logger.debug("save_message: session=%s role=%s length=%d", session_id, role, len(content))
