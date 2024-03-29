const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    category:{
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    title:{
        type: String,
        required: true
    },
    images:[{
        publicId:{
            type: String,
            required: true,
        },
        url:{
            type:String,
            required: true
        }
    }],
    rating:{
        stars:{
            type: Number,
            default: 0,
            required: true
        },
        numReviews:{
            type: Number,
            default: 0,
            required: true
        }
    },
    summary:{
        type: String,
        required: true
    },
    desc:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    stock:{
        type: Number,
        default: true,
        required: true
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    discountType:{
        type: String,
        enum: ["none", "percent", "amount"],
        required: true
    },
    discountValue:{
        type: Number
    },
},{timestamps: true})

productSchema.index({title: 'text', desc: 'text'})

module.exports = mongoose.model("Product", productSchema)
