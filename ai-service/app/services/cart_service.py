import logging
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository

logger = logging.getLogger("fashionhub.service")

class CartService:

    def __init__(self):
        self.cart_repo = CartRepository()
        self.product_repo = ProductRepository()

    async def get_cart(self, customer_id: str, session_id: str) -> list:
        cart = await self.cart_repo.get_cart(customer_id, session_id)
        return cart.get("items", []) if cart else []

    async def add_item(self, customer_id: str, session_id: str,
                       product_id: str, quantity: int = 1,
                       color: str = "", size: str = "") -> list:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        if product["stock"] < quantity:
            raise ValueError(f"Insufficient stock. Only {product['stock']} available.")

        price = product["price"]
        discount_pct = product.get("discount", 0)
        discount_amt = round(price * discount_pct / 100, 2)
        final_price = price - discount_amt
        subtotal = round(final_price * quantity, 2)

        new_item = {
            "productId": product_id,
            "productName": product["productName"],
            "quantity": quantity,
            "selectedColor": color,
            "selectedSize": size,
            "price": price,
            "discountPercentage": discount_pct,
            "discountAmount": discount_amt,
            "finalPrice": final_price,
            "subtotal": subtotal,
        }

        items = await self.get_cart(customer_id, session_id)
        existing_idx = None
        for i, item in enumerate(items):
            if (item["productId"] == product_id and
                item.get("selectedColor", "") == color and
                item.get("selectedSize", "") == size):
                existing_idx = i
                break

        if existing_idx is not None:
            new_qty = items[existing_idx]["quantity"] + quantity
            if product["stock"] < new_qty:
                raise ValueError(f"Insufficient stock. Only {product['stock']} available.")
            items[existing_idx]["quantity"] = new_qty
            items[existing_idx]["subtotal"] = round(final_price * new_qty, 2)
        else:
            items.append(new_item)

        await self.cart_repo.upsert_cart(customer_id, session_id, items)
        return items

    async def update_item_quantity(self, customer_id: str, session_id: str,
                                   product_id: str, quantity: int,
                                   color: str = "", size: str = "") -> list:
        if quantity < 1:
            return await self.remove_item(customer_id, session_id, product_id, color, size)

        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        if product["stock"] < quantity:
            raise ValueError(f"Insufficient stock. Only {product['stock']} available.")

        items = await self.get_cart(customer_id, session_id)
        for item in items:
            if (item["productId"] == product_id and
                item.get("selectedColor", "") == color and
                item.get("selectedSize", "") == size):
                item["quantity"] = quantity
                item["subtotal"] = round(item["finalPrice"] * quantity, 2)
                break

        await self.cart_repo.upsert_cart(customer_id, session_id, items)
        return items

    async def remove_item(self, customer_id: str, session_id: str,
                          product_id: str, color: str = "", size: str = "") -> list:
        items = await self.get_cart(customer_id, session_id)
        items = [
            i for i in items
            if not (i["productId"] == product_id and
                    i.get("selectedColor", "") == color and
                    i.get("selectedSize", "") == size)
        ]
        if items:
            await self.cart_repo.upsert_cart(customer_id, session_id, items)
        else:
            await self.cart_repo.delete_cart(customer_id, session_id)
        return items

    async def clear_cart(self, customer_id: str, session_id: str):
        await self.cart_repo.delete_cart(customer_id, session_id)

    def calculate_totals(self, items: list) -> dict:
        subtotal = round(sum(i["subtotal"] for i in items), 2)
        total_discount = round(sum(i["discountAmount"] * i["quantity"] for i in items), 2)
        return {
            "items": items,
            "item_count": len(items),
            "total_quantity": sum(i["quantity"] for i in items),
            "subtotal": subtotal,
            "total_discount": total_discount,
        }
