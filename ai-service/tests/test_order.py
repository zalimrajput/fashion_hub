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

from app.tools.order_tool import OrderTool



async def main():


    await connect_database()


    tool = OrderTool()



    customer_id = "6a5f372a945a1be2995a1417"


    product_id = "6a5b383f285bd76c64397a42"



    print("\n===== CREATE ORDER =====")


    order = await tool.create_order(

        customer=customer_id,

        items=[

            {
                "product": product_id,

                "quantity":2,

                "selectedSize":"10Y",

                "selectedColor":"Black"
            }

        ],

        shipping_address="House 10 Rawalpindi",

        city="Rawalpindi",

        province="Punjab",

        payment_method="Cash on Delivery",

        notes="AI test order"

    )


    print(order)



    order_id = order["_id"]

    order_number = order["orderId"]



    print("\n===== GET ORDER BY ID =====")


    print(

        await tool.get_order(
            order_id
        )

    )



    print("\n===== GET ORDER BY NUMBER =====")


    print(

        await tool.get_order_by_number(
            order_number
        )

    )



    print("\n===== GET ALL ORDERS ADMIN =====")


    print(

        await tool.get_orders()

    )



    print("\n===== GET CUSTOMER ORDERS =====")


    print(

        await tool.get_customer_orders(
            customer_id
        )

    )



    print("\n===== UPDATE STATUS =====")


    print(

        await tool.update_status(

            order_number,

            "Confirmed"

        )

    )



    print("\n===== UPDATE TRACKING =====")


    print(

        await tool.update_tracking(

            order_number,

            "TRK123456"

        )

    )



    print("\n===== UPDATE ORDER =====")


    print(

        await tool.update_order(

            order_id,

            {
                "notes":
                "Updated by admin"
            }

        )

    )



    print("\n===== CUSTOMER CANCEL ORDER =====")


    print(

        await tool.cancel_order(

            order_number

        )

    )



    print("\n===== DELETE ORDER ADMIN =====")


    # Uncomment only when testing permanent delete

    # print(
    #     await tool.delete_order(
    #         order_id
    #     )
    # )



    await close_database()



if __name__ == "__main__":

    asyncio.run(main())