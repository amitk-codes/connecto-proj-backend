const { validateUser, Users } = require('../models/user')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const { Notifications } = require('../models/notification')
const mongoose = require('mongoose')
const Connections = require('../models/connection')

module.exports = (app) => {
  app.post('/signup', async (req, res) => {
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const { name, gender, country, state, city, position, email, password } = req.body
      const { error } = validateUser(req.body)
      if (error) return res.status(400).json({ message: error.message })
      const searchedUser = await Users.findOne({ email })
      if (searchedUser) return res.status(400).json({ message: 'User already registered' })
      const addedUser = new Users({ name, gender, country, state, city, position, email, password })
      await addedUser.save()

      // ----------------- only for testing purpose --------------------
      const userIdString = '64678583bc68488488b2f72b'
      const userId = new mongoose.Types.ObjectId(userIdString)

      const notification1 = new Notifications({ sentTo: addedUser._id, sentBy: userId, about: 'Registration completed, start exploring and enjoy the ride' })
      await notification1.save()

      const userA = (userId < addedUser._id ? userId : addedUser._id)
      const userB = (userId > addedUser._id ? userId : addedUser._id)

      const savedConnection = new Connections({ userA, userB, connectionStatus: 2 })
      await savedConnection.save()

      const notification2 = new Notifications({ sentTo: addedUser._id, sentBy: userId, about: 'For testing features, I added you in my connection' })
      await notification2.save()
      // ---------------------------------------------------------------

      res.status(201).json({ message: 'Registered Successfully' })
      await session.commitTransaction()

    } catch (err) {
      console.log(err)
      await session.abortTransaction()
    }
    await session.endSession()


  })

  app.post('/login', async (req, res) => {
    const { email, password } = req.body
    const searchedUser = await Users.findOne({ email })
    if (!searchedUser) return res.status(400).json({ message: 'Invalid email or password' })
    const checkPass = await bcrypt.compare(password, searchedUser.password)
    if (!checkPass) return res.status(400).json({ message: 'Invalid email or password' })
    const token = await searchedUser.generateToken()

    const user = _.omit(JSON.parse(JSON.stringify(searchedUser)), ['password'])
    res.status(200).send({ user: user, token: token })
  })
}
