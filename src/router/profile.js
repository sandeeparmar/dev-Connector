const express = require('express');
const userauth = require('../middleware/auth'); 
const {validateProfileEditData} = require('../util/validate');
const profileRouter = express.Router(); 
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


profileRouter.get("/profile/view", userauth, async (req, res) => {
  try {
    const user = req.user;
    res.send("your profile is " + user);
  } 
  catch(err) {
    res.status(404).send("please login..." + err.message);
  }
});

profileRouter.patch("/profile/edit", userauth, async (req, res) => {
  try {
    if(!validateProfileEditData(req)) {
      throw new Error("Invalid Changes.." + req.user);
    }
    
    const loggedUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedUser[key] = req.body[key];
    });

    await loggedUser.save();
    res.json({
      message: `${loggedUser.firstName} Your data is Edit Successful.`, 
      data: loggedUser,
      success: true,
    });
  } 
  catch(err) {
    res.status(401).send("Error " + err.message);
  }
});

profileRouter.patch("/profile/forget/password", async (req, res) => {
  try {
    const {emailID} = req.body;  
    const user = await User.findOne({emailID});

    if(!user) {
      throw new Error("You are not registered..");
    }
    
    const token = jwt.sign(
      {_id: user._id}, 
      process.env.JWT_SECRET, 
      {expiresIn: '15m'}
    ); 
    
    res.cookie("resetToken", token, { 
      expires: new Date(Date.now() + 15 * 60 * 1000),
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' 
    });
    
    res.json({ message: "Reset link sent to your email.." });
  }
  catch(err) {
    res.status(401).send("Try After Sometime " + err.message);
  }
});

profileRouter.patch("/profile/reset/password", async(req, res) => {
  try {
    
    const token = req.cookies.resetToken;
    const { password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
   
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    const hash = await bcrypt.hash(password, 12); 
    user.password = hash;
    
    await user.save();
    res.clearCookie("resetToken");
    
    res.status(200).json({ message: "Password updated successfully" });
    
  } catch (err) {
    console.error('Password reset error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: "Invalid token" });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
});

profileRouter.post("/profile/mail", async (req, res) => {
  try{
    
  }
  catch(err) {
    res.error("Error" + err.message) ;
  }
});

module.exports = profileRouter;