require("dotenv").config();
const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (req, res) =>{
    try{
        // fetch data
        const {courseName, courseDescription, whatYouWillLearn,price,tag,category} = req.body;
        
        console.log(category);
        // get thumbnail
        const thumbnail = req.files.thumbnail;

        // validation
        if(!courseName|| !courseDescription|| !whatYouWillLearn|| !price|| !tag || !category || !thumbnail){
            res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
 
        // check for instrutor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Intructor Details: ",instructorDetails);

        if(!instructorDetails){
            res.status(400).json({
                success:false,
                message:"Instructor Details not found",
            });    
        }

        // check given tag is validate or not
        const categoryDetails = await Category.findById(category);

        if(!categoryDetails){
            res.status(400).json({
                success:false,
                message:"Category Details not found",
            });
        }

        console.log(thumbnail);

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,

        })

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id : instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new :true},
        )

        // update the Category Schema
        await Category.findByIdAndUpdate(
            {_id: categoryDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new : true},
        );

        // return response
        res.status(200).json({
            success:true,
            message:"Course Successfully Added",
            data:newCourse,
        });
         

    }catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Failed to create course",
        });
    }
}


// getAllCourses handler function
exports.getAllCourses = async (req, res) =>{
    try{
        // TODO: change the belo statement incrementally         
        const allCourses = await Course.find({});
 
        res.status(200).json({
            success:true,
            message:"Data for all courses fetch successfully",
            data:allCourses,
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch all course data",
        })
    }
}

exports.getACourseDetails = async (req, res) =>{
    try{
        // get id
        const {courseId} = req.body;
        
        // find course details
        const courseDetails = await Course.findOne({_id:courseId})
                                        .populate(
                                            {
                                                path:"instructor",
                                                populate:{
                                                    path: "additionalDetails",
                                                }
                                            }
                                        )
                                        .populate("category")
                                        .populate("ratingAndReviews")
                                        .populate(
                                            {
                                                path:"courseContent",
                                                populate:{
                                                    path:"subSection",
                                                },
                                            }
                                        ).exec();
        // validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`
            });
        }

        // return response
        return res.status(200).json({
            success:true,
            message:"Course Details fetched successfully",
            data:courseDetails,
        }) 

    }catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message, 
        });
         
    }
}