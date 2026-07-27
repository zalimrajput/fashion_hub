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

from app.tools.customer_channel_tool import CustomerChannelTool



async def test():

    try:

        await connect_database()


        tool = CustomerChannelTool()



        customer_id = "6a5f52241132472bf6b115b7"



        print("\n======== FIND EXISTING WHATSAPP CHANNEL ========")


        channel = await tool.find_customer(

            "WhatsApp",

            "923001234568"

        )


        print(channel)



        print("\n======== CREATE CHANNEL ========")


        from app.services.customer_channel_service import CustomerChannelService


        service = CustomerChannelService()


        created = await service.get_or_create_channel(

            customer_id,

            "WhatsApp",

            "923001234568"

        )


        print(created)



        print("\n======== FIND CREATED CHANNEL ========")


        channel = await tool.find_customer(

            "WhatsApp",

            "923001234568"

        )


        print(channel)



    except Exception as e:

        print("\nERROR:")
        print(e)



    finally:

        await close_database()



asyncio.run(test())