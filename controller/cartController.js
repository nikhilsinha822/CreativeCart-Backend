const Cart = require('../models/cart');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/ErrorHandler');

const createUserCart = catchAsyncError(async (req, res) => {
    const cartItems = req.body.cartItems || [];
    const cart = await Cart.create({
        cartItems,
        createdBy: req.user._id
    });
    res.status(200).json({
        success: true,
        cart
    });
});

const updateUserCart = catchAsyncError(async (req, res, next) => {
    const cartId = req.params.id;
    if (!cartId)
        return next(new ErrorHandler("Id is required", 404));

    const cartItems = req.body.cartItems || [];

    const cart = await Cart.findById(cartId);
    if (!cart)
        return next(new ErrorHandler("Cart is not found", 404));

    if(cart.createdBy.toString() !== req.user._id.toString())
        return next(new ErrorHandler("Forbidden", 403))

    cart.cartItems = cartItems;
    const response = await cart.save();
    res.status(200).json({
        success: true,
        data: response
    })
})

const deleteUserCart = catchAsyncError(async (req, res, next) => {
    const cartId = req.params.id;
    const cart = await Cart.findById(cartId);

    if (!cart)
        return next(new ErrorHandler("Cart is not found", 404));

    if(cart.createdBy.toString() != req.user._id.toString())
        return next(new ErrorHandler("Forbidden", 403))

    await cart.deleteOne();
    res.status(200).json({
        success: true,
        message: "Deleted Successfully"
    })
})

const getUserCart = catchAsyncError(async (req, res, next) => {
    const cart = await Cart.find({ createdBy: req.user._id, status: "active" })
    if (!cart?.length)
        return next(new ErrorHandler("No cart found", 200))

    res.status(200).json({
        success: true,
        data: cart
    })
});

module.exports = {
    createUserCart,
    updateUserCart,
    deleteUserCart,
    getUserCart,
}