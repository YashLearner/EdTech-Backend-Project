const express = require("express");
const router = express.Router();

const {login, signup , sendOTP , changePassword} = require("../controllers/Auth");
const {resetPasswordToken,resetPassword} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

// Route for SIGNUP
router.post("/signup",signup);

// Route for login
router.post("/login", login);

router.post("/sendotp", sendOTP);

router.post("/changePassword",auth , changePassword);

// **********************************************************************//
//                          Reset Password Token
// **********************************************************************//


// route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// route for resettiing the password after verification
router.post("/reset-password", resetPassword);


module.exports = router;