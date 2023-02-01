const express= require('express');

const router = express.Router();
const {RegisterUser,LoginUser,FollowUser, LogoutUser, UpdatePassword, UpdateProfile, DeleteAccount, MyProfile, GetUserProfile, ForgotPassword, ResetPassword} = require('../controllers/user');
const {IsAuthenticated} = require('../middleware/auth')



router.route('/register').post(RegisterUser);
router.route('/login').post(LoginUser);
router.route('/follow/:id').get(IsAuthenticated,FollowUser);
router.route('/logout').get(LogoutUser)
router.route("/update/password").put(IsAuthenticated,UpdatePassword);
router.route("/update/profile").put(IsAuthenticated,UpdateProfile);
router.route("/delete/me").delete(IsAuthenticated,DeleteAccount);
router.route("/me").get(IsAuthenticated,MyProfile);
router.route("/user/:id").get(IsAuthenticated,GetUserProfile);
router.route("/forgot/password").post(ForgotPassword);
router.route("/password/reset/:token").put(ResetPassword);

module.exports = router;