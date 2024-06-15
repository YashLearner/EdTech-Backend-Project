require("dotenv").config();
const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create Subsection

exports.createSubSection = async (req, res) =>{
    try{
        // fech data
        const {sectionId, title, timeDuration,description} = req.body; 
        // extract file/video
        const video  = req.files.video;

        // validate data
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        // upload video to cloudinary
        const uploadsDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

       // create a sub section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description:description,
            videoUrl:uploadsDetails.secure_url,
        });

        // update section with this subsection
        async function addSubSection(sectionId, subSectionDetails) {
            try {
                const updatedSection = await Section.findByIdAndUpdate(
                    { _id: sectionId },
                    {
                        $push: {
                            subSection: subSectionDetails._id
                        }
                    },
                    { new: true }
                );
            }catch (error) {
                console.error('Error updating section:', error);
            }
        }

        addSubSection(sectionId, subSectionDetails);
        
        //  HW: log updated section here, after adding populate query                                             
        const sectionDetails = await Section.findById({_id:sectionId}).populate("subSection");
        
        // return response 
        return res.status(200).json({
                success:true,
                message:"Sub Section Created Successfully",
                data:sectionDetails, 
        });


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message, 
        });

    }
}

exports.updateSubSection = async (req, res) => {
    try{
        // data input
        const {subSectionId, title, timeDuration,description} = req.body;

        const video  = req.files.video;
        console.log(subSectionId,title,timeDuration,description,video);
        // data validation
        if( !subSectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        // update data
        const subSection = await SubSection.findByIdAndUpdate(subSectionId,
                                                            {
                                                                title:title,
                                                                timeDuration:timeDuration,
                                                                description:description, 
                                                                video:video,
                                                            },{new:true},
                                                        )
        // return response
        return res.status(200).json({
            success:true,
            message:"Update Subsection Successfully",
            data : subSection,
            
        }); 
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message, 
        });
    }
};

exports.deleteSubSection = async (req, res) =>{
   try{
        // get id
        const {subSectionId} = req.params;

        // use findbt id and delete
        await SubSection.findByIdAndDelete(subSectionId),{new:true};

        //  return response
        return res.status(200).json({
            success:true,
            message:"Delte Subbsection Successfully",
    });

   }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message, 
        });
   }
}
