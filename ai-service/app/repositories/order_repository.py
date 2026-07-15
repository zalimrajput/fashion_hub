from app.core.database import Database


class OrderRepository:

    def __init__(self):
        self.db = Database.get_database()
        self.collection = self.db["orders"]

    def get_order_by_order_id(self, order_id):
        return self.collection.find_one(
            {
                "orderId": order_id
            }
        )

    def get_orders_by_customer(self, customer_id):
        return list(
            self.collection.find(
                {
                    "customer": customer_id
                }
            )
        )

    def get_latest_order(self, customer_id):
        return self.collection.find_one(
            {
                "customer": customer_id
            },
            sort=[("createdAt", -1)]
        )

    def get_order_status(self, order_id):
        order = self.get_order_by_order_id(order_id)

        if order:
            return order.get("status")

        return None