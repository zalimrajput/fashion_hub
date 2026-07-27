const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
{
    sender:{
        type:String,
        enum:[
            "Customer",
            "AI",
            "Admin"
        ],
        required:true
    },


    message:{
        type:String,
        required:true,
        trim:true
    },


    messageType:{
        type:String,
        enum:[
            "Text",
            "Image",
            "Video",
            "Document"
        ],
        default:"Text"
    },


    metadata:{


        intent:{
            type:String,
            default:""
        },


        entities:{
            type:Object,
            default:{}
        },


        productIds:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            }
        ],


        orderId:{
            type:String,
            default:""
        }

    },


    timestamp:{
        type:Date,
        default:Date.now
    }


},
{
    _id:false
});


const conversationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    platform: {
      type: String,
      enum: ["Instagram", "WhatsApp"],
      required: true,
    },

    messages: [messageSchema],

    lastMessage: {
      type: String,
      default: "",
    },

    
    intent: {
      type: String,
      default: "",
    },
    
    lastIntent: {
     type: String,
     default: "",
    },

    
    sentiment: {
      type: String,
      enum: [
        "happy",
        "interested",
        "neutral",
        "frustrated",
        "angry",
      ],
      default: "neutral",
    },

    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);