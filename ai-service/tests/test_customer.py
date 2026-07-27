import sys
from pathlib import Path
import uuid
import asyncio

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)

from app.database import (
    connect_database,
    close_database
)

from app.tools.customer_tool import CustomerTool


async def main():

    await connect_database()

    tool = CustomerTool()

    # Generate unique values every run
    unique = uuid.uuid4().hex[:6]

    phone = f"92300123{unique}"
    instagram = f"ali_{unique}"

    # -----------------------------
    # CREATE
    # -----------------------------
    customer = await tool.create_customer(
        {
            "name": "Ali Khan",
            "phoneNumber": phone,
            "whatsappNumber": phone,
            "instagramId": instagram,
            "email": f"{unique}@test.com",
            "address": "Rawalpindi",
            "city": "Rawalpindi"
        }
    )

    print("\n===== CREATED =====")
    print(customer)

    customer_id = customer["_id"]

    # -----------------------------
    # GET BY ID
    # -----------------------------
    customer = await tool.get_customer_by_id(
        customer_id
    )

    print("\n===== GET BY ID =====")
    print(customer)

    # -----------------------------
    # GET ALL
    # -----------------------------
    customers = await tool.get_all_customers()

    print("\n===== GET ALL =====")
    print(customers)

    # -----------------------------
    # FIND BY WHATSAPP
    # -----------------------------
    customer = await tool.whatsapp_customer(
        phone
    )

    print("\n===== FIND BY WHATSAPP =====")
    print(customer)

    # -----------------------------
    # FIND BY INSTAGRAM
    # -----------------------------
    customer = await tool.instagram_customer(
        instagram
    )

    print("\n===== FIND BY INSTAGRAM =====")
    print(customer)

    # -----------------------------
    # UPDATE
    # -----------------------------
    customer = await tool.update_customer(
        customer_id,
        {
            "address": "F-8 Islamabad",
            "city": "Islamabad"
        }
    )

    print("\n===== UPDATED =====")
    print(customer)

    # -----------------------------
    # DELETE
    # -----------------------------
    deleted = await tool.delete_customer(
        customer_id
    )

    print("\n===== DELETED =====")
    print(deleted)

    await close_database()


asyncio.run(main())