"""
Tests for last_shown_products follow-up resolution.

Tests that:
1. _resolve_from_last_shown picks the right product by size/color
2. purchase_node uses last_shown_products when productName is empty
3. Single last_shown product → size M resolves to temp_product
4. Multiple last_shown products → ambiguous reference stays in idle with last_shown intact

Run: python -m tests.test_last_shown_products
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import asyncio
import json

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


def test_resolve_from_last_shown():
    """Directly test the static _resolve_from_last_shown method."""
    print("\n=== Test: _resolve_from_last_shown ===")

    from app.graph.nodes import GraphNodes

    products = [
        {"_id": "p1", "productName": "Black Shirt", "sizes": ["S", "M", "L"], "colors": ["Black"], "price": 1500},
        {"_id": "p2", "productName": "Blue Denim",  "sizes": ["M", "L", "XL"], "colors": ["Blue"],  "price": 2000},
        {"_id": "p3", "productName": "Red Jacket",   "sizes": ["L", "XL"],      "colors": ["Red"],   "price": 2500},
    ]

    # Match by size "M" — should pick Black Shirt and Blue Denim (both have M), so None (ambiguous)
    result = GraphNodes._resolve_from_last_shown(products, {"size": "M"})
    check("Size M with multiple candidates returns None (ambiguous)", result is None)

    # Match by size "M" and color "Black" — should pick Black Shirt only
    result = GraphNodes._resolve_from_last_shown(products, {"size": "M", "color": "Black"})
    check("Size M + color Black resolves to Black Shirt", result is not None and result["_id"] == "p1")

    # Match by size "XL" — only Blue Denim and Red Jacket have XL -> ambiguous
    result = GraphNodes._resolve_from_last_shown(products, {"size": "XL"})
    check("Size XL with multiple candidates returns None", result is None)

    # Match by color "Red" — only Red Jacket
    result = GraphNodes._resolve_from_last_shown(products, {"color": "Red"})
    check("Color Red resolves to Red Jacket", result is not None and result["_id"] == "p3")

    # Match by size "S" — only Black Shirt
    result = GraphNodes._resolve_from_last_shown(products, {"size": "S"})
    check("Size S resolves to Black Shirt", result is not None and result["_id"] == "p1")

    # Empty entities — should return None (ambiguous)
    result = GraphNodes._resolve_from_last_shown(products, {})
    check("Empty entities returns None (ambiguous)", result is None)

    # Single product in list — entities alone don't narrow, but _resolve_from_last_shown
    # requires exactly 1 candidate, so this should also return None
    single = [products[0]]
    result = GraphNodes._resolve_from_last_shown(single, {"size": "L"})
    check("Single product + matching size resolves", result is not None and result["_id"] == "p1")


async def test_purchase_node_resolves_single():
    """purchase_node with no productName and 1 last_shown product should set temp_product."""
    print("\n=== Test: purchase_node resolves single last_shown ===")

    from app.graph.nodes import GraphNodes

    class MockCheckoutTool:
        @staticmethod
        def parse_quantity(q):
            return int(q) if q else 1

    class MockProductTool:
        async def search_products(self, entities):
            return []

    nodes = GraphNodes(
        llm=None,
        product_tool=MockProductTool(),
        setting_tool=None,
        recommendation_tool=None,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=None,
        checkout_tool=MockCheckoutTool(),
        purchase_tool=None,
    )

    # State: no productName in entities, 1 last_shown product
    state = {
        "entities": {"size": "M", "color": "Black"},
        "last_shown_products": [
            {"_id": "p1", "productName": "Black Shirt", "sizes": ["S", "M", "L"], "colors": ["Black"], "price": 1500, "images": []},
        ],
        "products": [],
        "temp_product": None,
        "temp_quantity": 1,
        "checkout_stage": "idle",
    }

    result = await nodes.purchase_node(state)

    check("temp_product is set", result["temp_product"] is not None)
    check("temp_product matches Black Shirt",
          result["temp_product"]["productName"] == "Black Shirt")
    check("checkout_stage is ask_name", result["checkout_stage"] == "ask_name")
    check("last_shown_products is cleared after purchase starts",
          result["last_shown_products"] == [])


async def test_purchase_node_resolves_matched():
    """purchase_node resolves by size from multiple last_shown products."""
    print("\n=== Test: purchase_node resolves matched product from multiple ===")

    from app.graph.nodes import GraphNodes

    class MockCheckoutTool:
        @staticmethod
        def parse_quantity(q):
            return int(q) if q else 1

    class MockProductTool:
        async def search_products(self, entities):
            return []

    nodes = GraphNodes(
        llm=None,
        product_tool=MockProductTool(),
        setting_tool=None,
        recommendation_tool=None,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=None,
        checkout_tool=MockCheckoutTool(),
        purchase_tool=None,
    )

    # State: "size S" with 3 products — only Black Shirt has size S
    state = {
        "entities": {"size": "S"},
        "last_shown_products": [
            {"_id": "p1", "productName": "Black Shirt", "sizes": ["S", "M", "L"], "colors": ["Black"], "price": 1500, "images": []},
            {"_id": "p2", "productName": "Blue Denim",  "sizes": ["M", "L", "XL"], "colors": ["Blue"],  "price": 2000, "images": []},
            {"_id": "p3", "productName": "Red Jacket",   "sizes": ["L", "XL"],      "colors": ["Red"],   "price": 2500, "images": []},
        ],
        "products": [],
        "temp_product": None,
        "temp_quantity": 1,
        "checkout_stage": "idle",
    }

    result = await nodes.purchase_node(state)

    check("temp_product is set from matched size", result["temp_product"] is not None)
    check("temp_product is Black Shirt (only one with size S)",
          result["temp_product"]["productName"] == "Black Shirt")
    check("checkout_stage is ask_name", result["checkout_stage"] == "ask_name")
    check("last_shown_products cleared", result["last_shown_products"] == [])


async def test_purchase_node_ambiguous():
    """purchase_node with multiple candidates and no matching entity stays idle."""
    print("\n=== Test: purchase_node ambiguous (multiple last_shown, no match) ===")

    from app.graph.nodes import GraphNodes

    class MockCheckoutTool:
        @staticmethod
        def parse_quantity(q):
            return int(q) if q else 1

    class MockProductTool:
        async def search_products(self, entities):
            return []

    nodes = GraphNodes(
        llm=None,
        product_tool=MockProductTool(),
        setting_tool=None,
        recommendation_tool=None,
        order_tool=None,
        conversation_tool=None,
        customer_channel_tool=None,
        cart_tool=None,
        checkout_tool=MockCheckoutTool(),
        purchase_tool=None,
    )

    # State: "size M" with 3 products — Black Shirt AND Blue Denim both have M
    state = {
        "entities": {"size": "M"},
        "last_shown_products": [
            {"_id": "p1", "productName": "Black Shirt", "sizes": ["S", "M", "L"], "colors": ["Black"], "price": 1500, "images": []},
            {"_id": "p2", "productName": "Blue Denim",  "sizes": ["M", "L", "XL"], "colors": ["Blue"],  "price": 2000, "images": []},
            {"_id": "p3", "productName": "Red Jacket",   "sizes": ["L", "XL"],      "colors": ["Red"],   "price": 2500, "images": []},
        ],
        "products": [],
        "temp_product": None,
        "temp_quantity": 1,
        "checkout_stage": "idle",
    }

    result = await nodes.purchase_node(state)

    check("temp_product is NOT set (ambiguous)", result["temp_product"] is None)
    check("checkout_stage stays idle", result["checkout_stage"] == "idle")
    check("products loaded with last_shown_products (for LLM to clarify)",
          len(result["products"]) == 3)
    check("last_shown_products preserved for response context",
          len(result["last_shown_products"]) == 3)


def test_format_products_for_memory():
    """Verify the product formatting strips fields correctly."""
    print("\n=== Test: _format_products_for_memory ===")

    from app.graph.nodes import GraphNodes

    raw = [
        {"_id": "abc123", "productName": "Test Shirt", "price": 999,
         "sizes": ["M", "L"], "colors": ["Black", "White"],
         "images": ["http://img.jpg"], "category": "Men",
         "description": "A shirt", "stock": 10},
    ]

    formatted = GraphNodes._format_products_for_memory(raw)

    check("productName preserved", formatted[0]["productName"] == "Test Shirt")
    check("price preserved", formatted[0]["price"] == 999)
    check("sizes preserved", formatted[0]["sizes"] == ["M", "L"])
    check("colors preserved", formatted[0]["colors"] == ["Black", "White"])
    check("images preserved", formatted[0]["images"] == ["http://img.jpg"])
    check("extra fields stripped (category not in output)", "category" not in formatted[0])
    check("extra fields stripped (description not in output)", "description" not in formatted[0])


async def main():
    print("=" * 60)
    print("LAST_SHOWN_PRODUCTS RESOLUTION TESTS")
    print("=" * 60)

    test_resolve_from_last_shown()
    await test_purchase_node_resolves_single()
    await test_purchase_node_resolves_matched()
    await test_purchase_node_ambiguous()
    test_format_products_for_memory()

    print("\n" + "=" * 60)
    print(f"RESULTS: {PASS} passed, {FAIL} failed")
    print("=" * 60)

    if FAIL > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
