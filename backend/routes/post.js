const express= require('express');
const router = express.Router();
const {CreatePost, LikeUnlikePost,DeletePost, UpdateCaption, AddUpdateComment, DeleteComment} = require('../controllers/post');
const { GetFollowingUserPost } = require('../controllers/user');
const { IsAuthenticated } = require('../middleware/auth');

router.route('/post/upload').post(IsAuthenticated,CreatePost);
router.route('/post/:id').get(IsAuthenticated,LikeUnlikePost);
router.route("/post/:id").delete(IsAuthenticated,DeletePost);
router.route("/posts").get(IsAuthenticated,GetFollowingUserPost);
router.route("/post/:id").put(IsAuthenticated,UpdateCaption);
router.route("/post/comments/:id").post(IsAuthenticated, AddUpdateComment);
router.route("/post/comments/:id").delete(IsAuthenticated, DeleteComment);

module.exports = router;
