const express = require('express')
const authRouter = express.Router();
const {register,login,logout,adminRegister} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
// const { generateAvatarSignature, updateProfilePic } = require('../controllers/userPic');

console.log("authRouter loaded");

//Register
authRouter.post('/register',register);

authRouter.post('/login',login);

//logout
authRouter.post('/logout',userMiddleware,logout);

//admin
authRouter.post('/admin/register',adminMiddleware,adminRegister);

//delete profile
// authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/check', userMiddleware, (req, res) => {
    const reply ={
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        profilePic: req.result.profilePic, // <--- YE LINE HONI CHAHIYE
    }
    res.status(200).json({
        user: reply,
        message: "Valid User",
    });
  });
//GetProfile
;

// authRouter.get('/avatar-signature', userMiddleware, generateAvatarSignature);
// authRouter.post('/update-avatar', userMiddleware, updateProfilePic);
// authRouter.get('/getProfile',getProfile);

module.exports = authRouter;