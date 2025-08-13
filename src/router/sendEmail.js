const express = require('express') 

const sendEmail = express.Router() ;

sendEmail.get("/profile/mail" ,  (req, res) => { 
   res.send("I am Sending Mail....") ;
} );

module.exports = sendEmail ;