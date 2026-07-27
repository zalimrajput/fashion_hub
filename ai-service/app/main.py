import logging
from contextlib import asynccontextmanager
from app.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.logger import setup_logging

setup_logging()
logger = logging.getLogger("fashionhub.main")

from app.database import connect_database, close_database
from app.graph.workflow import Workflow
from app.graph.nodes import GraphNodes
from app.llm.ai_engine import AIEngine
from app.models.request import ChatRequest
from app.tools.product_tool import ProductTool
from app.tools.setting_tool import SettingTool
from app.tools.order_tool import OrderTool
from app.tools.conversation_tool import ConversationTool
from app.tools.customer_channel_tool import CustomerChannelTool
from app.tools.recommendation_tool import RecommendationTool
from app.tools.cart_tool import CartTool
from app.tools.checkout_tool import CheckoutTool
from app.tools.purchase_tool import PurchaseTool
from app.services.recommendation_service import RecommendationService


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_database()
    product_tool = ProductTool()
    setting_tool = SettingTool()
    order_tool = OrderTool()
    conversation_tool = ConversationTool()
    customer_channel_tool = CustomerChannelTool()
    recommendation_tool = RecommendationTool(
        RecommendationService(product_tool)
    )
    cart_tool = CartTool()
    checkout_tool = CheckoutTool()
    purchase_tool = PurchaseTool()
    ai_engine = AIEngine()
    llm = ai_engine.get_llm()
    nodes = GraphNodes(
        llm=llm,
        product_tool=product_tool,
        setting_tool=setting_tool,
        recommendation_tool=recommendation_tool,
        order_tool=order_tool,
        conversation_tool=conversation_tool,
        customer_channel_tool=customer_channel_tool,
        cart_tool=cart_tool,
        checkout_tool=checkout_tool,
        purchase_tool=purchase_tool,
    )
    app.state.workflow = Workflow(nodes)
    yield
    await close_database()


app = FastAPI(
    title="FashionHub AI Service",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def home():
    return {"status": "running", "service": "FashionHub AI"}


@app.get("/customers")
async def list_customers():
    from app.database import get_database
    db = get_database()
    cursor = db["customers"].find({}, {"_id": 1, "name": 1, "phoneNumber": 1})
    customers = await cursor.to_list(length=100)
    for c in customers:
        c["_id"] = str(c["_id"])
    return {"customers": customers}


@app.post("/chat")
async def chat(request: ChatRequest):
    workflow = getattr(app.state, "workflow", None)
    if workflow is None:
        return {"error": "AI Service not ready"}

    result = await workflow.run(
        session_id=request.session_id,
        customer_id=request.customer_id,
        platform=request.platform,
        message=request.message,
        history=request.history,
    )

    # Persist every message immediately to MongoDB (memory node)
    try:
        from app.memory.chat_memory import save_message
        await save_message(request.session_id, "user", request.message)
        reply_text = result.get("reply", "")
        if reply_text:
            await save_message(request.session_id, "assistant", reply_text)
    except Exception as e:
        logger.error("Failed to persist message to MongoDB: %s", str(e)[:200])

    # Build structured products list from workflow state
    raw_products = result.get("products") or result.get("recommendations") or []
    logger.info("RAW PRODUCTS FROM GRAPH: %s", raw_products)
    products = []
    for p in raw_products:
        products.append({
            "productName": p.get("productName", ""),
            "price": p.get("price", 0),
            "sizes": p.get("sizes", []),
            "colors": p.get("colors", []),
            #"images": p.get("images", []),
            "images": [
    f"{settings.PUBLIC_URL}{img}"
    for img in p.get("images", [])
],
        })
    logger.info("PRODUCTS SENT TO NODE: %s", products)    

    return {
        "reply": result.get("reply", ""),
        "intent": result.get("intent", {}),
        "sentiment": result.get("sentiment", {}),
        "entities": result.get("entities", {}),
        "products": products,
    }
