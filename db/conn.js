const mongoose = require('mongoose')
const db = process.env.db


mongoose.connect(db)
    .then(()=>console.log('Connected to DB'))
    .catch((err)=>console.log('Connection to DB failed:', err))
