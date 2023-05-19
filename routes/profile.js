const auth = require("../middleware/auth")
const { Users } = require("../models/user")
const { upload } = require("../storeImg")


module.exports = (app) => {
  app.get('/profile', auth, async (req, res) => {
    res.status(200).send({ status: 1, user: req.user })
})

app.put('/updateprofile', [auth, upload.fields([{ name: 'profilePhoto' }, { name: 'backgroundPhoto' }])], async (req, res) => {

    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const profileMimetype = req.files?.profilePhoto?.[0].mimetype
    const backgroundMimetype = req.files?.backgroundPhoto?.[0].mimetype
    const mimetypeArr = []
    if (profileMimetype) mimetypeArr.push(profileMimetype)
    if (backgroundMimetype) mimetypeArr.push(backgroundMimetype)
    const checkMimetype = mimetypeArr.every(elem => allowedFileTypes.includes(elem))
    if (!checkMimetype) {
        return res.status(400).send({ message: 'Invalid file type' })
    }

    const user = req.user
    const updates = {}

    for (const prop in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, prop) &&
            user[prop] !== req.body[prop] &&
            prop !== 'profilePhoto' &&
            prop !== 'backgroundPhoto') {

            // console.log('loooooppp callledd', prop)
            updates[prop] = req.body[prop]
        }
    }

    const photoProperties = ['profilePhoto', 'backgroundPhoto']
    for (const photoProp of photoProperties) {
        if (req.files[photoProp]) {
            // console.log(req.files[photoProp][0])
            updates[photoProp] = req.files[photoProp][0].filename
        }
    }



    const updatedUser = await Users.findOneAndUpdate({ _id: user._id }, updates, { new: true })
    await updatedUser.save()
    res.status(200).send({ status: 1, user: updatedUser })

})
}