import json
import logging

from langchain_core.messages import HumanMessage

from app.llm.prompts import (
    GENERAL_RESPONSE_PROMPT,
    PRODUCT_RESPONSE_PROMPT,
    RECOMMENDATION_RESPONSE_PROMPT,
    DELIVERY_RESPONSE_PROMPT,
    POLICY_RESPONSE_PROMPT,
    ORDER_RESPONSE_PROMPT,
    COMPLAINT_RESPONSE_PROMPT,
    COMPARISON_RESPONSE_PROMPT,
    PURCHASE_RESPONSE_PROMPT,
    CART_RESPONSE_PROMPT,
    CHECKOUT_RESPONSE_PROMPT,
)

logger = logging.getLogger("fashionhub.response")


async def generate_response(
    llm,
    message,
    intent,
    sentiment=None,
    entities=None,
    customer_goal="",
    products=None,
    recommendations=None,
    delivery=None,
    policies=None,
    settings=None,
    customer=None,
    history=None,
    order=None,
    cart=None,
    checkout_stage=None,
    purchase_confirmed=None,
    purchase_result=None,
    temp_product=None,
    temp_name=None,
    temp_phone=None,
    temp_address=None,
    temp_city=None,
    temp_payment=None,
    last_shown_products=None,
):

    products = products or []
    recommendations = recommendations or []
    entities = entities or {}
    history = history or []

    logger.info("generate_response: intent=%s products=%d order_avail=%s",
                 intent.get("intent", "?") if isinstance(intent, dict) else intent,
                 len(products),
                 "yes" if order else "no")

    # ==========================================================
    # Detect Intent
    # ==========================================================

    if isinstance(intent, dict):
        intent_name = intent.get("intent", "other")
    else:
        intent_name = str(intent)

    # ==========================================================
    # Select Prompt
    # ==========================================================

    if intent_name == "compare_products":

        base_prompt = COMPARISON_RESPONSE_PROMPT

    elif intent_name in [
        "product_search",
        "product_details",
        "price_inquiry",
        "discount_inquiry",
        "size_inquiry",
        "color_inquiry",
        "stock_inquiry",
        "availability",
    ]:

        base_prompt = PRODUCT_RESPONSE_PROMPT

    elif intent_name == "recommendation":

        base_prompt = RECOMMENDATION_RESPONSE_PROMPT

    elif intent_name == "delivery_inquiry":

        base_prompt = DELIVERY_RESPONSE_PROMPT

    elif intent_name in [
        "return_policy",
        "exchange_policy",
        "refund_request",
    ]:

        base_prompt = POLICY_RESPONSE_PROMPT

    elif intent_name in [
        "order_tracking",
        "order_placement",
        "order_cancellation",
    ]:

        base_prompt = ORDER_RESPONSE_PROMPT

        if intent_name == "order_placement":
            base_prompt += """

NOTE: The customer wants to PLACE an order. Do NOT look up an existing order.
If a product is listed in the MATCHING PRODUCTS section, that product can be ordered.
Guide the customer by asking for their shipping address, city, and payment method.
Do NOT create the order in this conversation — explain what information you need to proceed.
"""

    elif intent_name == "human_support":

        base_prompt = GENERAL_RESPONSE_PROMPT + """

The customer wants to speak to a human agent. Apologize politely and provide the available contact information from the STORE SETTINGS section (support email, phone, WhatsApp, etc.).
If no contact information is available, apologize and say you'll have a team member reach out.
Do NOT try to resolve the issue yourself unless the customer asks.
"""

    elif intent_name == "complaint":

        base_prompt = COMPLAINT_RESPONSE_PROMPT

    elif intent_name == "purchase":

        base_prompt = PURCHASE_RESPONSE_PROMPT

    elif intent_name in [
        "cart_add",
        "cart_remove",
        "cart_show",
        "cart_clear",
    ]:

        base_prompt = CART_RESPONSE_PROMPT

    elif intent_name == "checkout":

        base_prompt = CHECKOUT_RESPONSE_PROMPT

    else:

        base_prompt = GENERAL_RESPONSE_PROMPT

    # ==========================================================
    # Product Context
    # ==========================================================

    product_context = ""

    if products:

        for index, product in enumerate(products[:3], start=1):

            sizes = product.get("sizes", [])

            colors = product.get("colors", [])

            if not isinstance(sizes, list):
                sizes = []

            if not isinstance(colors, list):
                colors = []

            images = product.get("images", [])
            if not isinstance(images, list):
                images = []
            images_str = ", ".join(images) if images else "No image available"

            product_context += f"""

Product {index}

Name: {product.get("productName","")}

Category: {product.get("category","")}

Sub Category: {product.get("subCategory","")}

Gender: {product.get("gender","")}

Price: {product.get("price","")}

Discount: {product.get("discount",0)}

Rating: {product.get("rating",0)}

Stock: {product.get("stock",0)}

Sizes: {", ".join(sizes)}

Colors: {", ".join(colors)}

Images: {images_str}

Season: {product.get("season","")}

Brand: {product.get("brand","")}

Material: {product.get("material","")}

Style: {product.get("style","")}

Occasion: {product.get("occasion","")}

Description: {product.get("description","")}

----------------------------------------

"""

    else:

        product_context = "No matching products found."
        
        
        
        
    # ==========================================================
    # Recommendation Context
    # ==========================================================

    recommendation_context = ""

    if recommendations:

        for index, product in enumerate(recommendations[:3], start=1):

            sizes = product.get("sizes", [])
            colors = product.get("colors", [])

            if not isinstance(sizes, list):
                sizes = []

            if not isinstance(colors, list):
                colors = []

            images = product.get("images", [])
            if not isinstance(images, list):
                images = []
            images_str = ", ".join(images) if images else "No image available"

            recommendation_context += f"""

Recommendation {index}

Name: {product.get("productName","")}

Category: {product.get("category","")}

Price: {product.get("price","")}

Discount: {product.get("discount",0)}

Sizes: {", ".join(sizes)}

Colors: {", ".join(colors)}

Images: {images_str}

Description: {product.get("description","")}

----------------------------------------

"""

    else:

        recommendation_context = "No recommendations available."

    # ==========================================================
    # Delivery Context
    # ==========================================================

    if delivery:

        delivery_context = json.dumps(
            delivery,
            indent=2,
            default=str
        )

    else:

        delivery_context = "Not Available"

    # ==========================================================
    # Policy Context
    # ==========================================================

    if policies:

        policy_context = json.dumps(
            policies,
            indent=2,
            default=str
        )

    else:

        policy_context = "Not Available"

    # ==========================================================
    # Store Settings
    # ==========================================================

    if order:

        order_context = json.dumps(
            order,
            indent=2,
            default=str
        )

    else:

        order_context = "Not Available"

    # ==========================================================
    # Cart Context
    # ==========================================================

    if cart:

        cart_context = json.dumps(
            cart,
            indent=2,
            default=str
        )

    else:

        cart_context = "Empty Cart"

    # ==========================================================
    # Checkout Stage
    # ==========================================================

    checkout_context = checkout_stage if checkout_stage else "idle"

    # ==========================================================
    # Checkout Data Collected So Far
    # ==========================================================

    checkout_data = {}
    if temp_product:
        checkout_data["product"] = {
            "name": temp_product.get("productName"),
            "price": temp_product.get("price"),
            "discount": temp_product.get("discount", 0),
            "sizes": temp_product.get("sizes", []),
            "colors": temp_product.get("colors", []),
            "images": temp_product.get("images", []),
        }
    checkout_data["quantity"] = 1  # default, updated if set
    if temp_name:
        checkout_data["customer_name"] = temp_name
    if temp_phone:
        checkout_data["customer_phone"] = temp_phone
    if temp_address:
        checkout_data["shipping_address"] = temp_address
    if temp_city:
        checkout_data["city"] = temp_city
    if temp_payment and temp_payment != "Cash on Delivery":
        checkout_data["payment_method"] = temp_payment
    else:
        checkout_data["payment_method"] = "Cash on Delivery (default)"
    if delivery:
        checkout_data["delivery_charge"] = delivery.get("charge", 0)

    # Calculate total if product and delivery data are available
    if temp_product:
        price = temp_product.get("price", 0)
        discount_pct = temp_product.get("discount", 0)
        discount_amt = price * discount_pct / 100
        prod_subtotal = price - discount_amt
        delivery_charge = delivery.get("charge", 0) if delivery else 0
        checkout_data["total_breakdown"] = {
            "item_price": price,
            "discount": f"{discount_pct}% (-{discount_amt:.2f})",
            "price_after_discount": prod_subtotal,
            "delivery_charge": delivery_charge,
        }
        checkout_data["grand_total"] = prod_subtotal + delivery_charge

    checkout_temp_context = json.dumps(checkout_data, indent=2, default=str) if checkout_data else "No checkout data yet"

    # ==========================================================
    # Last Shown Products Context (for follow-up reference)
    # ==========================================================

    last_shown_context = ""
    if last_shown_products:
        for idx, p in enumerate(last_shown_products, start=1):
            sizes = ", ".join(p.get("sizes", [])) if isinstance(p.get("sizes"), list) else str(p.get("sizes", ""))
            colors = ", ".join(p.get("colors", [])) if isinstance(p.get("colors"), list) else str(p.get("colors", ""))
            last_shown_context += f"""
Product {idx}
  Name: {p.get("productName", "")}
  Price: {p.get("price", "")}
  Sizes: {sizes}
  Colors: {colors}
----------------------------------------
"""
    else:
        last_shown_context = "No previously shown products."

    if settings:

        settings_context = json.dumps(
            settings,
            indent=2,
            default=str
        )

    else:

        settings_context = "Not Available"

    # ==========================================================
    # Customer Context
    # ==========================================================

    if customer:

        customer_context = json.dumps(
            customer,
            indent=2,
            default=str
        )

    else:

        customer_context = "Unknown Customer"

    # ==========================================================
    # Chat History
    # ==========================================================

    if history:

        history_context = json.dumps(
            history[-5:],
            indent=2,
            default=str
        )

    else:

        history_context = "No Previous Conversation"

    # ==========================================================
    # Entity Context — stripped when DB returned empty
    # ==========================================================

    is_product_intent = intent_name in [
        "product_search", "product_details", "price_inquiry",
        "discount_inquiry", "size_inquiry", "color_inquiry",
        "stock_inquiry", "availability", "compare_products",
        "recommendation",
    ]

    if is_product_intent and not products and not recommendations:
        entity_context = "NOTE: The database returned zero results for the customer's query. Do NOT create or describe any products."
    else:
        entity_context = json.dumps(
            entities,
            indent=2,
            default=str
        )
    
    
    # ==========================================================
    # Build Final Prompt
    # ==========================================================

    prompt = f"""
{base_prompt}

==================================================
CUSTOMER MESSAGE
==================================================

{message}

==================================================
INTENT
==================================================

{intent_name}

==================================================
SENTIMENT
==================================================

{sentiment.get("sentiment", "neutral") if isinstance(sentiment, dict) else sentiment}

==================================================
CUSTOMER GOAL
==================================================

{customer_goal}

==================================================
EXTRACTED ENTITIES
==================================================

{entity_context}

==================================================
MATCHING PRODUCTS
==================================================

{product_context}

==================================================
RECOMMENDATIONS
==================================================

{recommendation_context}

==================================================
DELIVERY INFORMATION
==================================================

{delivery_context}

==================================================
ORDER INFORMATION
==================================================

{order_context}

==================================================
STORE POLICIES
==================================================

{policy_context}

==================================================
STORE SETTINGS
==================================================

{settings_context}

==================================================
CUSTOMER PROFILE
==================================================

{customer_context}

==================================================
CHAT HISTORY
==================================================

{history_context}

==================================================
CART INFORMATION
==================================================

{cart_context}

==================================================
CHECKOUT STAGE
==================================================

{checkout_context}

==================================================
CHECKOUT DATA COLLECTED
==================================================

{checkout_temp_context}

==================================================
PREVIOUSLY SHOWN PRODUCTS (from earlier turns)
==================================================

{last_shown_context}

==================================================
INSTRUCTIONS
==================================================

Generate the best customer reply.

Answer ONLY using the supplied information.

Never invent products.

Never invent prices.

Never invent discounts.

Never invent stock.

Never invent delivery charges.

Never invent policies.

Keep the reply natural.

Return ONLY the reply.

IMPORTANT: The sections above contain ALL available data from the FashionHub database.
- If MATCHING PRODUCTS says "No matching products found", the database confirmed zero results.
- If ORDER INFORMATION says "Not Available", there is no order data.
- If DELIVERY INFORMATION says "Not Available", there is no delivery data.
- If STORE POLICIES says "Not Available", there is no policy data.
You MUST NOT invent any of these values regardless of the customer's question.

When describing products from MATCHING PRODUCTS, include the product image URLs from the Images field so customers can see the products. Mention the product name, price, available sizes, colors, and images.

Use the CHECKOUT DATA COLLECTED section to reference details the customer has already provided during checkout. Use the CHECKOUT STAGE to know what information to ask for next.

The PREVIOUSLY SHOWN PRODUCTS section lists products that were shown to the customer in an earlier turn. If the customer's current message is short and clearly refers back to one of those products (e.g. "size M", "the black one", "the second one", "that one", "I'll take it"), use the PREVIOUSLY SHOWN PRODUCTS list to identify which product they mean. If multiple previously shown products match the customer's description, ask a SPECIFIC clarifying question listing the matching product names — do NOT ask a generic "what are you buying?".

Note: The customer's full message may contain multiple requests. Address ALL parts of their message. If a section says "Not Available" and the customer asked about it, politely explain that information isn't available right now and suggest they ask about it separately.
"""

    # ==========================================================
    # Call LLM
    # ==========================================================

    try:

        response = await llm.ainvoke(
            [
                HumanMessage(
                    content=prompt
                )
            ]
        )

        content = response.content

        if not isinstance(content, str):
            content = str(content)

        return content.strip()

    except Exception as e:

        print("\n========== RESPONSE ERROR ==========")
        print(e)
        print("====================================\n")
        logger.error("generate_response LLM call failed: %s", str(e)[:300])

        err_str = str(e)
        if "429" in err_str or "rate limit" in err_str.lower() or "Rate limit" in err_str:
            return (
                "Our AI assistant is temporarily at capacity due to high usage. "
                "Please try again in a few minutes or after midnight (PKT). "
                "We apologize for the inconvenience! 🙏"
            )

        return (
            "I'm sorry, I'm having trouble processing your request right now. "
            "Please try again in a moment."
        )