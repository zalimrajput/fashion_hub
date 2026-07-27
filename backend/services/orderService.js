// const mongoose = require("mongoose");

// const Order = require("../models/Order");
// const Product = require("../models/Product");
// const Customer = require("../models/Customer");

// // ==============================
// // Create Order
// // ==============================

// const createOrderService = async (orderData) => {

//     const session = await mongoose.startSession();

//     session.startTransaction();

//     try {

//         // ==========================
//         // Generate Order Number
//         // ==========================

//         const lastOrder = await Order.findOne()
//             .sort({ createdAt: -1 })
//             .session(session);

//         let nextNumber = 1001;

//         if (lastOrder && lastOrder.orderId) {

//             const lastId = parseInt(lastOrder.orderId.split("-")[1]);

//             nextNumber = lastId + 1;

//         }

//         const orderItems = [];

//         let subtotal = 0;

//         let totalDiscount = 0;

//         // ==========================
//         // Process Every Product
//         // ==========================

//         for (const item of orderData.products) {

//             const product = await Product.findById(item.product).session(session);

//             if (!product) {

//                 throw new Error(`Product not found : ${item.product}`);

//             }

//             // Product Disabled

//             if (!product.status) {

//                 throw new Error(`${product.productName} is unavailable`);

//             }

//             // Stock Check

//             if (product.stock < item.quantity) {

//                 throw new Error(
//                     `${product.productName} has only ${product.stock} item(s) left`
//                 );

//             }

//             // ==========================
//             // Price Calculation
//             // ==========================

//             const originalPrice = product.price;

//             const discountPercentage = product.discount || 0;

//             const discountAmount =
//                 (originalPrice * discountPercentage) / 100;

//             const finalPrice =
//                 originalPrice - discountAmount;

//             const itemSubtotal =
//                 finalPrice * item.quantity;

//             subtotal += originalPrice * item.quantity;

//             totalDiscount += discountAmount * item.quantity;

//             // ==========================
//             // Reduce Stock
//             // ==========================

//             product.stock -= item.quantity;

//             await product.save({ session });

//             // ==========================
//             // Save Item
//             // ==========================

//             orderItems.push({

//                 product: product._id,

//                 productName: product.productName,

//                 quantity: item.quantity,

//                 selectedSize: item.selectedSize,

//                 selectedColor: item.selectedColor,

//                 originalPrice,

//                 discountPercentage,

//                 discountAmount,

//                 finalPrice,

//                 subtotal: itemSubtotal,

//             });

//         }

//                 // ==========================
//         // Delivery Charges
//         // ==========================

//         const deliveryCharges = orderData.deliveryCharges || 0;

//         // Customer pays after discount
//         const grandTotal =
//             subtotal - totalDiscount + deliveryCharges;

//         // ==========================
//         // Check Customer
//         // ==========================

//         const customer = await Customer.findById(
//             orderData.customer
//         ).session(session);

//         if (!customer) {

//             throw new Error("Customer not found");

//         }

//         // ==========================
//         // Create Order
//         // ==========================

//         const order = await Order.create(
//             [
//                 {

//                     orderId: `ORD-${nextNumber}`,

//                     customer: customer._id,

//                     products: orderItems,

//                     subtotal,

//                     totalDiscount,

//                     deliveryCharges,

//                     grandTotal,

//                     paymentMethod: orderData.paymentMethod,

//                     paymentStatus:
//                         orderData.paymentStatus || "Pending",

//                     status:
//                         orderData.status || "Pending",

//                     shippingAddress:
//                         orderData.shippingAddress,

//                     city: orderData.city,

//                     notes: orderData.notes || "",

//                 },
//             ],
//             { session }
//         );

//         // ==========================
//         // Add Order To Customer History
//         // ==========================

//         customer.orderHistory.push(order[0]._id);

//         await customer.save({ session });

//         // ==========================
//         // Commit Transaction
//         // ==========================

//         await session.commitTransaction();

//         session.endSession();

//         return order[0];

//     } catch (error) {

//         // ==========================
//         // Rollback
//         // ==========================

//         await session.abortTransaction();

//         session.endSession();

//         throw error;

//     }

// };

// module.exports = {
//     createOrderService,
// }; 



const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Setting = require("../models/Setting");


// ==============================
// Create Order Service
// ==============================

const createOrderService = async (orderData) => {


    const session = await mongoose.startSession();


    session.startTransaction();


    try {


        // ==============================
        // Generate Order ID
        // ==============================


        const lastOrder = await Order.findOne()
            .sort({ createdAt: -1 })
            .session(session);



        let nextNumber = 1001;



        if(lastOrder && lastOrder.orderId){


            const lastId =
                parseInt(
                    lastOrder.orderId.split("-")[1]
                );


            nextNumber = lastId + 1;

        }





        const orderItems = [];


        let subtotal = 0;


        let totalDiscount = 0;





        // ==============================
        // Process Products
        // ==============================


        for(const item of orderData.products){



            const product =
                await Product.findById(
                    item.product
                )
                .session(session);




            if(!product){


                throw new Error(
                    `Product not found : ${item.product}`
                );


            }




            // Product Status Check

            if(!product.status){


                throw new Error(
                    `${product.productName} is unavailable`
                );


            }





            // Stock Check

            if(product.stock < item.quantity){


                throw new Error(
                    `${product.productName} has only ${product.stock} item(s) left`
                );


            }





            // ==============================
            // Price Calculation
            // ==============================


            const originalPrice =
                product.price;



            const discountPercentage =
                product.discount || 0;




            const discountAmount =
                (originalPrice * discountPercentage) / 100;




            const finalPrice =
                originalPrice - discountAmount;




            const itemSubtotal =
                finalPrice * item.quantity;





            subtotal +=
                originalPrice * item.quantity;




            totalDiscount +=
                discountAmount * item.quantity;





            // ==============================
            // Reduce Stock
            // ==============================


            product.stock -= item.quantity;



            await product.save({
                session
            });





            // ==============================
            // Add Order Item
            // ==============================


            orderItems.push({


                product:
                    product._id,


                productName:
                    product.productName,


                quantity:
                    item.quantity,


                selectedSize:
                    item.selectedSize,


                selectedColor:
                    item.selectedColor,



                originalPrice,


                discountPercentage,


                discountAmount,


                finalPrice,


                subtotal:
                    itemSubtotal


            });



        }






        // ==============================
        // Delivery Charges
        // ==============================


        const settings =
            await Setting.findOne()
            .session(session);



        if(!settings){


            throw new Error(
                "Store settings not configured"
            );


        }



        let deliveryCharges = 0;



        const finalAmount =
            subtotal - totalDiscount;






        // Free Delivery


        if(
            settings.freeDeliveryAbove &&
            finalAmount >= settings.freeDeliveryAbove
        ){


            deliveryCharges = 0;


        }



        else {



            // Same City


            if(

                orderData.city &&
                orderData.city.toLowerCase()
                ===
                settings.storeCity.toLowerCase()

            ){


                deliveryCharges =
                    settings.sameCityCharge;


            }



            // Same Province


            else if(

                orderData.province &&
                orderData.province.toLowerCase()
                ===
                settings.storeProvince.toLowerCase()

            ){


                deliveryCharges =
                    settings.sameProvinceCharge;


            }



            // Other Province


            else{


                deliveryCharges =
                    settings.otherProvinceCharge;


            }



        }






        // Manual Override

        if(orderData.deliveryCharges !== undefined){


            deliveryCharges =
                Number(orderData.deliveryCharges);


        }




        if(deliveryCharges < 0){


            throw new Error(
                "Invalid delivery charges"
            );


        }







        // ==============================
        // Grand Total
        // ==============================


        const grandTotal =
            subtotal -
            totalDiscount +
            deliveryCharges;









        // ==============================
        // Check Customer
        // ==============================


        const customer =
            await Customer.findById(
                orderData.customer
            )
            .session(session);





        if(!customer){


            throw new Error(
                "Customer not found"
            );


        }









        // ==============================
        // Create Order
        // ==============================


        const order =
            await Order.create(
            [
                {


                    orderId:
                        `ORD-${nextNumber}`,



                    customer:
                        customer._id,



                    products:
                        orderItems,



                    subtotal,



                    totalDiscount,



                    deliveryCharges,



                    grandTotal,



                    paymentMethod:
                        orderData.paymentMethod,



                    paymentStatus:
                        orderData.paymentStatus ||
                        "Pending",



                    status:
                        orderData.status ||
                        "Pending",



                    shippingAddress:
                        orderData.shippingAddress,



                    city:
                        orderData.city,



                    province:
                        orderData.province,



                    notes:
                        orderData.notes || ""



                }

            ],
            {
                session
            });









        // ==============================
        // Update Customer History
        // ==============================


        customer.orderHistory.push(
            order[0]._id
        );



        await customer.save({
            session
        });









        // ==============================
        // Commit Transaction
        // ==============================


        await session.commitTransaction();



        session.endSession();




        return order[0];



    }



    catch(error){



        await session.abortTransaction();



        session.endSession();



        throw error;


    }



};






module.exports = {

    createOrderService

};