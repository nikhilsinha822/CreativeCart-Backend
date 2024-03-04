const Cart = require('../models/cart');
const Product = require('../models/product');
const catchAsyncError = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/ErrorHandler');

const createUserCart = catchAsyncError(async (req, res) => {
    const cartItems = req.body.cartItems || [];

    await Cart.updateMany({ createdBy: req.user._id }, {
        $set: {
            status: "abandonned"
        }
    })

    const cart = await Cart.create({
        cartItems,
        createdBy: req.user._id
    });

    let subTotal = 0, totalSavings = 0;
    await Promise.all(cartItems.map(async (item) => {
        const { price, discount } = await costPrice(item.product);
        subTotal += price*item.quantity;
        totalSavings += discount*item.quantity;
    }))

    res.status(200).json({
        success: true,
        subTotal,
        totalSavings,
        finalprice: subTotal - totalSavings,
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

    if (cart.createdBy.toString() !== req.user._id.toString())
        return next(new ErrorHandler("Forbidden", 403))

    cart.cartItems = cartItems;
    const response = await cart.save();

    let subTotal = 0, totalSavings = 0;
    await Promise.all(cartItems.map(async (item) => {
        const { price, discount } = await costPrice(item.product);
        subTotal += price*item.quantity;
        totalSavings += discount*item.quantity;
    }));

    res.status(200).json({
        success: true,
        subTotal,
        totalSavings,
        finalprice: subTotal - totalSavings,
        data: response
    })
})

const deleteUserCart = catchAsyncError(async (req, res, next) => {
    const cartId = req.params.id;
    const cart = await Cart.findById(cartId);

    if (!cart)
        return next(new ErrorHandler("Cart is not found", 404));

    if (cart.createdBy.toString() != req.user._id.toString())
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

    let subTotal = 0, totalSavings = 0;
    await Promise.all(cart[0].cartItems.map(async (item) => {
        const { price, discount } = await costPrice(item.product);
        subTotal += price*item.quantity;
        totalSavings += discount*item.quantity;
    }));

    res.status(200).json({
        success: true,
        subTotal,
        totalSavings,
        finalprice: subTotal - totalSavings,
        data: cart
    })
});

const costPrice = async (productID) => {
    let price = 0, discount = 0;

    const product = await Product.findById(productID);

    price += product.price;

    if (product.discountType === "amount") {
        discount += product.discountValue;
    } else if (product.discountType === "percent") {
        discount += (product.discountValue * price) / 100;
    }

    return { price, discount };
}

module.exports = {
    createUserCart,
    updateUserCart,
    deleteUserCart,
    getUserCart,
}