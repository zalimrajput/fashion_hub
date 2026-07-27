const mongoose = require("mongoose");


const chatSessionSchema = new mongoose.Schema({

    phoneNumber:{
        type:String,
        required:true,
        unique:true
    },


    step:{
        type:String,
        default:"START"
    },


    selectedProduct:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        default:null
    },


    quantity:{
        type:Number,
        default:1
    },


    size:{
        type:String,
        default:""
    },


    color:{
        type:String,
        default:""
    },


    customerName:{
        type:String,
        default:""
    },


    address:{
        type:String,
        default:""
    },


    city:{
        type:String,
        default:""
    },


    province:{
        type:String,
        default:""
    },


    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        default:null
    },


    orderCreated:{
        type:Boolean,
        default:false
    }


},{
timestamps:true
});


module.exports =
mongoose.model(
"ChatSession",
chatSessionSchema
);