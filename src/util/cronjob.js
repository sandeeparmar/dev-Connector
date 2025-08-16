const cron = require("node-cron") ;
const sendEmail = require("../router/sendEmail") ;
const User = require("../models/user.js") ;
const connectionRequestSchema = require("../models/ConnectionRequest.js") ;
const {subDays , startOfDay , endOfDay } = require("date-fns") ;

    //  minute 
cron.schedule( "47 19 * * *" , async () => {
  try{
    const yesterday = subDays(new Date() , 0) ;
    const yesterdayStart = startOfDay(yesterday) ;
    const yesterdayEnd = endOfDay(yesterday) ;

    const pendingRequests = await  connectionRequestSchema.find({
      status : "interested" ,
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
           $lt : new Date(yesterday)  
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