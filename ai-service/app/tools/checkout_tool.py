import logging
from app.services.checkout_service import CheckoutService

logger = logging.getLogger("fashionhub.tool")

class CheckoutTool:

    def __init__(self):
        self.service = CheckoutService()

    def parse_name(self, text: str) -> str:
        return self.service.parse_name(text)

    def parse_phone(self, text: str) -> str:
        return self.service.parse_phone(text)

    def parse_quantity(self, text: str) -> int:
        return self.service.parse_quantity(text)

    def parse_address(self, text: str) -> str:
        return self.service.parse_address(text)

    def parse_city(self, text: str) -> str:
        return self.service.parse_city(text)

    def parse_payment(self, text: str) -> str:
        return self.service.parse_payment(text)

    def is_affirmative(self, text: str) -> bool:
        return self.service.is_affirmative(text)

    def is_negative(self, text: str) -> bool:
        return self.service.is_negative(text)

    def next_stage(self, current_stage: str) -> str:
        return self.service.next_stage(current_stage)
