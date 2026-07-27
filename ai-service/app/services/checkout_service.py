import logging
import re
import math

logger = logging.getLogger("fashionhub.service")

NEXT_STAGES = {
    "idle": "ask_name",
    "ask_name": "ask_phone",
    "ask_phone": "ask_address",
    "ask_address": "ask_city",
    "ask_city": "ask_payment",
    "ask_payment": "confirm",
    "confirm": "complete",
    "complete": "idle",
}

VALID_PAYMENT_METHODS = [
    "Cash on Delivery", "cod", "cash",
    "JazzCash", "jazzcash",
    "Easypaisa", "easypaisa",
    "Bank Transfer", "bank transfer",
    "Credit Card", "credit card", "card",
]

class CheckoutService:

    def parse_name(self, text: str) -> str:
        text = text.strip().strip(".,!?")
        if len(text) < 2:
            raise ValueError("Name too short. Please provide your full name.")
        words = text.split()
        if len(words) < 1:
            raise ValueError("Please provide at least your first name.")
        return text

    def parse_phone(self, text: str) -> str:
        text = text.strip().strip(".,!?")
        digits = re.sub(r"\D", "", text)
        if len(digits) < 7:
            raise ValueError("Phone number too short. Please provide a valid phone number.")
        return text

    def parse_quantity(self, text: str) -> int:
        text = text.strip().lower()
        # Extract number from text like "2", "two", "I want 3"
        word_map = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10}
        if text in word_map:
            return word_map[text]
        match = re.search(r"\d+", text)
        if match:
            return int(match.group())
        return 1

    def parse_address(self, text: str) -> str:
        text = text.strip().strip(".,!?")
        if len(text) < 3:
            raise ValueError("Address too short. Please provide a full address.")
        return text

    def parse_city(self, text: str) -> str:
        text = text.strip().strip(".,!?")
        if len(text) < 2:
            raise ValueError("City name too short.")
        return text

    def parse_payment(self, text: str) -> str:
        text = text.strip().lower()
        if text in ("cod", "cash", "cash on delivery"):
            return "Cash on Delivery"
        if text in ("jazzcash", "jazz cash"):
            return "JazzCash"
        if text in ("easypaisa", "easy paisa"):
            return "Easypaisa"
        if text in ("bank transfer", "bank"):
            return "Bank Transfer"
        if text in ("credit card", "card"):
            return "Credit Card"
        # Let the user correct if unknown
        raise ValueError(f"Unknown payment method. Please choose: Cash on Delivery, JazzCash, Easypaisa, Bank Transfer, or Credit Card.")

    def is_affirmative(self, text: str) -> bool:
        return text.strip().lower() in ("yes", "yeah", "yep", "sure", "confirm", "ok", "okay", "proceed", "place order")

    def is_negative(self, text: str) -> bool:
        return text.strip().lower() in ("no", "nope", "cancel", "never mind", "forget it", "not now")

    def next_stage(self, current_stage: str) -> str:
        return NEXT_STAGES.get(current_stage, "idle")
