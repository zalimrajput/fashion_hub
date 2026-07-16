from app.repositories.order_repository import OrderRepository


class OrderTool:

    def __init__(self):
        self.repository = OrderRepository()

    def get_order_by_order_id(self, order_id):
        return self.repository.get_order_by_order_id(order_id)

    def get_orders_by_customer(self, customer_id):
        return self.repository.get_orders_by_customer(customer_id)

    def get_latest_order(self, customer_id):
        return self.repository.get_latest_order(customer_id)

    def get_order_status(self, order_id):
        return self.repository.get_order_status(order_id)