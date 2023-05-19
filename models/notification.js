const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  sentTo : {type: mongoose.Types.ObjectId, ref: 'user'},
  sentBy : {type: mongoose.Types.ObjectId, ref: 'user'},
  about : {type: String},
  read : {type: Boolean, default: false},
  createdAt : {type: Date, default: Date.now}
})

const Notifications = mongoose.model('notification', notificationSchema)

module.exports.Notifications = Notifications