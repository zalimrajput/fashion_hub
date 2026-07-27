import sys
from pathlib import Path

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)


import asyncio

from app.database import (
    connect_database,
    close_database,
    get_database
)


async def check():

    await connect_database()

    db = get_database()

    products = db["products"]


    count = await products.count_documents({})


    print(
        "Product Count:",
        count
    )


    data = await products.find({}).to_list(20)


    for p in data:
        print(
            p["productName"]
        )


    await close_database()



asyncio.run(check())