const mongoose = require("mongoose");


const customerChannelSchema = new mongoose.Schema(
{

    customerId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },


    platform:
    {
        type: String,
        enum:
        [
            "WhatsApp",
            "Instagram"
        ],
        required: true
    },


    platformUserId:
    {
        type: String,
        required: true
    }


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "CustomerChannel",
    customerChannelSchema
);