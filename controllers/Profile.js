const Course = require("../models/Course");
const Profile = require("../models/Profile");
const User = require("../models/User");


exports.updateProfile = async (req, res) =>{
    try{
        // get data
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;

        // gwt userId
        const id = req.user.id;

        // validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        
        // save in db
        await profileDetails.save();

        // return resopnse
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong"
            
        })

    }
}

// delete account
// how can we shedule the task
exports.deleteAccount = async (req, res) =>{
    try{
        // get id
        console.log("Printing Id: ",req.user.id);
        const id = req.user.id;

        // validate id
        const user = await User.findById({_id: id});

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        // delete addtional details or profile
        await Profile.findByIdAndDelete({_id:user.additionalDetails});
        
        // TODO: HW un enroll user from all all enroll courses

        // delete user
        await User.findByIdAndDelete({_id:id});

        // return res
        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully",
            profileDetails,
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"User cannot be deleted",
        });
    };
}

exports.getUserDetails = async (req, res ) => {
    try{
        // get id
        const id = req.user.id;

        // get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        
        // return res
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            userDetails,
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"User cannot be fetched",
        });
    }
}

exports.getEnrolledCourse = async (req, res ) =>{

    const id  = req.user.id;
    const enrolledCourse = await Course.findById(id)
    .populate(courseName);



       
}