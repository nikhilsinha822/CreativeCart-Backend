const mongoose = require('mongoose');

const Schema = mongoose.Schema

const cartSchema = new Schema({
    cartItems:[{
        product:{
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        variations:{
            image: [{
                publicId: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            }],
            size: {
               type: Number, 
            }
        },
        quantity:{
            type: Number,
            validate:{ 
                validator: (value) => value >= 1,
                message: "Quantity cannot be smaller than one"
            },
            default: 1
        },
        createdAt:{
            type: Date,
            default: Date.now()
        }
    }],
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status:{
        type: String,
        enum: ["active", "ordered", "abandonned"],
        default: "active"
    }
},{timestamps: true})

module.exports = mongoose.model('Cart', cartSchema);