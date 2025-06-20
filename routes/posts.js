const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

//create post:
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update post:

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await Post.updateOne({ _id: req.params.id }, { $set: req.body });
      res.status(200).json("Post updated");
    } else {
      res.status(403).json("You can update only your posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete post:
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await Post.deleteOne();
      res.status(200).json("Post Deleted");
    } else {
      res.status(403).json("You can delete only your posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like_dislike a post:
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await Post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("the post has been liked");
    } else {
      await Post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(403).json("the post has been disliked");
    }
  } catch {}
});
//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get  all timeline:

router.get("/timeline/all", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json("User ID is required");

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json("User not found");

    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    console.error("Timeline Error:", err);
    res.status(500).json("Server error: " + err.message);
  }
});

module.exports = router;
