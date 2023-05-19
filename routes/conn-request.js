const auth = require("../middleware/auth");
const Connections = require("../models/connection");
const mongoose = require('mongoose');
const { Users } = require("../models/user");
const { Notifications } = require("../models/notification");

module.exports = (app, io) => {
  
app.post('/checkrequest', auth, async (req, res) => {
  const userId = req.user._id
  const { otherProfileId } = req.body
  const userA = (userId < otherProfileId ? userId : otherProfileId)
  const userB = (userId > otherProfileId ? userId : otherProfileId)

  const searchedConnection = await Connections.findOne({ userA, userB })
  if (!searchedConnection) return res.status(200).send({ message: 'NO' })
  if (searchedConnection.connectionStatus == 2) return res.status(200).send({ message: "ACCEPTED" })
  if ((userA == userId && searchedConnection.connectionStatus == 0) || (userB == userId && searchedConnection.connectionStatus == 1)) {
      return res.status(200).send({ message: "ME" })
  } else {
      return res.status(200).send({ message: "OTHER" })
  }


})

app.post('/sendrequest', auth, async (req, res) => {
  const session = await mongoose.startSession()
  try {
      session.startTransaction()
      const userId = req.user._id
      const { otherProfileId } = req.body
      const userA = (userId < otherProfileId ? userId : otherProfileId)
      const userB = (userId > otherProfileId ? userId : otherProfileId)

      let userIdName = await Users.findById(userId)
      userIdName = userIdName.name

      if (!userA && !userB) return res.status(400).send({ message: 'Provide required credentials' })
      const status = (userId === userA ? 0 : 1)
      const savedConnection = new Connections({ userA, userB, connectionStatus: status })
      const notification = new Notifications({ sentTo: otherProfileId, sentBy: userId, about: 'sent you a friend request' })


      await savedConnection.save()
      await notification.save()
      io.to(otherProfileId).emit('sendrequest', `${userIdName} sent you a friend request`)
      res.status(200).send({ status: 1, message: 'Friend Request Sent' })
      await session.commitTransaction()
  } catch (err) {
      console.log(err)
      await session.abortTransaction()
  }
  await session.endSession()

})

app.put('/acceptrequest', auth, async (req, res) => {
  const session = await mongoose.startSession()
  try {
      session.startTransaction()
      const userId = req.user._id
      const { otherProfileId } = req.body
      const userA = (userId < otherProfileId ? userId : otherProfileId)
      const userB = (userId > otherProfileId ? userId : otherProfileId)
      const searchedConnection = await Connections.findOneAndUpdate({ userA, userB }, {
          $set: { connectionStatus: 2 }
      })

      if (!searchedConnection) return res.status(400).send({ message: 'Connections not found' })
      const notification = new Notifications({ sentTo: otherProfileId, sentBy: userId, about: 'accepted your friend request' })
      await notification.save()
      res.status(200).send({ message: 'Connection Accepted' })
      await session.commitTransaction()
  } catch (err) {
      res.status(400).send({ "message": err })
      await session.abortTransaction()
  }
  await session.endSession()
})

app.delete('/deleterequest', auth, async (req, res) => {
  // console.log('deleted request....................')
  const userId = req.user._id
  const { otherProfileId } = req.body
  const userA = (userId < otherProfileId ? userId : otherProfileId)
  const userB = (userId > otherProfileId ? userId : otherProfileId)
  const deletedRequest = await Connections.deleteOne({ userA, userB })
  if (!deletedRequest) return res.status(400).send({ message: 'Connection not found' })
  return res.status(200).send({ message: 'Connection removed' })

})
}