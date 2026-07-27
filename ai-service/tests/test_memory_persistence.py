"""
Verification Test: Chat Session Persistence to MongoDB

Tests that:
1. Every user and AI message is written immediately to MongoDB (messages collection)
2. Messages are keyed by sessionId and stored in order
3. ChatSessions document tracks conversation state (checkout_stage, temp fields)
4. Session state survives across messages (proves memory node is DB-backed)
5. Context/memory is still available after a simulated "server restart"

Run: python -m tests.test_memory_persistence
"""

import sys
import os
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import asyncio
import json
from datetime import datetime

from app.database import connect_database, close_database, get_database
from app.repositories.message_repository import MessageRepository
from app.repositories.chat_session_repository import ChatSessionRepository
from app.memory.chat_memory import (
    save_message,
    load_message_history,
    save_session_state,
    load_session_state,
    reset_repos,
)

TEST_SESSION_ID = f"test_session_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
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


async def verify_messages_in_order(session_id: str, expected_count: int):
    """Verify messages are stored in chronological order."""
    repo = MessageRepository()
    msgs = await repo.get_session_messages(session_id)
    check(
        f"Expected {expected_count} messages, got {len(msgs)}",
        len(msgs) == expected_count,
    )
    # Verify order
    timestamps = [m["timestamp"] for m in msgs]
    check(
        "Messages stored in chronological order",
        all(timestamps[i] <= timestamps[i + 1] for i in range(len(timestamps) - 1)),
    )
    return msgs


async def test_message_persistence():
    print("\n=== Test 1: Message Persistence ===")

    repo = MessageRepository()
    # Clean up any prior test data
    await repo.delete_session_messages(TEST_SESSION_ID)

    # Send a user message
    await save_message(TEST_SESSION_ID, "user", "show me black shirts")
    await verify_messages_in_order(TEST_SESSION_ID, 1)

    # Send an AI response
    await save_message(TEST_SESSION_ID, "assistant", "Here are our black shirts...")
    await verify_messages_in_order(TEST_SESSION_ID, 2)

    # Send more messages in sequence
    messages = [
        ("user", "I like the first one"),
        ("assistant", "Great choice! Would you like to buy it?"),
        ("user", "Yes, please"),
    ]
    for role, content in messages:
        await save_message(TEST_SESSION_ID, role, content)

    msgs = await verify_messages_in_order(TEST_SESSION_ID, 5)

    # Verify content integrity
    check(
        "First message content matches",
        msgs[0]["role"] == "user" and "black shirts" in msgs[0]["content"],
    )
    check(
        "Second message is assistant reply",
        msgs[1]["role"] == "assistant" and "black shirts" in msgs[1]["content"],
    )

    # Clean up
    await repo.delete_session_messages(TEST_SESSION_ID)


async def test_session_state_persistence():
    print("\n=== Test 2: Session State Persistence ===")

    repo = ChatSessionRepository()
    session_id = f"{TEST_SESSION_ID}_state"

    # Save initial session state (e.g., after first message in a purchase flow)
    state1 = {
        "checkout_stage": "ask_name",
        "temp_product": None,
        "temp_quantity": 1,
        "temp_name": "",
        "temp_phone": "",
        "temp_address": "",
        "temp_city": "",
        "temp_payment": "Cash on Delivery",
        "purchase_confirmed": False,
        "purchase_result": None,
    }
    await save_session_state(session_id, state1)

    # Load it back
    loaded1 = await load_session_state(session_id)
    check(
        "Checkout stage persisted as 'ask_name'",
        loaded1.get("checkout_stage") == "ask_name",
    )
    check(
        "Default payment persisted",
        loaded1.get("temp_payment") == "Cash on Delivery",
    )

    # Simulate customer providing name (2nd turn)
    state2 = dict(state1)
    state2["checkout_stage"] = "ask_phone"
    state2["temp_name"] = "John Doe"
    await save_session_state(session_id, state2)

    loaded2 = await load_session_state(session_id)
    check(
        "Stage updated to 'ask_phone'",
        loaded2.get("checkout_stage") == "ask_phone",
    )
    check(
        "Customer name persisted",
        loaded2.get("temp_name") == "John Doe",
    )

    # Simulate customer providing phone + address + city (3rd-5th turns)
    state3 = dict(state2)
    state3["checkout_stage"] = "confirm"
    state3["temp_phone"] = "+923001234567"
    state3["temp_address"] = "123 Main Street, Block A"
    state3["temp_city"] = "Lahore"
    await save_session_state(session_id, state3)

    loaded3 = await load_session_state(session_id)
    check(
        "Stage updated to 'confirm'",
        loaded3.get("checkout_stage") == "confirm",
    )
    check(
        "Phone number persisted",
        loaded3.get("temp_phone") == "+923001234567",
    )
    check(
        "Address persisted",
        "123 Main Street" in loaded3.get("temp_address", ""),
    )
    check(
        "City persisted",
        loaded3.get("temp_city") == "Lahore",
    )

    # Simulate order completion (6th turn)
    state4 = dict(state3)
    state4["checkout_stage"] = "complete"
    state4["purchase_confirmed"] = True
    state4["purchase_result"] = {"orderId": "ORD-TEST123", "status": "Pending"}
    await save_session_state(session_id, state4)

    loaded4 = await load_session_state(session_id)
    check(
        "Stage updated to 'complete'",
        loaded4.get("checkout_stage") == "complete",
    )
    check(
        "Purchase confirmed flag persisted",
        loaded4.get("purchase_confirmed") is True,
    )
    check(
        "Order result persisted with orderId",
        loaded4.get("purchase_result", {}).get("orderId") == "ORD-TEST123",
    )

    # Clean up
    await repo.delete_by_session_id(session_id)


async def test_cross_turn_state_survival():
    """
    Test 3: State survival across messages (simulates multi-turn flow).
    Writes messages + state in sequence, then validates both collections
    have the complete picture — proves the memory node is DB-backed.
    """
    print("\n=== Test 3: Cross-Turn State Survival ===")

    session_id = f"{TEST_SESSION_ID}_flow"
    msg_repo = MessageRepository()
    await msg_repo.delete_session_messages(session_id)
    sess_repo = ChatSessionRepository()
    await sess_repo.delete_by_session_id(session_id)

    # Turn 1: Customer asks about products
    await save_message(session_id, "user", "show me black shirts")
    await save_session_state(session_id, {"checkout_stage": "idle"})

    # Turn 2: Customer wants to buy
    await save_message(
        session_id, "user", "I want to buy the premium black shirt"
    )
    await save_session_state(
        session_id,
        {
            "checkout_stage": "ask_name",
            "temp_product": {
                "_id": "507f1f77bcf86cd799439011",
                "productName": "Premium Black Shirt",
                "price": 1500,
                "discount": 10,
            },
        },
    )

    # Turn 3: Customer provides name
    await save_message(session_id, "user", "My name is Ali Khan")
    await save_session_state(
        session_id,
        {
            "checkout_stage": "ask_phone",
            "temp_product": {
                "_id": "507f1f77bcf86cd799439011",
                "productName": "Premium Black Shirt",
                "price": 1500,
                "discount": 10,
            },
            "temp_name": "Ali Khan",
        },
    )

    # Turn 4: Customer provides phone
    await save_message(session_id, "user", "0300-1234567")
    await save_session_state(
        session_id,
        {
            "checkout_stage": "ask_address",
            "temp_product": {
                "_id": "507f1f77bcf86cd799439011",
                "productName": "Premium Black Shirt",
                "price": 1500,
                "discount": 10,
            },
            "temp_name": "Ali Khan",
            "temp_phone": "0300-1234567",
        },
    )

    # Turn 5: Customer provides address
    await save_message(session_id, "user", "House 12, Street 5, Gulberg")
    await save_session_state(
        session_id,
        {
            "checkout_stage": "ask_city",
            "temp_product": {
                "_id": "507f1f77bcf86cd799439011",
                "productName": "Premium Black Shirt",
                "price": 1500,
                "discount": 10,
            },
            "temp_name": "Ali Khan",
            "temp_phone": "0300-1234567",
            "temp_address": "House 12, Street 5, Gulberg",
        },
    )

    # Turn 6: Customer provides city
    await save_message(session_id, "user", "Lahore")
    await save_session_state(
        session_id,
        {
            "checkout_stage": "ask_payment",
            "temp_product": {
                "_id": "507f1f77bcf86cd799439011",
                "productName": "Premium Black Shirt",
                "price": 1500,
                "discount": 10,
            },
            "temp_name": "Ali Khan",
            "temp_phone": "0300-1234567",
            "temp_address": "House 12, Street 5, Gulberg",
            "temp_city": "Lahore",
        },
    )

    # Turn 7: Customer chooses payment
    await save_message(session_id, "user", "Cash on Delivery")
    await save_session_state(
        session_id,
        {
            "checkout_stage": "confirm",
            "temp_product": {
                "_id": "507f1f77bcf86cd799439011",
                "productName": "Premium Black Shirt",
                "price": 1500,
                "discount": 10,
            },
            "temp_name": "Ali Khan",
            "temp_phone": "0300-1234567",
            "temp_address": "House 12, Street 5, Gulberg",
            "temp_city": "Lahore",
            "temp_payment": "Cash on Delivery",
        },
    )

    # Turn 8: Customer confirms
    await save_message(session_id, "user", "yes, confirm")
    await save_session_state(
        session_id,
        {
            "checkout_stage": "complete",
            "purchase_confirmed": True,
            "purchase_result": {
                "orderId": "ORD-TEST789",
                "status": "Pending",
            },
            "temp_product": {
                "_id": "507f1f77bcf86cd799439011",
                "productName": "Premium Black Shirt",
                "price": 1500,
                "discount": 10,
            },
            "temp_name": "Ali Khan",
            "temp_phone": "0300-1234567",
            "temp_address": "House 12, Street 5, Gulberg",
            "temp_city": "Lahore",
            "temp_payment": "Cash on Delivery",
        },
    )

    # ==========================================
    # VERIFICATION
    # ==========================================

    # 1. Verify all 8 messages persisted in order
    msgs = await msg_repo.get_session_messages(session_id)
    check(
        f"All 8 messages persisted (got {len(msgs)})",
        len(msgs) == 8,
    )
    if len(msgs) == 8:
        expected_roles = ["user"] * 8
        actual_roles = [m["role"] for m in msgs]
        check(
            "Messages alternate correctly (all user in this flow)",
            actual_roles == expected_roles,
        )
        check(
            "First message preserved",
            "black shirts" in msgs[0]["content"],
        )
        check(
            "Last message is confirmation",
            "confirm" in msgs[7]["content"],
        )

    # 2. Verify session state complete
    final_state = await load_session_state(session_id)
    check(
        "Final stage is 'complete'",
        final_state.get("checkout_stage") == "complete",
    )
    check(
        "Name 'Ali Khan' saved",
        final_state.get("temp_name") == "Ali Khan",
    )
    check(
        "Phone number saved",
        "0300" in final_state.get("temp_phone", ""),
    )
    check(
        "Address saved",
        "Gulberg" in final_state.get("temp_address", ""),
    )
    check(
        "City 'Lahore' saved",
        final_state.get("temp_city") == "Lahore",
    )
    check(
        "Payment method saved",
        final_state.get("temp_payment") == "Cash on Delivery",
    )
    check(
        "Order ID in purchase result",
        final_state.get("purchase_result", {}).get("orderId") == "ORD-TEST789",
    )

    # 3. Load message history (simulates loading memory for next turn)
    history = await load_message_history(session_id)
    check(
        f"History loads {len(history)} messages for context",
        len(history) == 8,
    )
    if len(history) >= 2:
        check(
            "History contains correct roles",
            history[0]["role"] == "user",
        )

    # Clean up
    await msg_repo.delete_session_messages(session_id)
    await sess_repo.delete_by_session_id(session_id)


async def test_non_existent_session():
    """Test 4: Loading state for a session that doesn't exist returns empty dict."""
    print("\n=== Test 4: Non-existent Session Handling ===")

    fake_state = await load_session_state("nonexistent_session_xyz")
    check(
        "Non-existent session returns empty dict",
        fake_state == {},
    )

    fake_history = await load_message_history("nonexistent_session_xyz")
    check(
        "Non-existent session returns empty history list",
        fake_history == [],
    )


async def test_survives_restart():
    """
    Test 5: Simulates a server restart by closing and re-opening the database
    connection, then verifying that session data survives.
    """
    print("\n=== Test 5: Survives Restart (DB persistence) ===")

    session_id = f"{TEST_SESSION_ID}_restart"
    msg_repo = MessageRepository()
    await msg_repo.delete_session_messages(session_id)
    sess_repo = ChatSessionRepository()
    await sess_repo.delete_by_session_id(session_id)

    # Send message 1 and save state
    await save_message(session_id, "user", "show me blue jeans")
    await save_session_state(
        session_id,
        {
            "checkout_stage": "idle",
            "last_search": "blue jeans",
        },
    )

    # Verify data was written before restart
    pre_msgs = await load_message_history(session_id)
    pre_state = await load_session_state(session_id)
    check(
        "Pre-restart: message written",
        len(pre_msgs) == 1 and "blue jeans" in pre_msgs[0]["content"],
    )
    check(
        "Pre-restart: state written",
        pre_state.get("checkout_stage") == "idle",
    )

    # Simulate server restart — close and re-open database
    await close_database()
    await connect_database()
    reset_repos()  # invalidate cached repo objects so they re-resolve the new connection

    # Load data again as a fresh process would
    post_msgs = await load_message_history(session_id)
    post_state = await load_session_state(session_id)

    check(
        "Post-restart: message history survives",
        len(post_msgs) == 1 and "blue jeans" in post_msgs[0]["content"],
    )
    check(
        "Post-restart: session state survives",
        post_state.get("checkout_stage") == "idle",
    )
    check(
        "Post-restart: custom field survives",
        post_state.get("last_search") == "blue jeans",
    )

    # Clean up after restart — re-create repos since old ones are closed
    reset_repos()
    msg_repo2 = MessageRepository()
    sess_repo2 = ChatSessionRepository()
    await msg_repo2.delete_session_messages(session_id)
    await sess_repo2.delete_by_session_id(session_id)


async def main():
    print("=" * 60)
    print("FASHIONHUB AI - MEMORY PERSISTENCE VERIFICATION")
    print("=" * 60)
    print(f"Test Session Prefix: {TEST_SESSION_ID}")

    await connect_database()
    db = get_database()
    # Ensure collections exist so indexes can be created
    for col_name in ("messages", "chatsessions"):
        if col_name not in await db.list_collection_names():
            await db.create_collection(col_name)
    # Drop leftover indexes that collide with new schema
    try:
        await db["chatsessions"].drop_index("phoneNumber_1")
    except Exception:
        pass

    await test_message_persistence()
    await test_session_state_persistence()
    await test_cross_turn_state_survival()
    await test_non_existent_session()
    await test_survives_restart()

    await close_database()

    print("\n" + "=" * 60)
    print(f"RESULTS: {PASS} passed, {FAIL} failed")
    print("=" * 60)

    if FAIL > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
