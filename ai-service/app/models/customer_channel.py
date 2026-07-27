from datetime import datetime


def customer_channel_model(
    customer_id,
    platform,
    platform_user_id
):

    return {

        "customerId": customer_id,

        "platform": platform,

        "platformUserId": platform_user_id,

        "createdAt": datetime.utcnow(),

        "updatedAt": datetime.utcnow()

    }