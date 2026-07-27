# import sys
# from pathlib import Path

# sys.path.append(
#     str(Path(__file__).resolve().parent.parent)
# )


# import asyncio

# from app.database import (
#     connect_database,
#     close_database
# )

# from app.tools.product_tool import ProductTool



# async def test():

#     await connect_database()


#     tool = ProductTool()



#     print("\n======== ALL PRODUCTS ========")

#     products = await tool.get_all_products()

#     print(products)



#     print("\n======== SEARCH PRODUCT ========")


#     filters = {

#         "gender": "Boys",
#         "category": "Kids Dresses"

#     }


#     result = await tool.search_products(
#         filters
#     )


#     print(result)



#     print("\n======== GET PRODUCT BY ID ========")


#     product_id = "6a5b383f285bd76c64397a42"


#     product = await tool.get_product(
#         product_id
#     )


#     print(product)



#     await close_database()



# asyncio.run(test())









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

from app.tools.product_tool import ProductTool


async def main():

    # Connect MongoDB
    await connect_database()

    try:

        tool = ProductTool()

        # -----------------------------
        # CREATE
        # -----------------------------
        product = await tool.create_product(
            {
                "productName": "Test Shirt",
                "category": "Men",
                "subCategory": "Casual",
                "description": "Testing product",
                "price": 2000,
                "discount": 10,
                "sizes": ["M", "L"],
                "colors": ["Black", "Blue"],
                "stock": 20,
                "gender": "Men",
                "season": ["Summer"],
                "isTrending": False,
                "isBestSeller": False,
                "status": "Active",
                "images": []
            }
        )

        print("\n===== CREATED =====")
        print(product)

        product_id = product["_id"]

        # -----------------------------
        # GET BY ID
        # -----------------------------
        single = await tool.get_product(product_id)

        print("\n===== GET BY ID =====")
        print(single)

        # -----------------------------
        # UPDATE
        # -----------------------------
        updated = await tool.update_product(
            product_id,
            {
                "price": 2500,
                "stock": 15
            }
        )

        print("\n===== UPDATED =====")
        print(updated)

        # -----------------------------
        # GET ALL
        # -----------------------------
        products = await tool.get_all_products()

        print("\n===== GET ALL =====")
        print(products)

        # -----------------------------
        # DELETE
        # -----------------------------
        deleted = await tool.delete_product(product_id)

        print("\n===== DELETED =====")
        print(deleted)

    finally:
        # Close MongoDB
        await close_database()


if __name__ == "__main__":
    asyncio.run(main())