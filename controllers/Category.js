const Category = require("../models/Category");

// create tag ka handler function

exports.createCategory = async(req, res) =>{
    try{
        const {name,description} = req.body;

        // validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message:"All fields are required",
            })
        }

        // create entry in db

        const CategoryDetails = await Category.create({
            name: name,
            description: description, 
        })
        console.log(CategoryDetails);

        return res.status(200).json({
            success: true,
            message:"Category Created Successfully",
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message:error.message,
        });
    };
};

// get all catagories

exports.showAllCategory = async (req, res) =>{
    try{
        const allCategory = await Category.find({} , {name:true, description:true});
        res.status(200).json({
            success:true,
            message:"All categories returned successfully",
            allCategory,
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message:error.message,
        });
    }
};

exports.categoryPageDetails = async (req, res) =>{
    try{
        const { categoryId } = req.body;

        // get cources for the specifiic category
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        console.log("selectedCategory");

        // handle the case where the category is not found
        if(selectedCategory.cources.length === 0){
            console.log("No courses found for the selected category.");
            return res.status(400).json({
                success:false,
                message:"No courses found for the selected category. ",
            });
        }

        const selectedCourses = selectedCategory.courses;

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId},
        }).populate("courses");

        let diffrentCourses = [];

        for(const category of categoriesExceptSelected){
            diffrentCourses.push(...category.courses);
        }

        // get top selling courses across all courses

        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses
            .sort((a,b) => b.sold - a.sold)
            .slice(0, 10);

        res.status(200).json({
            data : {
                selectedCourses,
                diffrentCourses,
                mostSellingCourses,
              }
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Sever Error",
            error:error.message,
        });
    }
}