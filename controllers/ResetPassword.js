const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// reset password token

exports.resetPasswordToken = async (req, res) =>{
  
    try{
        // get email from req.body;  
        const {email} = req.body;

        // check user for this email ,  validate email
        const user = await User.findOne({email}); 

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Your email is not registered with us"
            }); 
        };

        // genrate token 
        const token = crypto.randomUUID();

        // update user by adding token and exppiration time
        const updatedDetails = await User.findOneAndUpdate
                                                ({email},
                                                {
                                                    token:token,
                                                    resetPasswordExpires: Date.now() + 5*60*1000,     
                                                },
                                                {new : true}
        );

        console.log("DETAILS: ",updatedDetails); 
    
        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing url
        await mailSender(email,"Password Reset Link" ,`Password Reset Link: ${url}`);

        // return respose
        return res.status(201).json({
            success:true,
            message:"Email sent successfully , please check email and change password",
        }); 

    }catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:"Something went wromg while reseting the password",
        }); 
    }
};   

// reset password

exports.resetPassword = async (req, res) =>{

   try{
        // data fetch
        const {password, confirmPassword, token } = req.body;

        // validation
        if(password !== confirmPassword){
            return res.status(401).json({
                success:false,
                message:"Password not matching",
            }); 
        }

        // get user details using token
        const userDetails = await User.findOne(token);
        console.log(userDetails);
        // if no entry - invalid token
        if(!userDetails){
            return res.status(401).json({
                success:false,
                message:"Token invalid",
            }); 
        }

        // tokenn time expires or not
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(401).json({
                success:false,
                message:"Token time expired, please regenerate token",
            }); 
        }
        // hass password
        const hashedPassword = await bcrypt.hash(password,10);

        // update password into db
        await User.findByIdAndUpdate({token},{password: hashedPassword},{new :true});

        // return response
        return res.status(401).json({
            success:false,
            message:"password reset successful",
        }); 
    }catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:"Something went wromg while reseting the password",
        }); 
    }
};