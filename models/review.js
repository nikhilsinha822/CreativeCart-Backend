const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product:{
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating:{
        type: Number,
        validate:{ 
            validator: (value) => value >= 0 && value <=5,
            message: "rating must be between 0 and 5"
        },
        required: true
    },
    comment:{
        type: String,
    }
},{timestamps: true})

module.exports = mongoose.model("Review", reviewSchema)