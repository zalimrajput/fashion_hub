import logging

from bson import ObjectId

from app.llm.understand import understand_customer
from app.llm.response import generate_response

logger = logging.getLogger("fashionhub.graph")


class GraphNodes:

    def __init__(
        self,
        llm,
        product_tool,
        setting_tool,
        recommendation_tool,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=None,
        checkout_tool=None,
        purchase_tool=None,
    ):
        self.llm = llm
        self.product_tool = product_tool
        self.setting_tool = setting_tool
        self.recommendation_tool = recommendation_tool
        self.order_tool = order_tool
        self.conversation_tool = conversation_tool
        self.customer_channel_tool = customer_channel_tool
        self.cart_tool = cart_tool
        self.checkout_tool = checkout_tool
        self.purchase_tool = purchase_tool

    async def understand_node(self, state):
        result = await understand_customer(
            self.llm,
            state["message"],
        )
        state["intent"] = {
            "intent": result.get("intent", "other"),
            "confidence": result.get("confidence", 0),
        }
        state["sentiment"] = {
            "sentiment": result.get("sentiment", "neutral"),
            "confidence": result.get("confidence", 0),
        }
        state["entities"] = result.get("entities", {})
        state["customer_goal"] = result.get("customer_goal", "")
        logger.info(
            "Intent=%s confidence=%s sentiment=%s entities=%s",
            state["intent"]["intent"],
            state["intent"]["confidence"],
            state["sentiment"]["sentiment"],
            state["entities"],
        )
        return state

    @staticmethod
    def _format_products_for_memory(products: list) -> list:
        return [
            {
                "_id": p.get("_id"),
                "productName": p.get("productName", ""),
                "price": p.get("price", 0),
                "sizes": p.get("sizes", []),
                "colors": p.get("colors", []),
                "images": p.get("images", []),
            }
            for p in products
        ]

    async def product_node(self, state):
        entities = state.get("entities", {})
        logger.info("product_node: entering with entities=%s", entities)
        products = await self.product_tool.search_products(entities)
        logger.info("product_node: products_found=%d", len(products))
        state["products"] = products
        state["last_shown_products"] = self._format_products_for_memory(products)
        return state

    async def recommendation_node(self, state):
        entities = state.get("entities", {})
        customer_id = state.get("customer_id")
        products = await self.recommendation_tool.recommend_products(
            customer_id=customer_id,
            gender=entities.get("gender"),
            budget=entities.get("budget"),
            color=entities.get("color"),
            category=entities.get("category"),
            season=entities.get("season"),
            trend=entities.get("trend"),
            bestSeller=entities.get("bestSeller"),
        )
        state["recommendations"] = products
        state["last_shown_products"] = self._format_products_for_memory(products)
        return state

    async def recommendation_node(self, state):
        entities = state.get("entities", {})
        customer_id = state.get("customer_id")
        products = await self.recommendation_tool.recommend_products(
            customer_id=customer_id,
            gender=entities.get("gender"),
            budget=entities.get("budget"),
            color=entities.get("color"),
            category=entities.get("category"),
            season=entities.get("season"),
            trend=entities.get("trend"),
            bestSeller=entities.get("bestSeller"),
        )
        state["recommendations"] = products
        return state

    async def delivery_node(self, state):
        entities = state.get("entities", {})
        city = entities.get("city", "")
        province = entities.get("province", "")
        if city or province:
            delivery = await self.setting_tool.calculate_delivery_charge(city, province)
        else:
            delivery = await self.setting_tool.get_delivery_settings()
        state["delivery"] = delivery
        return state

    async def policy_node(self, state):
        policies = await self.setting_tool.get_policies()
        state["policies"] = policies
        return state

    async def order_node(self, state):
        entities = state.get("entities", {})
        intent = state.get("intent", {})
        intent_name = intent.get("intent", "") if isinstance(intent, dict) else str(intent)
        order_id = entities.get("order_id", "")
        tracking_number = entities.get("tracking_number", "")
        phone_number = entities.get("phoneNumber", "")
        instagram_id = entities.get("instagramId", "")

        # ==============================
        # Lookup by order_id
        # ==============================
        if order_id:
            logger.info("Looking up order: %s", order_id)
            order = await self.order_tool.get_order_by_number(order_id)
            if not order:
                order = await self.order_tool.get_order(order_id)
            if order:
                if intent_name == "order_cancellation":
                    logger.info("Cancelling order with stock restore: %s", order_id)
                    try:
                        order = await self.purchase_tool.cancel_order_with_restore(order_id)
                    except ValueError as e:
                        logger.warning("Cancel failed: %s", e)
                        state["order"] = {"orderId": order_id, "status": "Already Cancelled", "error": str(e)}
                        return state
                state["order"] = order
                return state
            state["order"] = None
            return state

        # ==============================
        # Lookup by tracking number
        # ==============================
        if tracking_number:
            logger.info("Looking up order by tracking: %s", tracking_number)
            order = await self.order_tool.get_order_by_tracking(tracking_number)
            if order:
                state["order"] = order
                return state

        # ==============================
        # Lookup by phone number
        # ==============================
        if phone_number:
            logger.info("Looking up orders by phone: %s", phone_number)
            from app.repositories.customer_repository import CustomerRepository
            cust_repo = CustomerRepository()
            customer = await cust_repo.find_by_whatsapp(phone_number)
            if not customer:
                customer = await cust_repo.find_by_instagram(phone_number)
            if customer:
                orders = await self.order_tool.get_customer_orders(customer["_id"])
                state["order"] = {"orders": orders} if orders else {"message": "No orders found for this phone number."}
                return state
            state["order"] = {"message": "No customer found with this phone number."}
            return state

        # ==============================
        # Lookup by Instagram ID
        # ==============================
        if instagram_id:
            logger.info("Looking up orders by Instagram: %s", instagram_id)
            from app.repositories.customer_repository import CustomerRepository
            cust_repo = CustomerRepository()
            customer = await cust_repo.find_by_instagram(instagram_id)
            if customer:
                orders = await self.order_tool.get_customer_orders(customer["_id"])
                state["order"] = {"orders": orders} if orders else {"message": "No orders found for this Instagram account."}
                return state
            state["order"] = {"message": "No customer found with this Instagram ID."}
            return state

        # ==============================
        # Fallback to customer orders
        # ==============================
        customer_id = state.get("customer_id")
        if customer_id:
            logger.info("Looking up orders for customer: %s", customer_id)
            orders = await self.order_tool.get_customer_orders(customer_id)
            state["order"] = {"orders": orders} if orders else None
            return state

        state["order"] = None
        return state

    async def purchase_node(self, state):
        entities = state.get("entities", {})
        product_name = entities.get("productName", "")
        logger.info("purchase_node: searching product=%s", product_name)

        if product_name:
            products = await self.product_tool.search_products(entities)
            state["products"] = products
            if len(products) == 1:
                state["temp_product"] = products[0]
                qty = entities.get("quantity", "")
                state["temp_quantity"] = self.checkout_tool.parse_quantity(qty) if qty else 1
                state["checkout_stage"] = "ask_name"
                state["last_shown_products"] = []
                logger.info("purchase_node: single product found, starting checkout stage=ask_name")
            elif len(products) > 1:
                state["checkout_stage"] = "idle"
                logger.info("purchase_node: multiple products found (%d), letting LLM clarify", len(products))
            else:
                state["checkout_stage"] = "idle"
                logger.info("purchase_node: no products found")
        else:
            last_shown = state.get("last_shown_products", [])
            if last_shown:
                if len(last_shown) == 1:
                    state["temp_product"] = last_shown[0]
                    qty = entities.get("quantity", "")
                    state["temp_quantity"] = self.checkout_tool.parse_quantity(qty) if qty else 1
                    state["checkout_stage"] = "ask_name"
                    state["last_shown_products"] = []
                    logger.info("purchase_node: resolved from last_shown (single): %s", last_shown[0]["productName"])
                else:
                    matched = self._resolve_from_last_shown(last_shown, entities)
                    if matched:
                        state["temp_product"] = matched
                        qty = entities.get("quantity", "")
                        state["temp_quantity"] = self.checkout_tool.parse_quantity(qty) if qty else 1
                        state["checkout_stage"] = "ask_name"
                        state["last_shown_products"] = []
                        logger.info("purchase_node: resolved from last_shown (matched): %s", matched["productName"])
                    else:
                        state["products"] = last_shown
                        state["checkout_stage"] = "idle"
                        logger.info("purchase_node: ambiguous reference, %d products in last_shown", len(last_shown))
            else:
                state["products"] = []
                state["checkout_stage"] = "idle"

        return state

    @staticmethod
    def _resolve_from_last_shown(last_shown: list, entities: dict):
        size = entities.get("size", "").strip().lower()
        color = entities.get("color", "").strip().lower()

        candidates = list(last_shown)
        if size:
            candidates = [p for p in candidates if size in [s.lower() for s in p.get("sizes", [])]]
        if color:
            candidates = [p for p in candidates if color in [c.lower() for c in p.get("colors", [])]]
        return candidates[0] if len(candidates) == 1 else None

    async def cart_node(self, state):
        intent = state.get("intent", {})
        intent_name = intent.get("intent", "") if isinstance(intent, dict) else str(intent)
        entities = state.get("entities", {})
        customer_id = state.get("customer_id", "")
        session_id = state.get("session_id", "")

        if intent_name == "cart_add":
            product_name = entities.get("productName", "")
            if product_name:
                products = await self.product_tool.search_products(entities)
                state["products"] = products
                if len(products) == 1:
                    product = products[0]
                    qty = self.checkout_tool.parse_quantity(entities.get("quantity", "1"))
                    color = entities.get("color", "")
                    size = entities.get("size", "")
                    try:
                        items = await self.cart_tool.add_item(
                            customer_id, session_id, product["_id"],
                            quantity=qty, color=color, size=size
                        )
                        state["cart"] = items
                        logger.info("cart_node: added %s x%d to cart", product["productName"], qty)
                    except ValueError as e:
                        logger.warning("cart_node: add failed - %s", e)
                        state["reply"] = str(e)
                elif len(products) > 1:
                    state["products"] = products
                    logger.info("cart_node: multiple products, LLM will clarify")
                else:
                    logger.info("cart_node: no matching product found")
            # Load existing cart
            if not state.get("cart"):
                state["cart"] = await self.cart_tool.get_cart(customer_id, session_id)

        elif intent_name == "cart_remove":
            state["cart"] = await self.cart_tool.get_cart(customer_id, session_id)
            product_name = entities.get("productName", "")
            if product_name and state["cart"]:
                for item in list(state["cart"]):
                    if product_name.lower() in item["productName"].lower():
                        state["cart"] = await self.cart_tool.remove_item(
                            customer_id, session_id, item["productId"],
                            item.get("selectedColor", ""), item.get("selectedSize", "")
                        )
                        break

        elif intent_name == "cart_show":
            state["cart"] = await self.cart_tool.get_cart(customer_id, session_id)

        elif intent_name == "cart_clear":
            await self.cart_tool.clear_cart(customer_id, session_id)
            state["cart"] = []

        return state

    async def checkout_node(self, state):
        stage = state.get("checkout_stage", "idle")
        message = state.get("message", "")
        customer_id = state.get("customer_id", "")
        session_id = state.get("session_id", "")

        # Load cart from MongoDB
        state["cart"] = await self.cart_tool.get_cart(customer_id, session_id)

        # Require a valid customer profile for any checkout stage
        if stage not in ("idle", "complete"):
            if not customer_id or not ObjectId.is_valid(customer_id):
                state["reply"] = "Please select your customer profile before placing an order."
                state["checkout_stage"] = "idle"
                state["last_shown_products"] = []
                return state

        if stage == "ask_name":
            try:
                name = self.checkout_tool.parse_name(message)
                state["temp_name"] = name
                state["checkout_stage"] = "ask_phone"
            except ValueError as e:
                state["reply"] = str(e)
                return state

        elif stage == "ask_phone":
            try:
                phone = self.checkout_tool.parse_phone(message)
                state["temp_phone"] = phone
                state["checkout_stage"] = "ask_address"
            except ValueError as e:
                state["reply"] = str(e)
                return state

        elif stage == "ask_address":
            try:
                address = self.checkout_tool.parse_address(message)
                state["temp_address"] = address
                state["checkout_stage"] = "ask_city"
            except ValueError as e:
                state["reply"] = str(e)
                return state

        elif stage == "ask_city":
            try:
                city = self.checkout_tool.parse_city(message)
                state["temp_city"] = city
                state["checkout_stage"] = "ask_payment"
            except ValueError as e:
                state["reply"] = str(e)
                return state

        elif stage == "ask_payment":
            try:
                payment = self.checkout_tool.parse_payment(message)
                state["temp_payment"] = payment
                state["checkout_stage"] = "confirm"
            except ValueError as e:
                state["reply"] = str(e)
                return state

        elif stage == "confirm":
            # Calculate delivery charge and total for display
            city = state.get("temp_city", "")
            if city and not state.get("delivery"):
                delivery = await self.setting_tool.calculate_delivery_charge(city, "")
                state["delivery"] = delivery

            if self.checkout_tool.is_affirmative(message):
                # Build order items from cart
                cart_items = state.get("cart", [])
                if not cart_items and state.get("temp_product"):
                    product = state["temp_product"]
                    qty = state.get("temp_quantity", 1)
                    color_from_entities = state.get("entities", {}).get("color", "")
                    size_from_entities = state.get("entities", {}).get("size", "")
                    order_items = [{
                        "product": product["_id"],
                        "productName": product["productName"],
                        "quantity": qty,
                        "selectedColor": color_from_entities,
                        "selectedSize": size_from_entities,
                    }]
                elif cart_items:
                    order_items = [
                        {
                            "product": item["productId"],
                            "productName": item["productName"],
                            "quantity": item["quantity"],
                            "selectedColor": item.get("selectedColor", ""),
                            "selectedSize": item.get("selectedSize", ""),
                        }
                        for item in cart_items
                    ]
                else:
                    state["reply"] = "Your cart is empty. Please add items before checkout."
                    state["checkout_stage"] = "idle"
                    return state

                try:
                    order = await self.purchase_tool.execute_purchase(
                        customer_id=customer_id,
                        items=order_items,
                        shipping_address=state.get("temp_address", ""),
                        city=state.get("temp_city", ""),
                        province="",
                        payment_method=state.get("temp_payment", "Cash on Delivery"),
                    )
                    state["order"] = order
                    state["purchase_result"] = order
                    state["purchase_confirmed"] = True
                    state["checkout_stage"] = "complete"
                    state["last_shown_products"] = []
                    await self.cart_tool.clear_cart(customer_id, session_id)
                    state["cart"] = []
                    logger.info("checkout_node: order created successfully: %s", order.get("orderId"))
                except Exception as e:
                    logger.error("checkout_node: purchase failed - %s", str(e)[:300])
                    state["reply"] = f"Sorry, there was an error placing your order: {str(e)[:100]}"
                    state["checkout_stage"] = "idle"
                    return state
            elif self.checkout_tool.is_negative(message):
                state["reply"] = "Your order has been cancelled. No charges were made."
                state["checkout_stage"] = "idle"
                return state

        elif stage == "complete":
            pass

        # Fallthrough guard: if no stage handler set a reply (stage was idle)
        # but customer_id is invalid, the response_node would hallucinate a fake
        # order placed success message. Block that here.
        if not state.get("reply"):
            if not customer_id or not ObjectId.is_valid(customer_id):
                state["reply"] = "Please select your customer profile before placing an order."
                state["checkout_stage"] = "idle"
                state["last_shown_products"] = []

        return state

    async def response_node(self, state):
        if state.get("reply"):
            return state

        logger.info("response_node: intent=%s products=%d order=%s delivery=%s cart=%d checkout_stage=%s",
                     state.get("intent", {}).get("intent", "?"),
                     len(state.get("products", [])),
                     "set" if state.get("order") else "None",
                     "set" if state.get("delivery") else "None",
                     len(state.get("cart", [])),
                     state.get("checkout_stage", "idle"))
        reply = await generate_response(
            llm=self.llm,
            message=state.get("message", ""),
            intent=state.get("intent", {}),
            sentiment=state.get("sentiment", {}),
            entities=state.get("entities", {}),
            customer_goal=state.get("customer_goal", ""),
            products=state.get("products", []),
            recommendations=state.get("recommendations", []),
            delivery=state.get("delivery"),
            policies=state.get("policies"),
            settings=state.get("settings"),
            customer=state.get("customer"),
            history=state.get("history", []),
            order=state.get("order"),
            cart=state.get("cart", []),
            checkout_stage=state.get("checkout_stage", "idle"),
            purchase_confirmed=state.get("purchase_confirmed", False),
            purchase_result=state.get("purchase_result"),
            temp_product=state.get("temp_product"),
            temp_name=state.get("temp_name"),
            temp_phone=state.get("temp_phone"),
            temp_address=state.get("temp_address"),
            temp_city=state.get("temp_city"),
            temp_payment=state.get("temp_payment", "Cash on Delivery"),
            last_shown_products=state.get("last_shown_products", []),
        )
        logger.info("response_node: reply_length=%d reply_preview=%s",
                     len(reply), reply[:80])
        state["reply"] = reply
        return state
