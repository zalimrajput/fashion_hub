const service =
require("../services/customerChannelService");



exports.createChannel =
async(req,res)=>
{

try
{

const result =
await service.createMapping(

req.body.customerId,

req.body.platform,

req.body.platformUserId

);


res.json(result);


}
catch(error)
{

res.status(500)
.json(
{
error:error.message
});

}

};