# ai_engine.py
import os, json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from products import search_products

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.4, api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a professional sales assistant for FashionHub, a clothing brand.
You detect the customer's INTENT (one of: greeting, product_search, order_placement,
delivery_inquiry, complaint, return_request, discount_inquiry) and SENTIMENT
(happy, angry, frustrated, interested).

Always respond ONLY in valid JSON with this exact shape, no markdown, no backticks, no extra text:
{
  "intent": "...",
  "sentiment": "...",
  "search_terms": {"color": null, "category": null, "max_price": null},
  "reply": "..."
}

If intent is product_search, fill search_terms with what you can extract (color/category/max_price),
otherwise leave them null. Keep "reply" short, warm, and in the customer's language (English or Urdu)."""

def get_ai_response(customer_message: str, history: list[dict] = None):
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    for h in (history or []):
        role = HumanMessage if h["role"] == "user" else SystemMessage
        messages.append(role(content=h["content"]))
    messages.append(HumanMessage(content=customer_message))

    raw = llm.invoke(messages).content.strip()

    # Groq/Llama sometimes wraps JSON in markdown fences — strip them before parsing
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:].strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return {"intent": "unknown", "sentiment": "neutral", "search_terms": {}, "reply": raw}

    # If it's a product search, actually fetch matching products and inject into reply
    if parsed.get("intent") == "product_search" and parsed.get("search_terms"):
        matches = search_products(parsed["search_terms"])
        if matches:
            lines = [f"{p['name']} — Rs {p['price']}" for p in matches]
            parsed["reply"] += "\n\n" + "\n".join(lines) + "\n\nWould you like to see pictures?"

    return parsed