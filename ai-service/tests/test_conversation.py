# tests/test_conversation.py

import sys
from pathlib import Path
import asyncio

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)

from app.database import (
    connect_database,
    close_database
)
from app.tools.conversation_tool import ConversationTool


async def main():

    await connect_database()

    tool = ConversationTool()

    customer_id = "6a5f372a945a1be2995a1417"

    print("\n===== CREATE =====")
    conversation = await tool.create_conversation(
        customer_id=customer_id,
        platform="WhatsApp",
        message="Hello, I want to buy a shirt."
    )

    print(conversation)

    conversation_id = conversation["_id"]

    print("\n===== GET BY ID =====")
    print(
        await tool.get_conversation_by_id(
            conversation_id
        )
    )

    print("\n===== GET CUSTOMER CONVERSATIONS =====")
    print(
        await tool.service.get_customer_conversations(
            customer_id
        )
    )

    print("\n===== GET ALL =====")
    print(
        await tool.get_conversations()
    )

    print("\n===== UPDATE CONVERSATION BY ID =====")
    print(
        await tool.update_conversation_by_id(
            conversation_id,
            {
                "platform": "Instagram",
                "lastMessage": "Conversation updated",
                "sentiment": "Interested"
            }
        )
    )

    print("\n===== ADD CUSTOMER MESSAGE =====")
    print(
        await tool.update_conversation(
            conversation_id=conversation_id,
            sender="Customer",
            message="I need size 10Y",
            intent="product_search",
            sentiment="Interested"
        )
    )

    print("\n===== ADD AI MESSAGE =====")
    print(
        await tool.update_conversation(
            conversation_id=conversation_id,
            sender="AI",
            message="Size 10Y is available.",
            intent="product_search",
            sentiment="Interested"
        )
    )

    print("\n===== RESOLVE CONVERSATION =====")
    print(
        await tool.update_conversation(
            conversation_id=conversation_id,
            sender="AI",
            message="Your order has been completed.",
            is_resolved=True
        )
    )

    # print("\n===== DELETE =====")
    # print(
    #     await tool.delete_conversation(
    #         conversation_id
    #     )
    # )

    await close_database()


if __name__ == "__main__":
    asyncio.run(main())