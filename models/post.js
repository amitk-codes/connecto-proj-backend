const { required } = require("joi");
const mongoose = require("mongoose");
const { userSchema } = require("./user");


const postSchema = new mongoose.Schema({
    postImg: {
        type: String
    },
    postContent: {
        type: String,
    },

    visibility: {
        type: String,
        required: true
    },
    postOf: {
        type:mongoose.Types.ObjectId,
        ref:"user"
    },
    createdAt: {type: Date, default: Date.now}
})

const Posts = mongoose.model('post', postSchema)
module.exports.Posts = Posts;
module.exports.postSchema = postSchema;