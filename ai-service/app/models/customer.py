from datetime import datetime


def customer_model(
    name="",
    phone_number="",
    whatsapp_number="",
    instagram_id="",
    email="",
    address="",
    city=""
):

    return {

        "name": name,

        "phoneNumber": phone_number,

        "whatsappNumber": whatsapp_number,

        "instagramId": instagram_id,

        "email": email,

        "address": address,

        "city": city,


        "preferences": {

            "favoriteCategory": "",

            "favoriteColor": "",

            "favoriteSize": "",

            "budget": 0,

            "gender": ""

        },


        "orderHistory": [],


        "createdAt": datetime.utcnow(),

        "updatedAt": datetime.utcnow()

    }