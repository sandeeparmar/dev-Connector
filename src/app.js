const express = require("express") ;
const app = express() ; 
const connectDB = require("./config/database") ;
const cookieParser = require('cookie-parser') ;
const cors = require('cors') ;
const helmet = require("helmet") ;
const rateLimit = require("express-rate-limit") 
 
require("dotenv").config() ;
require("./util/cronjob.js") ;

app.use(helmet()) ;
const limiter = rateLimit({
  windowMs : 15*60*1000 ,
  max : 500 ,
  message : "Too many requests from this IP , please try again later."
}) ;

app.use(cors({
  origin: "https://dev-connector-front-igey.vercel.app/",
  credentials: true,
}));

app.use(express.json()) ;
app.use(cookieParser()) ;


const authRouter = require('./router/author.js') ;
const profileRouter  = require('./router/profile.js') ;
const requestRouter = require('./router/request.js') ;
const userRouter = require("./router/user.js") ;
const paymentRouter = require('./router/payment.js') ; 

app.use("/" , authRouter) ;
app.use("/" , profileRouter) ;
app.use("/" , requestRouter) ;
app.use("/" , userRouter) ;
app.use("/" , paymentRouter) ; 
app.get('/', (req, res) => {
  res.send('Hello World')
})

connectDB()
   .then(() => {
    console.log("Database is Connected Successfully") ;
    
    app.listen(process.env.PORT , () => {
      console.log("Hello this is from server side.") ;
    }) ;
   })
   .catch((err) =>  {
      console.error("Database is not connected " , err.message);
   }) ;