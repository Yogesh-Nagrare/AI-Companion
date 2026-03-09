const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");


const register = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }


    const user = await User.create({
      firstName,
      emailId,
      password,
      role: "user",
      });

    console.log("✅ User created:", user._id);

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
    };

    // Send response IMMEDIATELY, don't wait for email
    res.status(201).json({
      message: "Registration successful.",
      user: reply,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(400).json({ 
      message: err.message || "Registration failed" 
    });
  }
};


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;
        console.log("LOGIN EMAIL:", emailId);

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});
        console.log("LOGIN EMAIL:", emailId);
        console.log("USER FOUND:", !!user);

        if (!user)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            profilePic: user.profilePic, // <--- YE LINE HONI CHAHIYE
        }
        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });        
        //frontend ko bhej rahe hai ye data json ki help se
        res.status(201).json({
            user:reply,
             message:"Login Successful"
        });
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}

// logOut feature
const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token)
            return res.status(200).send("Already Logged Out");

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(200).send("Logged Out Successfully");

    } catch (err) {
        res.status(503).json({ message: err.message });
    }
};

const adminRegister = async(req,res)=>{
    try{
        // validate the data;
    //   if(req.result.role!='admin')
    //     throw new Error("Invalid Credentials");  
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}


// const deleteProfile = async(req,res)=>{
//     try {
//         const userId = req.result._id;
//         //userschema delete
//         await User.findByIdAndDelete(userId);
//         //submission bhi delete karo
//         await Submission.deleteMany({userId});
//         res.status(200).send("Profile Deleted Successfully");

//     } catch (error) {
//         res.status(500).send("Error: "+err);
//     }
// };

module.exports = {register, login,logout,adminRegister};