const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// create a post
router.post("/", async (req, res) => {
  // console.log(req.body);
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});


// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId == req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


// like/unlike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been unliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


// add a comment
router.put("/:id/addcomment", async (req, res)=>{
  try {
    // console.log(req.body);
    const postID = req.params.id;
    const {userId, comment} = req.body;

    // this is another way of doing it
    // const post = await Post.findById(postID);
    // post.comments.push({ userID: userId, comment: comment });
    // const updatedPost = await post.save();

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postID },
      { $push: { comments: { userID: userId, comment: comment } } },
      { new: true })
      .populate("comments.userID", "username")
      .sort({"comments.date": -1});

    if(!updatedPost){
      res.status(403).json({message: "can not comment"})
    }

    updatedPost.comments.reverse(); // this is untill sort is not working

    res.status(200).send({messge: "added comment", comments: updatedPost.comments})
    
  } catch (err) {
    res.status(500).json({error: err, message: "server error can not post comment"})
  }
});


// get all comments
router.get("/:id/getallcomments", async(req, res)=>{
  const postID = req.params.id;
  try {
    const postWithComments = await Post.findById(postID, "comments")
    .populate("comments.userID", "username profilePicture")
    .sort({ "comments.date": -1 })
    // .populate({ path: "comments.userID", select: "username profilePicture", options: { sort: { "date": -1 }} });

    // console.log(postWithComments.comments);
    postWithComments.comments.reverse();  // this is untill sort is not working

    if(postWithComments){
      res.status(200).json({messge: "success", comments: postWithComments.comments})
    }
  } catch (error) {
    res.status(500).json({error: error, message: "server error can not get comments"})
  }
})


// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});


// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map(async(friendId) => {
        return await Post.find({ userId: friendId });
      })
    );
    // console.log(friendPosts);
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});


// get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    // console.log(posts);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});


// .populate({ path: "comments.userID", select: "username profilePicture", options: { sort: { "date": -1 }} });


module.exports = router;
