const Section = require("../models/Section");
const Course = require("../models/Course");


exports.createSection = async (req, res ) =>{
    try{
        // data fetch
        const {sectionName, courseId} = req.body;
        
        // data validate
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Poroperties",
            })
        }

        // create course
        const newSection = await Section.create({sectionName}); 

        // update course with section ID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent : newSection._id,
                                                }
                                            },
                                            {new :true},
                                        );
        
        // HW: Use poplulate to replace section and subSection in the updatedCourseDetails

        // return response
        return res.status(400).json({
            success:true,
            message:"Section Created Successfully",
            data: updatedCourseDetails,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to Create Section , please try again",
            error:error.message,
        });
    };
};

exports.updateSection = async (req, res) => {
     try{
        // data input
        const {sectionName, sectionId} = req.body;

        // data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Poroperties",
            })
        }

        // update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new :true});

        // return res
        return res.status(200).json({
            success:true,
            message:"Section Updated Successfully",
            error:error.message,
        });

     }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to Create Section , please try again",
            error:error.message,
        });
     };
};

exports.deleteSection = async (req, res) =>{
    try{
        // getId - assuming that we are sendind id in params
        const {sectionId} = req.body;

        // use findByIdandDelete
        await Section.findByIdAndDelete(sectionId);

        // TODO[Testing]: do we need to delete the entry from course Schema ??

        // return response
        return res.status(200).json({
            success:true,
            message:"Section Delete Successfully",
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to Create Section , please try again",
            error:error.message,
        });     
    };
};