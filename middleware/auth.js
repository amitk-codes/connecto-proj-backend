const jwt = require('jsonwebtoken')
const { Users } = require('../models/user')
const _ = require('lodash')

const auth = async(req, res, next)=>{
    // console.log(req.headers['authorization'])
    // console.log('hehhehheheh')
    try{
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.secretkey)
        // console.log('checkkkkkkkkk----1')
        let user = await Users.findOne({_id: decoded._id})
        // console.log('checkkkkkkkkk----2')
        // user = _.omit(JSON.parse(JSON.stringify(user)), ['password'])
        req.user = user
        req.token = token
        next()
    }catch(err){
        return res.status(401).json({message: 'Not Authorised to perform this task'})
    }

}

module.exports = auth
