const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "post"
  },
  reactedBy: [{
    userId: {type: mongoose.Types.ObjectId, ref: 'user'},
    reactionType: {type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry']}
  }],
  createdAt: {type: Date, default: Date.now}
})

const Reactions = mongoose.model('reaction', reactionSchema)

module.exports.Reactions = Reactions