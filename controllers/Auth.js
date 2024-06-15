require("dotenv").config();
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");

// send otp

exports.sendOTP = async (req, res) => {

   try{
        // fetch request from req. body
        const{email} = req.body;

        // check if user already exist
         const checkUserPresent = await User.findOne({email});
 
        // if user existed them return response
        if(checkUserPresent){
            return res.status(401).json({
             success: false,
             message: "User already existed",
            })
        }

        // generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log("Otp generated", otp);

        // check unique otp or not
        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,            
            });
            result = await OTP.findOne({otp: otp});    
        }
        
        const otpPayload = {email, otp};

        //create entry for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successfully
        return res.status(200).json({
            success: true,
            message: "Otp sent successfully",
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: error.message,
        })
    }
};

// singnup
exports.signup = async (req, res) =>{
    
   try{
     // data fetch from req.body

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber
            || !otp){
                return res.status(403).json({
                    success: false,
                    message: "All fields are required"
                })
            }
        
        // 2no password match krlo
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message: "Password and confirm paasword does not matched"
            })
        }    
        // check user already eisted or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message: "User already registered"
            })
        }

        // find most recent otp for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);

        // validate otp
        if(recentOtp.length == 0){
            // otp not found
            return res.status(400).json({
                success:false,
                message: "OTP not found",
            })
        }else if(otp !== recentOtp[0].otp){
            // invalid otp
            return res.status(400).json({
                success:false,
                message: "OTP not match",
            })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password,10);
        
        // create entry  in db

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            password :hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
        });

        // return res
        return res.status(200).json({
            success:true,
            message:"User successfully registered",
            user,
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user cannot be registered, Please try again",
        })
    }

};

exports.login = async (req, res) =>{
    
    try{
        // get data from req.body
        const {email , password} = req.body;

        // validate data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All field are required, please try again",
            })
        }
        // user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User does not exist, plese signup first"
            }) 
        }
        // genrate JWT token , after matching password
        
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload ,process.env.JWT_SECRET,{expiresIn:"2h"})
            user.token = token;
            user.password = undefined;
             
            // create cookie and send response
            const options = {
                expires : new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }

            res.cookie("token", token , options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
            })

        }else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            }) 
        }

         
    }catch(error){
        console.log(error);;
        return res.status(500).json({
            success:false,
            message:"Loggin Failed, Please try again "
        }) 
    }
};

// change password
exports.changePassword = async (req, res) =>{
    
    const {oldPassword, newPassword, confirmNewPassword} = req.body;

    

};
