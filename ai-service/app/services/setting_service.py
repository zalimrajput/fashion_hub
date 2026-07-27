from app.repositories.setting_repository import (
    SettingRepository
)


class SettingService:

    def __init__(self):

        self.repository = SettingRepository()


    async def get_settings(self):

        return await self.repository.get_settings()



    async def update_settings(
        self,
        data
    ):

        return await self.repository.update_settings(
            data
        )



    async def get_delivery_settings(self):

        settings = await self.repository.get_settings()

        if not settings:
            return None


        return {

            "sameCityCharge":
                settings.get("sameCityCharge", 0),

            "sameProvinceCharge":
                settings.get("sameProvinceCharge", 0),

            "otherProvinceCharge":
                settings.get("otherProvinceCharge", 0),

            "freeDeliveryAbove":
                settings.get("freeDeliveryAbove", 0),

            "deliveryTime":
                settings.get("deliveryTime", ""),

            "sameDayDelivery":
                settings.get("sameDayDelivery", False)
        }



    async def get_policies(self):

        settings = await self.repository.get_settings()

        if not settings:
            return None


        return {

            "returnPolicy":
                settings.get("returnPolicy", ""),

            "exchangePolicy":
                settings.get("exchangePolicy", "")
        }



    async def get_store_information(self):

        settings = await self.repository.get_settings()

        if not settings:
            return None


        return {

            "storeName":
                settings.get("storeName", ""),

            "storeCity":
                settings.get("storeCity", ""),

            "storeProvince":
                settings.get("storeProvince", ""),

            "currency":
                settings.get("currency", ""),

            "businessHours":
                settings.get("businessHours", ""),

            "isStoreOpen":
                settings.get("isStoreOpen", False)
        }



    async def get_contact_information(self):

        settings = await self.repository.get_settings()

        if not settings:
            return None


        return {

            "supportEmail":
                settings.get("supportEmail", ""),

            "supportPhone":
                settings.get("supportPhone", ""),

            "whatsappNumber":
                settings.get("whatsappNumber", ""),

            "instagramUsername":
                settings.get("instagramUsername", ""),

            "facebookPage":
                settings.get("facebookPage", "")
        }



    async def calculate_delivery_charge(
        self,
        city,
        province
    ):

        settings = await self.repository.get_settings()


        if not settings:
            return None



        store_city = settings.get(
            "storeCity",
            ""
        )


        store_province = settings.get(
            "storeProvince",
            ""
        )



        if city and city.lower() == store_city.lower():

            return {

                "type": "same_city",

                "charge":
                    settings.get(
                        "sameCityCharge",
                        0
                    )
            }



        if province and province.lower() == store_province.lower():

            return {

                "type": "same_province",

                "charge":
                    settings.get(
                        "sameProvinceCharge",
                        0
                    )
            }



        return {

            "type": "other_province",

            "charge":
                settings.get(
                    "otherProvinceCharge",
                    0
                )
        }
        
        
        
    async def create_settings(
     self,
     data
    ):

     existing = await self.repository.get_settings()

     if existing:
        return existing


     return await self.repository.create(
        data
    )



    async def delete_settings(
     self
    ):

     return await self.repository.delete_settings()    