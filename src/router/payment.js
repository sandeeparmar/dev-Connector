const express = require("express") ;
const paymentRouter = express.Router() ;
const userAuth = require("../middleware/auth") ;
const razorpayInstane = require("../util/razorpay") ;
const Payment = require("../models/payments") ;
const { v4: uuidv4 } = require("uuid");

paymentRouter.post("/payment/create" , userAuth , async (req , res) => {
  try{
    const newReceipt =  uuidv4() ;

    const options = {

       amount : req.body.amount ,
       currency : req.body.currency ,

       notes : {
          firstName : req.user.firstName ,
          lastName : req.user.lastName ,
          phoneNum : req.user.phone ,
          emailId : req.user.emailId  
       } ,
      receipt : "rcpt"  + newReceipt,  // using uuid 
    };

    const order = await razorpayInstane.orders.create(options) ; 

    const payment = await Payment({
       userId : req.user._id ,
       orderId : order.id ,
       status : order.status ,
       amount : order.amount ,
       currency : order.currency ,
       receipt : order.receipt ,
       notes :  order.notes 
    }) ;

    const savedPayment = await payment.save() ;
    res.json({...savedPayment.toJSON() , keyId : process.env.RAZORPAY_KEY_ID}) ;

  } 
  catch(err){ 
    console.log (err) ;
  }
}) ;

module.exports  = paymentRouter ;