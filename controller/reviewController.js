const Review = require('../models/review')
const Product = require('../models/product')
const catchAsyncError = require('../middleware/catchAsyncError')
const ErrorHandler = require('../utils/ErrorHandler')

const getReviews = catchAsyncError(async (req, res, next) => {
    if(!req.params.id)
        return next(new ErrorHandler("Product id is missing", 400));

    const productId = req.params.id;
    const reviews = await Review.find({ product: productId });

    if(!reviews)
        return next(new ErrorHandler("No reviews found", 404));

    res.status(200).json({
        success: true,
        data: reviews
    })
})

const createReview = catchAsyncError(async (req, res, next) => {
    if(!req.params.id)
        return next(new ErrorHandler("Product id is missing", 400));

    const productId = req.params.id;
    const user = req.user._id;
    const { rating, comment } = req.body;

    await Review.create({
        user,
        product: productId,
        rating,
        comment
    })

    const product = await Product.findById(productId);

    product.reviews.stars = product.reviews.stars + rating;
    product.reviews.numReviews = product.reviews.numReviews + 1;

    await product.save();

    res.status(201).json({
        success: true,
        message: "Review added successfully"
    })
})

const updateReview = catchAsyncError(async (req, res, next) => {
    if(!req.params.id)
        return next(new ErrorHandler("Product id is missing", 400));

    const productId = req.params.id;
    const user = req.user._id;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ product: productId, user });
    const product = await Product.findById({ _id: productId });

    product.reviews.stars = product.reviews.stars - review.rating + rating;

    if(!review)
        return next(new ErrorHandler("Review not found", 404));

    review.rating = rating;
    review.comment = comment;


    await review.save();
    await product.save();

    res.status(200).json({
        success: true,
        message: "Review updated successfully"
    })
})


const deleteReview = catchAsyncError(async (req, res, next) => {
    if(!req.params.id)
        return next(new ErrorHandler("Product id is missing", 400));

    const productId = req.params.id;
    const user = req.user._id;

    const review = await Review.findOne({ product: productId, user });
    const product = await Product.findById({ _id: productId });
    
    if(!review)
        return next(new ErrorHandler("Review not found", 404));

    product.reviews.stars = product.reviews.stars - review.rating;
    product.reviews.numReviews = product.reviews.numReviews - 1;

    await review.remove();
    await product.save();

    res.status(200).json({
        success: true,
        message: "Review deleted successfully"
    })
})


module.exports = { 
    getReviews,
    createReview,
    updateReview,
    deleteReview
}

