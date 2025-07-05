const mongoose = require("mongoose") ;
const validator = require('validator');
const bcrypt = require('bcrypt') ;
const jwt = require('jsonwebtoken') ;

const userSchema = mongoose.Schema({
   firstName : {
     type : String ,
     required : true ,
     trim : true ,
     minLength :3 ,
     maxLength :14 , 
     validate: {
       validator(value) {
        return validator.isAlpha(value, 'en-US', { ignore: ' ' });
       },
      message: "First Name should only contain letters and spaces."
    }
   } ,
   lastName:{
    type : String ,
    trim : true ,
    minLength : 3 ,
    maxLength :14 ,
    uppercase : true,
    validate: {
       validator(value) {
        return validator.isAlpha(value, 'en-US', { ignore: ' ' });
       },
      message: "Last Name should only contain letters and spaces."
    } 
   },
   age:{
    type : Number ,
    min : 18 , 
    max : 100 ,
   } ,
   emailID:{
    type : String  ,
    required : true ,
    unique : true ,
    trim : true ,
    // match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    validate: {
        validator(value){
           return validator.isEmail(value)  ;
        },
        message : "Email is not in valid form"
    } 
   },
   password:{
     type : String ,
     trim : true  ,
     required : true ,
   },
   gender:{
    type : String ,
    lowercase : true ,
    validator(value){
      if(!["male" , "female" , "other"].includes(value)){
        throw new Error("Gender Data is Not valid") ;
      }
    }
   },
   phone:{
    type : String ,
    trim : true ,
    uppercase : true ,
    maxLength : 10 , 
    minLength :10 ,
     match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number']
   },
   about:{
    type : String ,
    default : "I am Software developer" ,
    maxLength : 100 ,
   } ,
   photoUrl : {
    type : String ,
    default : "https://static.vecteezy.com/system/resources/previews/005/544/718/original/profile-icon-design-free-vector.jpg",
    maxLength : 100000 ,
   } ,
   skills : {
     type : Array ,
     default :["JavaScript" , "C++" , "C"  , "Mern Stack"] ,
   },
   Company : {
    type : String,
    default : "Student" ,
    required : true ,
  } ,
   Batch : {  
    type : Number ,
    default : 2025 ,
    required : true ,
   } ,
   Address : {
     type : String ,
     default : "India" ,
   }

} ,{
  timestamps : true ,
});

userSchema.methods.userToken = async function() {
   const user = this ;
   const token = await  jwt.sign({_id : user._id} , process.env.JWT_SECRET, {expiresIn: '7d'}) ;
  return token ;
} ;

userSchema.methods.validatePassword = async function(UserPassword){
  const user = this  ;
  const userHashPassword = user.password ;
  const validate = await bcrypt.compare(UserPassword , userHashPassword) ;
  return validate ;
} ;

const UserModel = mongoose.model("User" , userSchema) ;

module.exports = UserModel ;
