const catchAsyncError = require('../middleware/catchAsyncError');
const Order = require('../models/order');
const Cart = require('../models/cart');
const ErrorHandler = require('../utils/ErrorHandler');
const { finalCost } = require('../utils/productHandler');

const createOrder = catchAsyncError(async (req, res, next) => {
    const { cart: cartId, shippingInfo } = req.body;

    if (!cartId || !shippingInfo)
        return next(new ErrorHandler("Required fields missing", 400));

    const cart = await Cart.findById(cartId);
    if (!cart?.cartItems?.length)
        return next(new ErrorHandler("Cart with the given ID not found or is empty", 404));

    const pricing = await finalCost(cart.cartItems);
    const order = await Order.create({
        cart,
        ...pricing,
        shippingInfo,
        user: req.user._id,
    })
    await cart.save();

    res.status(200).json({
        success: true,
        data: {
            order
        }
    })
})

const getMyOrders = catchAsyncError(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        data: orders
    })
})

const getOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    const cartId = order.cart;

    if(req.user._id.toString() !== order.user.toString())
        return next(new ErrorHandler("Forbidden", 403));

    const cart = await Cart.findById(cartId);
    if (!cart?.cartItems?.length)
        return next(new ErrorHandler("Cart with the given ID not found or is empty", 404));

    const pricing = await finalCost(cart.cartItems);

    await cart.save();

    res.status(200).json({
        success: true,
        data: {
            order, 
            pricing
        }
    })
})

const updateStatus = catchAsyncError(async(req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.status === "Delivered")
        return next(new ErrorHandler("The order was already delivered", 400));

    if(req.body.status === "Delivered")
        order.deliveredAt = Date.now();

    order.status = req.body.status || "Pending";

    await order.save();

    res.status(200).json({
        success: true,
    })
})

module.exports = {
    getOrder,
    createOrder,
    getMyOrders,
    updateStatus,
}