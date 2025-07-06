const express = require("express" ) ;
const userRouter = express.Router() ;
const userauth = require("../middleware/auth")
const ConnectionRequests = require("../models/ConnectionRequest.js") ;
const User = require("../models/user.js") ;

const USER_SAFE_DATA = "firstName  lastName  age photoUrl gender about  skills emailID " ;



userRouter.get("/user/requests/received" , userauth , async(req , res) => {
  try{
    const loggedInUser = req.user ;

    const connectionRequests = await ConnectionRequests.find({
      toUserId : loggedInUser._id ,
      status : "interested" ,
    }).populate("fromUserId", USER_SAFE_DATA);

     res.json({
      message : "Data fetched Successfully" ,
      data : connectionRequests ,
     }) ;
  }
  catch(err){
    res.status(400).send("Error " + err.message) ;
  }
}) ;

userRouter.get( "/user/connections" , userauth , async (req ,res) => { 
  try{

    const loggedInUser = req.user ;
    const connectionRequests = await ConnectionRequests.find({
      $or:[
         {toUserId : loggedInUser._id , status :"accepted"} ,
         {fromUserId : loggedInUser._id , status : "accepted"} ,
      ]
    }).populate("fromUserId" , USER_SAFE_DATA).populate("toUserId" , USER_SAFE_DATA) ;   

    const data = connectionRequests.map((row) => {
       if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
        return row.toUserId ;
       }  
       else {
        return row.fromUserId ;
       }
    }) ;

    res.json({data}) ;
  }
  catch(err){
    res.status(500).send("Error " + err.message) ;   
  }
}) ;


userRouter.get("/feed" , userauth , async (req ,res)   => {
  try{
    const loggedInUser  = req.user  ;
    const page = parseInt(req.query.page) || 1 ;
    let limit = parseInt(req.query.limit) || 10 ;
    limit = limit > 50 ? 50 : limit ; 
    const skip = (page-1)*limit;

    const connectionRequests = await ConnectionRequests.find({
      $or:[
        {fromUserId : loggedInUser._id},
        {toUserId : loggedInUser._id},
      ],
    })
    .select("fromUserId toUserId")  ;

    const hideUserFromFeed = new Set() ;
    connectionRequests.forEach( req => {
      hideUserFromFeed.add(req.fromUserId.toString()) ;
      hideUserFromFeed.add(req.toUserId.toString()) ;
    }) ;
    // this line save 
    hideUserFromFeed.add(loggedInUser._id.toString()) ;
    
    const users = await User.find({
      _id :{$nin :Array.from(hideUserFromFeed)},
    })
    .select(USER_SAFE_DATA)
    .skip(skip)
    .limit(limit) ;

    res.json({data : users}) ;
  }
  catch(err){
    res.status(500).send("Error from user/feed router " + err.message) ;
  }
}) ;

module.exports = userRouter ;