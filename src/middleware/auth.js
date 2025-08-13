const jwt = require('jsonwebtoken') ;
const User = require("../models/user") ;

const userauth = async (req ,res , next) => {
  try{
    const { token } = req.cookies;
    if(!token){
      return res.status(401).send("Please Login First") ;
    }

    const { _id } = await jwt.verify(token ,  process.env.JWT_SECRET ) ;
    const user = await User.findById(_id) ;
    if(!user){
      throw new Error("Invalid Attempts") ;
    }
    req.user = user ; 
    next() ;

  }catch(err){
    res.send("please login first.." ) ;
  }
} ;

module.exports = userauth ;