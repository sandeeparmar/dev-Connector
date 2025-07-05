const express = require('express') ;
const userauth = require('../middleware/auth'); 
const {validateProfileEditData} = require('../util/validate') ;
const profileRouter = express.Router() ; 
const User = require("../models/user.js") ;
const jwt = require("jsonwebtoken") ;
const bcrypt = require("bcrypt") ;

profileRouter.get("/profile/view" , userauth ,  async (req ,res) => {
  try{
    const user = req.user ;
    res.send("your profile is " + user) ;
  } 
  catch(err){
    res.status(404).send("please login..." + err.message) ;
  }
}) ;

profileRouter.patch("/profile/edit" , userauth , async (req  ,res) => {
  try{
   if(!validateProfileEditData(req)) {
    throw new Error("Invalid Changes.." + req.user) ;
   }
    

    const loggedUser = req.user ;

    Object.keys(req.body).forEach( (key) => {
      loggedUser[key] = req.body[key] ;
    }) ;

    await loggedUser.save() ;
    res.json({message :`${loggedUser.firstName} Your data is Edit Successful.`, 
      data : loggedUser ,
      success : true ,
    }) ;
  } 
  catch(err){
     res.status(401).send("Error " + err.message) ;
  }
}) ;

profileRouter.patch("/profile/forget/password" ,  async (req ,res) => {
  try{
    const {emailID} = req.body  ;  
    const user = await User.findOne({emailID}) ;

    if(!user){
      throw new Error("Your are note Register..") ;
    }
    const token = await jwt.sign({_id : user._id} , process.env.JWT_SECRET , {expiresIn : '15m'}); 
    res.cookie("token" , token , { expires: new Date(Date.now() + 15 * 60 * 1000) }) ;
    res.send("reset link sent into your email..") ;
  }
  catch(err){
    res.status(401).send("Try After Sometime " + err.message) ;
  }
}) ;

profileRouter.patch("/profile/reset/password" , async( req ,res) => {
  try{
    const {token , updatedPassword} = req .body ;
    const {_id} = await jwt.verify(token ,process.env.JWT_SECRET) ;
    const user = await User.findById({_id}) ;
    if(!user){
      throw new Error("Invalid Request") ;
    } 
    const updatedPasswordHash = await bcrypt.hash(updatedPassword ,10) ;
    user.password = updatedPasswordHash ;
    await user.save() ;

    res.send("Password Update Successfull") ;
  }catch(err){  
    res.status(501).send("Error " + err.message) ;
  }
});




module.exports = profileRouter ;