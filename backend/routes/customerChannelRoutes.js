const router=require("express").Router();


const controller =
require("../controllers/customerChannelController");



router.post(
"/",
controller.createChannel
);



module.exports=router;