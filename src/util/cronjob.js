const cron = require("node-cron") ;
const sendEmail = require("../router/sendEmail") ;
const User = require("../models/user.js") ;
const connectionRequestSchemaModel = require("../models/ConnectionRequest.js") ;
const {subDays , startOfDay , endOfDay } = require("date-fns") ;

    // second minute 
cron.schedule( "0 1 * * *" , async () => {
  try{

    console.log("all Inactive User .... ") ;

    const yesterday = subDays(new Date() , 1) ;

    const yesterdayStart = startOfDay(yesterday) ;
    const yesterdayEnd = endOfDay(yesterday) ;


    const pendingRequests = await  connectionRequestSchemaModel.find({
      status : "Interested" ,
      createdAt : {
        $gte : yesterdayStart,
        $lt : yesterdayEnd 
      }
    }).populate("fromUserId toUserId") ;

    const listOfEmails = [...new Set(pendingRequests.map(req => req.toUserId.emailID))] ;

    for(const email of listOfEmails) {
       await sendEmail(email , "Remaining" , "You Have some friend request is present.." ) ;
    }

    const InactiveUser = await User.find({
      lastLogin : {
           $lt : new Date(Date.now() - 30*24*60*60*1000) 
      }
    }) ;

    const msg = "Come back to dev Connector!" ;

    for(const user of InactiveUser){
      await sendEmail(user.emailID , "Remainder" , msg) ;
    }

  } 
  catch(err) {
    console.log(Error  + err.message) ;
  }
}) ;