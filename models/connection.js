const mongoose = require('mongoose')

const connectionSchema = new mongoose.Schema({
  userA: {type: mongoose.Types.ObjectId, ref: 'user'},
  userB: {type: mongoose.Types.ObjectId, ref: 'user'},
  connectionStatus: {type: Number, enum: [0, 1, 2]}
})

const Connections = mongoose.model('connection', connectionSchema)

module.exports = Connections
