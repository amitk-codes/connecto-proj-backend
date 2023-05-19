const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  commentMessage: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "user"
  },
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "post"
  }
}, {timestamps: true})

const Comments = mongoose.model('comment', commentSchema)
module.exports.Comments = Comments;
module.exports.commentSchema = commentSchema;