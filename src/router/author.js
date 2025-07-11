const express = require('express') ;
const {validateSignupData} = require('../util/validate.js') ;

const authRouter = express.Router() ; 
const bcrypt = require('bcrypt' ) ;
const User = require('../models/user') ;



authRouter.post("/signup" , async (req ,res)=>{
  try{
    validateSignupData(req) ; 
    const {firstName , lastName , emailID , password , gender , Batch , Company , about , Address , photoUrl , phone , age } = req.body ;
    const passwordHash  =  await bcrypt.hash(password , 10) ;
    const user = new User({
       firstName , lastName , emailID , password : passwordHash, gender , Batch , Company , about , Address , photoUrl , phone ,age
    }) ;  
    const savedUser = await user.save() ; // return a promise
    const token = await savedUser.userToken() ;//creating a toke n
    res.cookie("token" , token ,{ expires: new Date(Date.now() + 900000)});

    res.json({message : "registration is completed\n" , data : savedUser}) ;
  }
  catch(err){
    res.status(401).send("Something Wrong" + err.message) ;
  }
});

authRouter.post("/login" , async (req,res) => {
  try{ 
    const {password , emailID}  = req.body ;
    const user = await User.findOne({emailID : emailID}) ;
    if(!user) {
      throw new Error("Your are Not Register..") ;
    } 

    const userHashPassword = user.password ;
    const isPasswordValid = await user.validatePassword(password) ;
    
    if(!isPasswordValid){
      throw new Error("Check Email or Password please..") ;
    }

    else {
      const token = await user.userToken() ;
      res.cookie("token" , token ,{ expires: new Date(Date.now() + 900000)});
      res.json(user) ;
    }
  } 
  catch(err){
    res.status(401).send("Something went wrong " + err.message) ;
  } 
}) ;

authRouter.post('/logout' , async(req, res) =>{
  try{
    res.cookie("token" , null  , {
      expires : new Date(Date.now())  ,  
    }) ; 
    res.send("logout Successfully") ;  
  }
 catch(err) {
  res.status(501).send("Please Refresh it..." + err.message) ;
 }
}) ;


module.exports = authRouter ;