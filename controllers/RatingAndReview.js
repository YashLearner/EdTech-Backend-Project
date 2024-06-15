const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// create rating
exports.createRating = async (req, res) =>{
     
    try{

        // get userID
        const userId = req.user.id; 

        // fetch data
        const {rating, review , courseId} = req.body; 

        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
                {
                    _id:courseId,       
                    studentsEnrolled: {$elemMatch: {$eq: userId}}, //userId se match kr rhe h student enroll ko 
                                                                   //if existed then user exrolled h us course me 
                },
                                                
        );
        
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in this course"
            });
        }

        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne(
            {
                user:userId,
                course:courseId,  
            }
        )

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewd by user"
            });
        }  
        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating:rating,
            review: review,
            course:courseId,
            user:userId,
        })

        // update course with this rating/review
        const updatedCourseDetails = await Course.findOneAndUpdate({_id:courseId},
            {
                $push:{ 
                    ratingAndReviews: ratingReview._id,
                }
            },
            {new:true},
        ) 
        console.log(updatedCourseDetails);

        // return response 
        return res.status(200).json({
            success:true,
            message:"Rating And Review Successfully",
            ratingReview,
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message:error.message,
        })    

    }
}

// get average rating 
exports.getAverageRating = async (req, res) =>{
    try{
        // get course id
        const courseId = req.body.courseId;

        // caculate average rating
        const result = await RatingAndReview.aggregate(
            {
                $match:{
                    course : new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: { $avg: "$rating"}, 
                }
            }
        );

        if(result.length > 0){
            response.status(200).json({
                success:true,
                averageRating : result[0].averageRating,
            });
        }
        // return rating
        response.status(200).json({
            success:true,
            message:"Average rating is 0, no rating given till now",
            averageRating : 0,
        });

    }catch(error){

    }
}

// get all ratingAndReviews

exports.getAllRatingReview = async (req, res) =>{

    try{
        const allReviews = await RatingAndReview.find({})
                                .sort({rating: "desc"})
                                .populate({ 
                                    path:"user",
                                    select:"firstname lastname image email",
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName",
                                })
                                .exec();  

        return res.status(200).json({
            success:true,
            message:"All reviews fetch successfully",
            data: allReviews,
        })

    }catch(error){

    }
}