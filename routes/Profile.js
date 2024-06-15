const express = require("express");
const router = express.Router();
const {auth}= require("../middlewares/auth");
const {updateProfile,deleteAccount,getUserDetails,getEnrolledCourse} = require("../controllers/Profile");


// Deleter user account
router.put("/updateProfile",auth, updateProfile);
router.delete("/deleteAccount",auth ,deleteAccount);
router.put("/updateDisplayPicture",)
router.get("/getUserDetails" , auth, getUserDetails);
router.get("/getEnrolledCourses" , auth, getEnrolledCourse);


// Get Enrolled Course

// router.get("/getEnrolledCourses", auth, getEnrolledCourses);
// router.put("/updateDisplayPicture", auth,updateDisplayPicture);

module.exports = router;



