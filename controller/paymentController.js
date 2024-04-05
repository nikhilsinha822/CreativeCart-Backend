const Razorpay = require("razorpay")
const catchAsyncError = require("../middleware/catchAsyncError");
const { finalCost, updateStocks } = require('../utils/productHandler');
const Order = require("../models/order");
const Cart = require('../models/cart');
const crypto = require('crypto');
const ErrorHandler = require("../utils/ErrorHandler");

const paymentInit = catchAsyncError(async (req, res) => {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    const cart = await Cart.findById(order.cart);

    const pricing = await finalCost(cart.cartItems);

    await cart.save();

    const response = await instance.orders.create({
        amount: pricing.finalPrice * 100,
        currency: 'INR',
        receipt: crypto.randomBytes(10).toString("hex")
    })

    await updateStocks(cart.cartItems);

    order.finalPrice = pricing.finalPrice
    order.totalSavings = pricing.totalSavings
    order.subTotal = pricing.subTotal
    order.paymentInfo.id = response.id
    order.paymentInfo.status = response.status

    await order.save();

    res.status(200).json({
        success: true,
        response
    })
})

const paymentVerify = catchAsyncError(async (req, res, next) => {
    const {
        orderId,
        razorpay_orderID,
        razorpay_paymentID,
        razorpay_signature } = req.body;
    const sign = razorpay_orderID + "|" + razorpay_paymentID;
    const resultSign = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if(razorpay_signature !== resultSign)
        return next(new ErrorHandler("Payment verification failed", 400))
    
    const order = order.findById(orderId)

    order.paidAt = Date.now()
    order.status = "Confirmed"

    await order.save();

    res.status(200).json({
        success: true,
        message: "payment verification successfull"
    })
})

module.exports = {
    paymentInit,
    paymentVerify
}