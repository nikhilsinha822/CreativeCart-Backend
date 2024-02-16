const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required: true
    },
    avatar: {
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
    },
    roles: {
        type: [String],
        default: ["Customer"]
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema)