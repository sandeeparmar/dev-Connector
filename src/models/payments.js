const mongoose = require("mongoose") ;

const notesSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phoneNum: {
    type: String,
  },
  emailId: {
    type: String,
  },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
   userId : {
      type : mongoose.Types.ObjectId ,
      ref : "User" ,
      required : true ,
   }  , 
   paymentId : {
    type : String 
   } ,
   orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
  notes : notesSchema ,
}, {timestamps : true}) ;

module.exports = mongoose.model("Payment" , paymentSchema) ;
