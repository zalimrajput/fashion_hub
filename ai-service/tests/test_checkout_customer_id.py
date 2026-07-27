"""
Tests that checkout_node validates customer_id before allowing any checkout stage.

When customer_id is empty or not a valid MongoDB ObjectId (e.g. the frontend
hasn't selected a customer from the dropdown), checkout must be blocked with a
clear "select your customer profile" message instead of crashing later with a
bson InvalidId error in customer_repository.add_order_history().

Run: python -m tests.test_checkout_customer_id
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import asyncio

PASS = 0
FAIL = 0


def check(description: str, condition: bool):
    global PASS, FAIL
    if condition:
        print(f"  [PASS] {description}")
        PASS += 1
    else:
        print(f"  [FAIL] {description}")
        FAIL += 1


async def test_checkout_blocks_empty_customer_id():
    """checkout_node with customer_id='' and an active checkout stage must return
    a clear 'select your profile' message and reset stage to idle."""
    print("\n=== Test: checkout_node blocks empty customer_id at start of checkout ===")

    from app.graph.nodes import GraphNodes

    class MockCartTool:
        async def get_cart(self, customer_id, session_id):
            return None

    class MockCheckoutTool:
        @staticmethod
        def is_affirmative(msg):
            return True
        @staticmethod
        def is_negative(msg):
            return False
        @staticmethod
        def parse_name(msg):
            return msg
        @staticmethod
        def parse_phone(msg):
            return msg
        @staticmethod
        def parse_address(msg):
            return msg
        @staticmethod
        def parse_city(msg):
            return msg
        @staticmethod
        def parse_payment(msg):
            return msg

    nodes = GraphNodes(
        llm=None,
        product_tool=None,
        setting_tool=None,
        recommendation_tool=None,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=MockCartTool(),
        checkout_tool=MockCheckoutTool(),
        purchase_tool=None,
    )

    # State: empty customer_id, checkout just started at ask_name
    state = {
        "session_id": "test_session_001",
        "customer_id": "",
        "platform": "web",
        "message": "Ali",
        "entities": {},
        "checkout_stage": "ask_name",
        "temp_product": None,
        "temp_quantity": 1,
        "cart": [],
        "last_shown_products": [],
    }

    result = await nodes.checkout_node(state)

    check("checkout rejected with clear message",
          "select your customer profile" in result.get("reply", "").lower())
    check("checkout_stage reset to idle on rejection",
          result["checkout_stage"] == "idle")


async def test_checkout_blocks_invalid_customer_id():
    """checkout_node with customer_id='not-an-objectid' must also be blocked."""
    print("\n=== Test: checkout_node blocks invalid (non-ObjectId) customer_id ===")

    from app.graph.nodes import GraphNodes

    class MockCartTool:
        async def get_cart(self, customer_id, session_id):
            return None

    class MockCheckoutTool:
        @staticmethod
        def is_affirmative(msg):
            return True
        @staticmethod
        def is_negative(msg):
            return False
        @staticmethod
        def parse_name(msg):
            return msg
        @staticmethod
        def parse_phone(msg):
            return msg
        @staticmethod
        def parse_address(msg):
            return msg
        @staticmethod
        def parse_city(msg):
            return msg
        @staticmethod
        def parse_payment(msg):
            return msg

    nodes = GraphNodes(
        llm=None,
        product_tool=None,
        setting_tool=None,
        recommendation_tool=None,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=MockCartTool(),
        checkout_tool=MockCheckoutTool(),
        purchase_tool=None,
    )

    state = {
        "session_id": "test_session_002",
        "customer_id": "not-a-valid-objectid",
        "platform": "web",
        "message": "Ali",
        "entities": {},
        "checkout_stage": "ask_name",
        "temp_product": None,
        "temp_quantity": 1,
        "cart": [],
        "last_shown_products": [],
    }

    result = await nodes.checkout_node(state)

    check("invalid customer_id rejected with clear message",
          "select your customer profile" in result.get("reply", "").lower())
    check("checkout_stage reset to idle",
          result["checkout_stage"] == "idle")


async def test_checkout_allows_valid_customer_id():
    """checkout_node with a valid MongoDB ObjectId customer_id must NOT be blocked."""
    print("\n=== Test: checkout_node allows valid ObjectId customer_id ===")

    from app.graph.nodes import GraphNodes

    class MockCartTool:
        async def get_cart(self, customer_id, session_id):
            return None

    class MockCheckoutTool:
        @staticmethod
        def is_affirmative(msg):
            return True
        @staticmethod
        def is_negative(msg):
            return False
        @staticmethod
        def parse_name(msg):
            return msg

    nodes = GraphNodes(
        llm=None,
        product_tool=None,
        setting_tool=None,
        recommendation_tool=None,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=MockCartTool(),
        checkout_tool=MockCheckoutTool(),
        purchase_tool=None,
    )

    state = {
        "session_id": "test_session_003",
        "customer_id": "507f191e810c19729de860ea",
        "platform": "web",
        "message": "Ali",
        "entities": {},
        "checkout_stage": "ask_name",
        "temp_product": None,
        "temp_quantity": 1,
        "cart": [],
        "last_shown_products": [],
    }

    result = await nodes.checkout_node(state)

    check("valid customer_id does NOT produce a customer-profile error",
          "select your customer profile" not in result.get("reply", "").lower())
    check("checkout_stage advances (not blocked)",
          result["checkout_stage"] == "ask_phone")


async def test_checkout_idle_not_blocked():
    """checkout_node with idle stage must not be affected by the customer_id check."""
    print("\n=== Test: idle checkout stage is never blocked ===")

    from app.graph.nodes import GraphNodes

    class MockCartTool:
        async def get_cart(self, customer_id, session_id):
            return None

    nodes = GraphNodes(
        llm=None,
        product_tool=None,
        setting_tool=None,
        recommendation_tool=None,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=MockCartTool(),
        checkout_tool=None,
        purchase_tool=None,
    )

    state = {
        "session_id": "test_session_004",
        "customer_id": "",
        "platform": "web",
        "message": "hello",
        "entities": {},
        "checkout_stage": "idle",
        "cart": [],
    }

    result = await nodes.checkout_node(state)

    check("idle stage bypasses customer_id check (no reply set)",
          result.get("reply", None) is None)
    check("checkout_stage remains idle",
          result["checkout_stage"] == "idle")


async def main():
    print("=" * 60)
    print("CHECKOUT CUSTOMER_ID GUARD TESTS")
    print("=" * 60)

    await test_checkout_blocks_empty_customer_id()
    await test_checkout_blocks_invalid_customer_id()
    await test_checkout_allows_valid_customer_id()
    await test_checkout_idle_not_blocked()

    print("\n" + "=" * 60)
    print(f"RESULTS: {PASS} passed, {FAIL} failed")
    print("=" * 60)

    if FAIL > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
