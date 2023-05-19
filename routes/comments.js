const auth = require("../middleware/auth");
const { Comments } = require("../models/comment");
const { Posts } = require("../models/post");

module.exports = (app) => {

  app.post("/comment", auth, async (req, res) => {
    // console.log(req.body)
    const userId = req.user._id;
    const { postId, commentMessage } = req.body;
    try {
      const getPost = await Posts.find({ _id: postId })
      if (!getPost.length) {
        return res.status(404).send({ status: 0, message: "kalue shi post bhej" })
      }
      const newComment = new Comments({
        postId,
        senderId: userId,
        commentMessage
      });
      await newComment.save();
      return res.status(201).send({ status: 1, message: "comment sent!", responseData: newComment })
    }
    catch (err) {
      console.log("::errr", err)
      return res.status(500).send({ status: 0, message: "INTERNAL ERROR FOUND!" })
    }

  })

  app.post('/getcomments', async (req, res) => {
    try {
      const { postId } = req.body
      const getComments = await Comments.find({ postId }).populate('senderId').sort('-createdAt')
      res.status(200).json({ status: 1, comments: getComments })
    } catch (err) {
      console.log(err)
      res.status(400).send({ status: 0, message: 'Error Occured' })
    }
  })
}