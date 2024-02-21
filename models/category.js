const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name:{
        type: String,
        unique: true,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    tags:[String]
}, {timestamps : true})

module.exports = mongoose.model('Category', categorySchema)

