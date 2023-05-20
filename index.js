require('dotenv').config()
require('express-async-errors');

const express = require('express')
const mongoose = require('mongoose')
const { validateUser, Users } = require('./models/user')
const { Comments } = require("./models/comment")
const bodyParser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')
const { Posts } = require('./models/post')
const multer = require('multer')
const _ = require('lodash')
let { upload } = require('./storeImg')
// const upload = multer({dest: 'public'})
const cors = require('cors')
const path = require('path')
const { error } = require('console')
const Connections = require('./models/connection')
const { Notifications } = require('./models/notification')

// -------------------------------------------------------------------------------------------------------
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const { Reactions } = require('./models/reaction')
const loginSignup = require('./routes/login-signup')
const notification = require('./routes/notification')
const postRoutes = require('./routes/post')
const profileRoutes = require('./routes/profile')
const connRequestsRoutes = require('./routes/conn-request')
const reactionRoutes = require('./routes/reactions')
const commentsRoutes = require('./routes/comments')
// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         methods: ["GET", "POST"],
//         credentials: true
//     }
// })

// let roomName = ""

// io.on('connection', (socket) => {
//     // console.log('a user is connected', socket.id)
//     // console.log(socket.handshake.query.userId)
//     socket.join(socket.handshake.query.userId)
// })

// --------------------------------------------------------------------------------------
app.use(cors())
require('./db/conn')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))


app.use(express.json())
app.use(cookieParser())

app.use(express.static(`${__dirname}/public`))



loginSignup(app)




postRoutes(app)





profileRoutes(app)



connRequestsRoutes(app)



notification(app)




app.get('/globalsearch', auth, async (req, res) => {
    const searchTerm = req.query.searchInput
    const regex = new RegExp(searchTerm, 'i')
    const searchUser = await Users.find({ name: regex })
    res.status(200).send({ searched: searchUser })
})


reactionRoutes(app)

commentsRoutes(app)





app.get('/get-connections', auth, async (req, res) => {
    const userId = req.query.userId

    const searchedConnection = await Connections
        .find({ $or: [{ userA: userId }, { userB: userId }], connectionStatus: 2 })
        .populate('userA userB')
    // console.log("searchedConnection---->", searchedConnection)
    const connectionArray = searchedConnection.map((elem) => {
        const connection = String(elem.userA._id) === String(userId) ? elem.userB : elem.userA
        return { connection }
    })

    res.status(200).send({ message: connectionArray })
})

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = process.env.PORT || 5000

// app.listen(PORT, () => console.log(`listening on PORT ${PORT} `))
server.listen(PORT, () => console.log(`listening on PORT ${PORT} `))

