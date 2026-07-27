const CustomerChannel = require(
    "../models/CustomerChannel"
);



class CustomerChannelService
{


    async createMapping(
        customerId,
        platform,
        platformUserId
    )
    {


        let existing =
        await CustomerChannel.findOne(
        {
            platform,
            platformUserId
        });


        if(existing)
        {
            return existing;
        }



        const channel =
        await CustomerChannel.create(
        {

            customerId,

            platform,

            platformUserId

        });


        return channel;

    }



    async findCustomer(
        platform,
        platformUserId
    )
    {


        return await CustomerChannel.findOne(
        {

            platform,

            platformUserId

        });


    }


}



module.exports =
new CustomerChannelService();