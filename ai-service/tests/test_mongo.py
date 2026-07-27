import sys
from pathlib import Path

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)


import asyncio

from app.database import (
    connect_database,
    close_database
)



async def test():

    await connect_database()

    print("Mongo OK")

    await close_database()



asyncio.run(test())