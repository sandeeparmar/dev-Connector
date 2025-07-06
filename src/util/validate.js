const { Error } = require('mongoose');
const validator = require('validator') ;

const validateSignupData = (req) => {
   const {firstName , lastName , emailID , password} = req.body ; 
   if(!firstName || !lastName){
    throw new Error("Name is not present") ;
   }
   else if(!validator.isEmail(emailID)){
    throw new Errorr ("Email is not valid") ;
   }
   else if(!validator.isStrongPassword(password)){
    throw  new Error("Password is not Strong") ;
   }
} ;

const validateProfileEditData = (req) => {
   const updatedFields = ["firstName" , "lastName" , "photoUrl" , "skills" , "about" , "phone" , "gender" , "password", "age" , "Address" , "Batch"  , "Company"]  ;
   const isEditValid = Object.keys(req.body).every
      ((field) => updatedFields.includes(field)) ;
   return isEditValid ;
} ;

module.exports = {validateSignupData  , validateProfileEditData};