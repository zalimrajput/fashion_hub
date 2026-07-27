import re
import json
import logging
from app.llm.prompts import UNDERSTAND_PROMPT
from langchain_core.messages import HumanMessage

logger = logging.getLogger("fashionhub.understand")



DEFAULT_RESPONSE = {
    "intent": "other",
    "confidence": 0.0,
    "sentiment": "neutral",
    "customer_goal": "",
    "entities": {
        "category": "",
        "subCategory": "",
        "productName": "",
        "gender": "",
        "color": "",
        "size": "",
        "season": "",
        "budget": "",
        "minPrice": "",
        "maxPrice": "",
        "trend": "",
        "city": "",
        "province": "",
        "order_id": "",
        "tracking_number": "",
        "quantity": "",
        "bestSeller": "",
        "discount": "",
        "rating": "",
        "sort_by": "",
        "sort_order": "",
        "phoneNumber": "",
        "instagramId": ""
    }
}

VALID_INTENTS = {

    "greeting",

    "goodbye",

    "product_search",

    "product_details",

    "recommendation",

    "price_inquiry",

    "discount_inquiry",

    "size_inquiry",

    "color_inquiry",

    "stock_inquiry",

    "delivery_inquiry",

    "order_placement",

    "order_tracking",

    "order_cancellation",

    "return_policy",

    "exchange_policy",

    "refund_request",

    "complaint",

    "human_support",

    "general_question",

    "availability",

    "compare_products",

    # Purchase & Cart
    "purchase",

    "cart_add",

    "cart_remove",

    "cart_show",

    "cart_clear",

    "checkout",

    "other"

}


VALID_SENTIMENTS = {
    "happy",
    "interested",
    "neutral",
    "frustrated",
    "angry"
}


def extract_json(text: str):

    text = text.strip()

    text = (
        text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("JSON object not found")

    return text[start:end + 1]


def normalize_entities(entities):

    clean = DEFAULT_RESPONSE["entities"].copy()

    if not isinstance(entities, dict):
        return clean

    for key in clean.keys():

        value = entities.get(key, "")

        if value is None:
            value = ""

        if isinstance(value, str):
            value = value.strip()

        clean[key] = value

    return clean


def validate_response(data):

    response = DEFAULT_RESPONSE.copy()

    response["entities"] = normalize_entities(
        data.get("entities", {})
    )

    intent = str(
        data.get(
            "intent",
            "other"
        )
    ).strip().lower()

    if intent in VALID_INTENTS:
        response["intent"] = intent

    sentiment = str(
        data.get(
            "sentiment",
            "neutral"
        )
    ).strip().lower()

    if sentiment in VALID_SENTIMENTS:
        response["sentiment"] = sentiment

    confidence = data.get(
        "confidence",
        0
    )

    try:
        confidence = float(confidence)

        if confidence < 0:
            confidence = 0

        if confidence > 1:
            confidence = 1

    except:
        confidence = 0

    response["confidence"] = confidence

    response["customer_goal"] = str(
        data.get(
            "customer_goal",
            ""
        )
    ).strip()

    return response


PRODUCT_KEYWORDS = {
    "product_search": ["show", "find", "looking for", "need", "want", "search", "have any",
                       "got any", "tell me about", "display", "list", "browse", "catalog",
                       "collection", "available"],
    "price_inquiry": ["price", "cost", "how much", "pkr", "rs ", "rupees", "rate", "cheap",
                      "expensive", "affordable", "under", "above", "budget"],
    "discount_inquiry": ["discount", "sale", "offer", "deal", "off", "percent off"],
    "size_inquiry": ["size", "sizes", "small", "medium", "large", "xl", "xxl", "measurement"],
    "color_inquiry": ["color", "colour", "shade", "black", "white", "red", "blue",
                      "green", "pink", "yellow"],
    "stock_inquiry": ["stock", "available", "in stock", "out of stock", "availability"],
    "purchase": ["buy", "purchase", "order this", "take this", "i'll take", "i want to buy",
                 "add to cart", "place order", "checkout now"],
    "cart_add": ["add one", "add two", "add three", "add to my cart", "put in cart",
                 "add to cart"],
    "cart_remove": ["remove from cart", "delete from cart", "take out", "remove item",
                    "remove one"],
    "cart_show": ["show my cart", "my cart", "view cart", "what's in my cart", "cart items",
                  "show cart"],
    "cart_clear": ["clear cart", "empty cart", "remove all", "clear my cart"],
}

ORDER_KEYWORDS = {
    "order_tracking": ["track", "status", "where is my", "shipped", "delivered",
                       "order status", "tracking"],
    "order_cancellation": ["cancel", "cancellation", "cancel order"],
}

DELIVERY_KEYWORDS = {
    "delivery_inquiry": ["delivery", "shipping", "deliver", "ship", "courier",
                         "home delivery", "cash on delivery"],
}

POLICY_KEYWORDS = {
    "return_policy": ["return", "refund", "replace", "exchange", "return policy"],
    "exchange_policy": ["exchange", "swap", "replace"],
}


COLOR_SET = {"black", "white", "red", "blue", "green", "pink", "yellow", "purple",
             "orange", "brown", "gray", "grey", "navy", "beige", "cream", "gold",
             "silver", "maroon", "teal", "coral", "khaki", "olive", "tan", "ivory",
             "magenta", "turquoise", "indigo", "violet", "charcoal"}
FILLER_PREFIXES = ["do you have", "do you have any", "have any", "got any",
                   "i need", "i want", "i am looking for", "i'm looking for",
                   "looking for", "show me", "can you show me", "find me",
                   "tell me about", "search for", "display", "browse"]
GENDER_SET = {"men", "man", "male", "women", "woman", "female", "boys", "boy",
              "girls", "girl", "kids", "children", "unisex"}


def _extract_color(message: str) -> str:
    words = message.lower().split()
    for word in words:
        word_clean = word.strip(".,!?;:'\"")
        if word_clean in COLOR_SET:
            return word_clean.capitalize()
    return ""


def _extract_gender(message: str) -> str:
    words = message.lower().split()
    for word in words:
        word_clean = word.strip(".,!?;:'\"")
        if word_clean in GENDER_SET:
            return word_clean.capitalize()
    return ""


def _clean_product_name(message: str) -> str:
    lower = message.lower().strip()
    for prefix in FILLER_PREFIXES:
        if lower.startswith(prefix):
            lower = lower[len(prefix):].strip()
            break
    # Remove extracted color words from product name
    color = _extract_color(message)
    if color:
        lower = lower.replace(color.lower(), "").strip()
    # Remove extracted gender words
    gender = _extract_gender(message)
    if gender:
        lower = lower.replace(gender.lower(), "").strip()
    # Clean up multiple spaces, leading/trailing junk
    lower = re.sub(r"\s+", " ", lower).strip()
    lower = lower.strip(".,!?;:'\" ")
    return lower if lower else message.strip()


def _extract_quantity(message: str) -> int:
    msg_lower = message.lower()
    word_map = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10}
    words = msg_lower.split()
    for i, word in enumerate(words):
        if word in word_map:
            return word_map[word]
        if word.isdigit():
            return int(word)
        if i > 0 and word.startswith("add") and i + 1 < len(words):
            if words[i + 1] in word_map:
                return word_map[words[i + 1]]
            if words[i + 1].isdigit():
                return int(words[i + 1])
    return 0


def _fallback_classify(message: str):
    msg_lower = message.lower()

    # Cart intents checked first (more specific keywords)
    for intent, keywords in [
        ("cart_clear", ["clear cart", "empty cart", "remove all", "clear my cart"]),
        ("cart_show", ["show my cart", "my cart", "view cart", "what's in my cart", "cart items",
                       "show cart", "display cart"]),
        ("cart_remove", ["remove from cart", "delete from cart", "take out of cart", "remove item"]),
        ("cart_add", ["add to cart", "add to my cart", "put in cart"]),
        ("checkout", ["checkout", "place order", "confirm order", "proceed to checkout"]),
        ("purchase", ["i want to buy", "i'll take", "i will take", "buy this", "purchase this",
                      "order this", "take this"]),
    ]:
        if any(kw in msg_lower for kw in keywords):
            result = DEFAULT_RESPONSE.copy()
            result["intent"] = intent
            result["confidence"] = 0.4
            result["customer_goal"] = message.strip()
            if intent in ("cart_add", "purchase"):
                entities = DEFAULT_RESPONSE["entities"].copy()
                entities["productName"] = _clean_product_name(message)
                entities["color"] = _extract_color(message)
                entities["gender"] = _extract_gender(message)
                qty = _extract_quantity(message)
                if qty:
                    entities["quantity"] = str(qty)
                result["entities"] = entities
            logger.info("Fallback classified: intent=%s", intent)
            return result

    for intent, keywords in PRODUCT_KEYWORDS.items():
        if any(kw in msg_lower for kw in keywords):
            entities = DEFAULT_RESPONSE["entities"].copy()
            entities["productName"] = _clean_product_name(message)
            entities["color"] = _extract_color(message)
            entities["gender"] = _extract_gender(message)
            result = DEFAULT_RESPONSE.copy()
            result["intent"] = intent
            result["confidence"] = 0.4
            result["entities"] = entities
            result["customer_goal"] = message.strip()
            logger.info("Fallback classified: intent=%s productName=%s color=%s", intent, entities["productName"], entities["color"])
            return result

    for intent, keywords in ORDER_KEYWORDS.items():
        if any(kw in msg_lower for kw in keywords):
            result = DEFAULT_RESPONSE.copy()
            result["intent"] = intent
            result["confidence"] = 0.4
            result["customer_goal"] = message.strip()
            return result

    for intent, keywords in DELIVERY_KEYWORDS.items():
        if any(kw in msg_lower for kw in keywords):
            result = DEFAULT_RESPONSE.copy()
            result["intent"] = intent
            result["confidence"] = 0.4
            result["customer_goal"] = message.strip()
            return result

    for intent, keywords in POLICY_KEYWORDS.items():
        if any(kw in msg_lower for kw in keywords):
            result = DEFAULT_RESPONSE.copy()
            result["intent"] = intent
            result["confidence"] = 0.4
            result["customer_goal"] = message.strip()
            return result

    return None


async def understand_customer(
    llm,
    message: str
):

    prompt = (
        UNDERSTAND_PROMPT
        + "\n\n"
        + "CUSTOMER MESSAGE:\n"
        + message
    )

    try:

        result = await llm.ainvoke(
            [
                HumanMessage(
                    content=prompt
                )
            ]
        )

        content = result.content

        if not isinstance(content, str):
            content = str(content)

        print("\n========== RAW UNDERSTANDING ==========")
        print(content)
        print("=======================================\n")

        json_text = extract_json(
            content
        )

        data = json.loads(
            json_text
        )

        validated = validate_response(data)
        logger.info("LLM understand succeeded: intent=%s confidence=%s entities=%s",
                     validated["intent"], validated["confidence"], validated["entities"])
        return validated

    except Exception as e:

        print(
            "\nUNDERSTANDING ERROR"
        )

        print(e)

        print(
            "\nCustomer Message:"
        )

        print(message)

        logger.warning("LLM understand failed: %s. Trying fallback.", str(e)[:200])
        fallback = _fallback_classify(message)
        if fallback:
            print("Using keyword fallback classification")
            logger.info("Fallback result: intent=%s confidence=%s entities=%s",
                         fallback["intent"], fallback["confidence"], fallback["entities"])
            return fallback

        logger.warning("No fallback matched. Returning DEFAULT_RESPONSE.")
        return DEFAULT_RESPONSE.copy()
