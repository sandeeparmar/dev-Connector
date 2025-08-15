const express = require('express');
const { validateSignupData } = require('../util/validate.js');
const sendEmail = require("./sendEmail");
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

function sensitiveData(user){
   const {_id , password , createdAt , updatedAt , ...safeData} = user ;
   return safeData ;
}

authRouter.post("/signup", async (req, res) => {
  try {

    validateSignupData(req);    
    const { firstName, lastName, emailID,  password, gender, Batch, Company, about, Address,  photoUrl, 
      phone, 
      age 
    } = req.body;

    const existingUser = await User.findOne({ emailID: emailID });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Email Already Registered.." 
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      firstName,
      lastName,
      emailID,
      password: passwordHash
    };

    if (gender) userData.gender = gender;
    if (Batch) userData.Batch = parseInt(Batch);
    if (Company) userData.Company = Company;
    if (about) userData.about = about;
    if (Address) userData.Address = Address;
    if (photoUrl) userData.photoUrl = photoUrl;
    if (phone) userData.phone = phone;
    if (age) userData.age = parseInt(age);

    const user = new User(userData);

    const savedUser = await user.save();
    
    const token = await savedUser.userToken();    
    res.cookie("token", token, { 
      expires: new Date(Date.now() + 900000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

   
    const plainUser = user.toObject();
    const safeData = sensitiveData(plainUser) ;

    try {
      await sendEmail(emailID, "Registration",  safeData);
    } catch (emailError) {
      console.error("Failed to send email:", emailError.message);
    }

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Registration completed successfully",
      data: userResponse
    });

  } catch (err) {
    console.error("Signup error:", err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email Already Registered.."
      });
    }
    res.status(500).json({
      success: false,
      message: "Registration failed: " + err.message
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
   
    
    const { password, emailID } = req.body;
    
    if (!emailID || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ emailID: emailID });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const {firstName}  = user ;

    try {
      await sendEmail(emailID, "Login Successfully",  `Hi ${firstName} Login Successfully..`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError.message);
    }

    const token = await user.userToken();
    res.cookie("token", token, { 
      expires: new Date(Date.now() + 900000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Login successful",
      data: userResponse
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed: " + err.message
    });
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({
      success: true,
      message: "Logout successful"
    });
    
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      success: false,
      message: "Logout failed: " + err.message
    });
  }
});

module.exports = authRouter;