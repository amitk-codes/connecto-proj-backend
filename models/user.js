const mongoose = require('mongoose')
const JOI = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    position: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    aboutMe: {type: String},
    profilePhoto: {type: String, default: 'default-connecto-profile.png'},
    backgroundPhoto: {type: String, default: 'default-connecto-bg4.jpg'}
})

userSchema.methods.generateToken = async function(){
    const token = jwt.sign({_id: this._id}, process.env.secretkey,{expiresIn:"24h"})
    return token
}

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
const Users = mongoose.model('user', userSchema)

function validate(input) {
    const joiSchema = JOI.object({
        name: JOI.string().required(),
        gender: JOI.string().required(),
        country: JOI.string().required(),
        state: JOI.string(),
        city: JOI.string(),
        position: JOI.string().required(),
        email: JOI.string().required(),
        password: JOI.string().required()
    })
    return joiSchema.validate(input)

}

module.exports.Users = Users
module.exports.userSchema = userSchema
module.exports.validateUser = validate


