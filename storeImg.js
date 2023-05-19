const multer = require('multer')
const {v4: uuidv4} = require('uuid')
const path = require('path')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public')
    },
    filename: function(req, file, cb){
        cb(null, uuidv4() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if(allowedFileTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new Error('Only JPEG and PNG files are allowed!'), false)
    }
}


let upload = multer({storage})
module.exports.upload = upload
