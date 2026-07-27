# import sys
# from pathlib import Path
# import asyncio

# sys.path.append(
#     str(Path(__file__).resolve().parent.parent)
# )


# from app.database import (
#     connect_database,
#     close_database
# )

# from app.tools.setting_tool import SettingTool



# async def main():

#     await connect_database()

#     tool = SettingTool()


#     print("\n===== CREATE SETTINGS =====")

#     setting_data = {

#         "storeName": "FashionHub",

#         "storeCity": "Rawalpindi",

#         "storeProvince": "Punjab",

#         "currency": "PKR",

#         "supportEmail": "support@fashionhub.com",

#         "supportPhone": "03001234567",

#         "whatsappNumber": "03001234567",

#         "instagramUsername": "fashionhub",

#         "facebookPage": "fashionhub.pk",


#         "sameCityCharge": 200,

#         "sameProvinceCharge": 250,

#         "otherProvinceCharge": 350,

#         "freeDeliveryAbove": 10000,


#         "deliveryTime": "3-5 Days",

#         "sameDayDelivery": True,


#         "returnPolicy":
#             "7 days return available",

#         "exchangePolicy":
#             "Exchange within 7 days"


#     }


#     print(
#         await tool.create_settings(
#             setting_data
#         )
#     )



#     print("\n===== GET SETTINGS =====")

#     print(
#         await tool.get_settings()
#     )



#     print("\n===== UPDATE SETTINGS =====")

#     print(
#         await tool.update_settings(
#             {
#                 "deliveryTime": "2-4 Days",
#                 "sameCityCharge": 150
#             }
#         )
#     )



#     print("\n===== DELIVERY SETTINGS =====")

#     print(
#         await tool.get_delivery_settings()
#     )



#     print("\n===== STORE INFORMATION =====")

#     print(
#         await tool.get_store_information()
#     )



#     print("\n===== CONTACT INFORMATION =====")

#     print(
#         await tool.get_contact_information()
#     )



#     print("\n===== POLICIES =====")

#     print(
#         await tool.get_policies()
#     )



#     print("\n===== CALCULATE DELIVERY SAME CITY =====")

#     print(
#         await tool.calculate_delivery_charge(
#             city="Rawalpindi",
#             province="Punjab"
#         )
#     )



#     print("\n===== CALCULATE DELIVERY SAME PROVINCE =====")

#     print(
#         await tool.calculate_delivery_charge(
#             city="Lahore",
#             province="Punjab"
#         )
#     )



#     print("\n===== CALCULATE DELIVERY OTHER PROVINCE =====")

#     print(
#         await tool.calculate_delivery_charge(
#             city="Karachi",
#             province="Sindh"
#         )
#     )



#     # print("\n===== DELETE SETTINGS =====")

#     # print(
#     #     await tool.delete_settings()
#     # )



#     await close_database()



# if __name__ == "__main__":

#     asyncio.run(main())




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

from app.tools.setting_tool import SettingTool



async def main():

    await connect_database()

    tool = SettingTool()


    print("\n===== TEST CREATE SETTINGS =====")


    setting_data = {

        "storeName": "TEST NEW STORE",

        "storeCity": "Islamabad",

        "storeProvince": "Punjab",

        "currency": "PKR",

        "supportEmail":
            "test@fashionhub.com",

        "supportPhone":
            "03111111111",

        "whatsappNumber":
            "03111111111",

        "instagramUsername":
            "testfashionhub",

        "facebookPage":
            "testfashionhub.pk",


        "sameCityCharge": 200,

        "sameProvinceCharge": 250,

        "otherProvinceCharge": 350,

        "freeDeliveryAbove": 10000,


        "deliveryTime":
            "3-5 Days",

        "sameDayDelivery":
            True,


        "returnPolicy":
            "7 days return available",


        "exchangePolicy":
            "Exchange within 7 days"

    }



    created = await tool.create_settings(
        setting_data
    )


    print(created)



    print("\n===== GET SETTINGS =====")


    settings = await tool.get_settings()


    print(settings)



    print("\n===== UPDATE SETTINGS =====")


    updated = await tool.update_settings({

        "deliveryTime":
            "2-4 Days",

        "sameCityCharge":
            150

    })


    print(updated)



    print("\n===== DELIVERY SETTINGS =====")


    print(
        await tool.get_delivery_settings()
    )



    print("\n===== STORE INFORMATION =====")


    print(
        await tool.get_store_information()
    )



    print("\n===== CONTACT INFORMATION =====")


    print(
        await tool.get_contact_information()
    )



    print("\n===== POLICIES =====")


    print(
        await tool.get_policies()
    )



    print("\n===== SAME CITY DELIVERY =====")


    print(
        await tool.calculate_delivery_charge(
            city="Rawalpindi",
            province="Punjab"
        )
    )



    print("\n===== SAME PROVINCE DELIVERY =====")


    print(
        await tool.calculate_delivery_charge(
            city="Lahore",
            province="Punjab"
        )
    )



    print("\n===== OTHER PROVINCE DELIVERY =====")


    print(
        await tool.calculate_delivery_charge(
            city="Karachi",
            province="Sindh"
        )
    )



    # Uncomment only when testing delete
    #
    # print("\n===== DELETE SETTINGS =====")
    #
    # print(
    #     await tool.delete_settings()
    # )


    await close_database()



if __name__ == "__main__":

    asyncio.run(main())