const auth = require("../middleware/auth")
const { Notifications } = require("../models/notification")


module.exports = (app) => {
  app.get('/notifications', auth, async (req, res) => {
      const userId = req.user._id
      const getNotification = await Notifications.find({ sentTo: userId }).populate('sentBy').sort('-createdAt')
      res.status(200).send({ notifications: getNotification })
  })
  
  app.delete('/delete-notification', auth, async (req, res) => {
      const { notificationId } = req.body
      const deletedNotification = await Notifications.findByIdAndRemove(notificationId)
      if (!deletedNotification) return res.status(404).send({ message: 'Notification not found' })
      res.status(200).send({ message: 'Notification deleted' })
  })
  
  app.put('/read-notification', auth, async (req, res) => {
      const { notificationId } = req.body
      const updatedNotification = await Notifications.findByIdAndUpdate(notificationId, {
          $set: { read: true }
      })
      if (!updatedNotification) return res.status(404).send({ message: 'Notification not found' })
      res.status(200).send({ message: 'Notification marked as read' })
  })
}

