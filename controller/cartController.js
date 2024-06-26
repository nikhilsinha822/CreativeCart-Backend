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
        const response = await costPrice(item.product);
        if (!response) {
            cart.cartItems = cart.cartItems.filter((cartItem) => cartItem.product !== item.product);
        } else {
            const { price, discount } = response;
            subTotal += price * item.quantity;
            totalSavings += discount * item.quantity;
        }
    }))
    await cart.save();

    res.status(200).json({
        success: true,
        subTotal,
        totalSavings,
        finalprice: subTotal - totalSavings,
        cart
    });
});

const getCartData = catchAsyncError(async (req, res, next) => {
    const cartId = req.params.id;
    if (!cartId)
        return next(new ErrorHandler("Id is required", 404));

    const cart = await Cart.findById(cartId);
    if (!cart)
        return next(new ErrorHandler("Cart is not found", 404));

    if (cart.createdBy.toString() !== req.user._id.toString())
        return next(new ErrorHandler("Forbidden", 403))

    let subTotal = 0, totalSavings = 0;
    await Promise.all(cart.cartItems.map(async (item) => {
        const response = await costPrice(item.product);
        if (!response) {
            cart.cartItems = cart.cartItems.filter((cartItem) => cartItem.product !== item.product);
        } else {
            const { price, discount } = response;
            subTotal += price * item.quantity;
            totalSavings += discount * item.quantity;
        }
    }));

    res.status(200).json({
        success: true,
        subTotal,
        totalSavings,
        finalprice: subTotal - totalSavings,
        data: cart
    })
})

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
        const response = await costPrice(item.product);
        if (!response) {
            cart.cartItems = cart.cartItems.filter((cartItem) => cartItem.product !== item.product);
        } else {
            const { price, discount } = response;
            subTotal += price * item.quantity;
            totalSavings += discount * item.quantity;
        }
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
        const response = await costPrice(item.product);
        if (!response) {
            cart[0].cartItems = cart[0].cartItems.filter((cartItem) => cartItem.product !== item.product);
        }
        else {
            const { price, discount } = response;
            subTotal += price * item.quantity;
            totalSavings += discount * item.quantity;
        }
    }));
    await cart[0].save();

    res.status(200).json({
        success: true,
        subTotal,
        totalSavings,
        finalprice: subTotal - totalSavings,
        data: cart
    })
});

const directBuyProduct = catchAsyncError(async (req, res, next) => {
    if(!req.body.product)
        return next(new ErrorHandler("Product Id is required", 400));

    const product = await Product.findById(req.body.product);

    if(!product)
        return next(new ErrorHandler("Product not found", 404));

    const cart = await Cart.create({
        cartItems:[{
            product: req.body.product
        }],
        status: "archived",
        createdBy: req.user._id
    })

    res.status(200).json({
        success: true,
        data: cart
    })
})

const costPrice = async (productID) => {
    let price = 0, discount = 0;

    const product = await Product.findById(productID);

    if (!product)
        return null;

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
    getCartData,
    directBuyProduct
}