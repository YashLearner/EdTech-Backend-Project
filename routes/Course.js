const express = require("express");

// Improting middlewares
const {auth, isInstructor, isAdmin, isStudent } = require("../middlewares/auth");

// Course controller import
const {createCourse, getAllCourses, getACourseDetails} = require("../controllers/Course");

// Category controller import
const { showAllCategory, categoryPageDetails,createCategory } = require("../controllers/Category");

// Rating And Review Controller import
const { createRating, getAverageRating, getAllRatingReview } = require("../controllers/RatingAndReview");

// Section Controller import
const {createSection, updateSection,deleteSection} = require("../controllers/Section");

// Sub Section Controller import
const {createSubSection,updateSubSection,deleteSubSection} = require("../controllers/SubSection");

const router =express.Router();

// ******************************************************************* //
//                            Course Route                             //
// ******************************************************************* //

// Course can only be Created by Instructor
router.post("/createCourse",auth, isInstructor,createCourse);

// get all course
router.get("/getAllCourse", auth, isInstructor,getAllCourses);

//  get course details
router.post("/getACourseDetails", auth,isInstructor,getACourseDetails);



// ****************************************************************** //
//                           SECTION ROUTE                            //
// ****************************************************************** //
// Add a section to your course
router.post("/addSection", auth, isInstructor,createSection);

// update a section 
router.post("/updateSection", auth, isInstructor,updateSection);

// delete a section
router.post("/deleteSection", auth, isInstructor,deleteSection);

// create subSection
router.post("/createSubSection" , auth , isInstructor ,createSubSection);

// update subSection
router.post("/updateSubSection", auth, isInstructor,updateSubSection);

// delete subsection
router.post("/deleteSubSection", auth , isInstructor, deleteSubSection);



// Category can only be created bt admin 

router.post("/createCategory", auth,isAdmin,createCategory);
router.get("/showAllCategories",showAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

// Rating and Review
router.post("/createRating",auth,isStudent,createRating);
router.get("/getAverageRating" , getAverageRating);
router.get("/getReviews",getAllRatingReview)

module.exports = router;