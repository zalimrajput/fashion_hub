from app.services.setting_service import (
    SettingService
)


class SettingTool:

    def __init__(self):

        self.service = SettingService()

    async def get_settings(self):

        return await self.service.get_settings()

    async def update_settings(
        self,
        data
    ):

        return await self.service.update_settings(
            data
        )

    async def get_delivery_settings(self):

        return await self.service.get_delivery_settings()

    async def get_policies(self):

        return await self.service.get_policies()

    async def get_store_information(self):

        return await self.service.get_store_information()

    async def get_contact_information(self):

        return await self.service.get_contact_information()
    
    async def calculate_delivery_charge(
        self,
        city,
        province
    ):

      return await self.service.calculate_delivery_charge(
        city,
        province
    )
      
      
      
      
    async def create_settings(
     self,
     data
    ):

     return await self.service.create_settings(
        data
    )



    async def delete_settings(
     self
    ):

     return await self.service.delete_settings()   