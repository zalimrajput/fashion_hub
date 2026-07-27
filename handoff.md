# Handoff Notes — FashiobHUb AI Sales Assistant

## Changes Applied

### 1. Customer Validation — Order Creation Guard

**Files changed:**
- `ai-service/app/tools/purchase_tool.py` — Added real-time customer validation in `execute_purchase()`: checks `ObjectId.is_valid()` and verifies the ID exists in the Customers MongoDB collection. Raises `ValueError("Please select your customer profile before placing an order.")` on failure.
- `ai-service/app/graph/nodes.py:440` — Removed `customer_id or session_id` fallback that bypassed the guard.
- `ai-service/app/graph/nodes.py:468-474` — Added a fallthrough guard at the end of `checkout_node()`: if no stage handler fired (stage was `idle`) and `customer_id` is invalid, the blocking message is returned instead of letting `response_node` generate a fake order-placed-success message.

**Verification:** All three invalid-customer scenarios (empty string, product _id, session string) return `"Please select your customer profile before placing an order."` at the order-persistence boundary. Real customers pass through normally.

---

## Known Issues

### A. Delivery Charge Mismatch in Order Confirmation

**What happens:** The LLM-generated confirmation message tells the customer a different delivery charge and grand total than what is actually saved in the database.

**Example from test:** Bot said *"Delivery Charge: PKR 0 — Grand Total: PKR 2210"*, but the persisted order at MongoDB has `deliveryCharges: 350` and `grandTotal: 2560.0`.

**Root cause:** `state["delivery"]` is `None` when the confirmation prompt is assembled. The code at `app/llm/response.py:371` falls back to 0:

```python
delivery_charge = delivery.get("charge", 0) if delivery else 0
#                                                       ^-- delivery is None → 0
grand_total = prod_subtotal + delivery_charge  # 2210 + 0 = 2210
```

The actual delivery calculation happens later in `app/services/order_service.py:202-221` during `create_order()`, which calls `calculate_delivery_charge("Lahore", "")` → returns `{"charge": 350}`. The `freeDeliveryAbove` check (line 219) does not waive the charge because subtotal 2210 is below the threshold.

**Why it's non-trivial:** The `state["delivery"]` is populated by the graph's `delivery_node`/`setting_node`, which only runs when the graph explicitly routes to it. During the conversational checkout flow, the graph routes to `checkout_node` → drops to `response_node` without running the delivery node first. Fixing this requires either:

1. **(~1 hour)** Calculate delivery inline in `app/llm/response.py` before the prompt is assembled (fetch delivery settings + charges using the known `city` from state).
2. **(~2-4 hours)** Re-architect the graph routing to ensure `delivery_node` fires before `confirm` stage responses.

**Even a data fix may still produce mismatches** because the LLM is free to restate the numbers in natural language and can hallucinate regardless of what the prompt context says.

---

### B. LLM Hallucinates "Order Placed Successfully" for Blocked Orders

**Status: FIXED** (per the fallthrough guard above).

Previously, when `checkout_node`'s purchase exception handler caught the customer validation `ValueError`, the `response_node` still generated a fake success message because it didn't check whether the order was actually created. The fallthrough guard at `nodes.py:468-474` now blocks this by returning the real validation message before `response_node` runs.

---

### C. General LLM Response Reliability

The `response_node` at `app/llm/response.py` uses an LLM (currently `openai/gpt-4.1-mini` via OpenRouter, configured in `app/config.py`) to generate all customer-facing text. The prompt includes structured data (products, prices, delivery info, cart contents), but the LLM can occasionally:
- Invent prices or discounts
- Misstate quantities or colors
- Generate confirmation text that disagrees with backend calculations

This is inherent to generative AI. For production reliability:
- Consider generating structured receipts (order confirmations) programmatically instead of via LLM
- Add response validation checks that compare LLM output against known state values
- Reduce `max_tokens` and `temperature` in `app/llm/ai_engine.py` for tighter control

---

### D. Customer Self-Registration for WhatsApp/Instagram

**Current state:** A customer auth API exists (`POST /api/customer-auth/register` at `backend/controllers/customerAuthController.js:8-66`) requiring name, email, password, and phoneNumber. However, **no customer-facing frontend signup page exists** — the frontend source (`frontend/src/pages/`) has no Register, SignUp, or Login page for customers.

Customers are currently either:
1. Manually added via the admin panel (admin logs in → creates customer records)
2. Pre-seeded in the database (the 11 customers in the DB were likely added this way)

**Impact on WhatsApp/Instagram:** Both `whatsappController.js:103-116` and `instagramController.js:102-115` reject unregistered users with "Please register on our website before using WhatsApp support." Since the registration page doesn't exist in the frontend, **new leads currently cannot use the bot at all** — they hit the "please register" wall with no way to complete registration.

This is a product gap, not a code bug. The backend API is ready; the frontend registration flow needs to be built and linked from the rejection messages.

---

## Not Verified in This Session

The following areas were **not** verified during this handoff session and should be checked by whoever picks this up next:

1. **Documentation accuracy** — `API_REFERENCE.md`, `DATABASE.md`, and any other `.md` documentation files in the repo may be out of sync with the actual code. No diff was run between documented endpoints/models and the runtime code.

2. **Dead file deletions** — Earlier in the session, several dead/unused files in `backend/` and `ai-service/` were identified for deletion. It was not confirmed whether those deletions were actually carried out. The next engineer should review the session history or re-run the dead-file check.

3. **Frontend registration flow** — As noted above in Known Issues D, the customer signup UI does not exist. This is the single biggest blocker to production readiness for the WhatsApp/Instagram channels.

4. **End-to-end WhatsApp/Instagram integration** — The webhook controllers exist but were not tested against live Meta webhooks or simulated message delivery. Token validity and message routing were not verified outside of the local dev simulation through the chat API.
