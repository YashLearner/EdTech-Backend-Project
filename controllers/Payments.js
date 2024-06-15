const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");


// capture the payment and initialte the razorpay order

exports.capturePayment = async (req , res) =>{

    //  get course id and UserId
    const {course_id } = req.body;
    const userId = req.user.id; 

    // validation
    // validCourseId
    if(!course_id){
        return res.json({
            success:false,
            message: "Please provide valid course ID"
        });
    }
    // valid CourseDetail
    try{
        let course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message: "Could not find the course"
            });  
        }
        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.json({
                success:false,
                message:"Student is already enrolled"
            })
        }


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Student is already enrolled",  
            error: error.message,
        })
    }
    // create order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency: currency,
        reciept: Math.random(Date.now()).toString(),
        notes: {
            courseId : course_id,
            userId ,
        }
    };

    try{
        // initiate the payment using razor pay
         const paymentResponse = await instance.order.create(options);
         console.log(paymentResponse);

         return res.status(200).json({
            success:true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        }); 

    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"Could not initiate order",  
            
        })
    }
};

// verify signature if razorpay and Server

exports.verifySignature = async (req, res) =>{

    const webhookSecret = "12345678";

    const signature = req.header["x-razorpay-signature"];
    
    // we encryp our secret for maching with the razorpay signauture
    const shasum = crypto.createHmac("sha256", webhookSecret);

    // now convert this hmac into string format
    shasum.update(JSON.stringify(req.body));

    // jb kisi input pr hashing krte h to usko hum DIGEST krke bualte h 
    const digest = shasum.digest("hax");

    // matching the hashed secret with signature
    if(signature === digest){
        console.log("Payment is authorized");

        const {courseId , userId} = req.body.payload.payment.entity.notes;
        
        try{
            // fullfill the action

            // find the course and enroll the student 
            const enrolledCourse = await Course.findOneAndUpdate(courseId,
                                                {
                                                    $push:{
                                                        studentsEnrolled:userId,
                                                    }
                                                },
                                                {new: true},
            );
            
            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message:"Course not Found"
                });
            }

            console.log(enrolledCourse);

            // find the student and add course in the list if enrolled course
            const enrolledStudent =await User.findOneAndUpdate(userId,
                                                {
                                                    $push:{
                                                        courses:courseId,
                                                    },                                             
                                                },
                                                {new :true},
            ); 

            console.log(enrolledStudent);

            // mail send krdo confirmation wala
            const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratulation from CodeHelp",
                                        "Congratulation , you are enrolled in the new course",

            );

            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message:"Signature verified and Course added"
            });
             
        }catch(error){
            console.log(error);
            return res.status(500).json({
                success: false, 
                message:error.message,
            });

        }
    }
    else{
        return res.status(400).json({
            success: false,
            message:"Signature did not matched,Invalid Request",
        });
    }
};

