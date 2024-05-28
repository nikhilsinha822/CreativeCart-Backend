const Product = require('../models/product')
const catchAsyncError = require('../middleware/catchAsyncError')
const ErrorHandler = require('../utils/ErrorHandler')
const { uploadImagesArray, deleteImageArray } = require('../utils/imageHandler')
const ApiFeatures = require('../utils/apiFeatures')
const product = require('../models/product')

const getProductDetails = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
        return next(new ErrorHandler("Product not found", 404));

    res.status(200).json({
        success: true,
        data: product
    });
})

const getAllProducts = catchAsyncError(async (req, res) => {
    const totalProducts = await Product.countDocuments();
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search().filter().pagination();

    const matchedProducts = await new ApiFeatures(Product.find(), req.query)
        .search().filter().query.countDocuments()

    const matchedPages = Math.ceil(matchedProducts / pageSize);

    const products = await apiFeature.query

    res.status(200).json({
        success: true,
        totalProducts,
        matchedPages,
        matchedProducts,
        page,
        pageSize,
        data: products
    })
})


const createProduct = catchAsyncError(async (req, res, next) => {
    if (!req?.files?.images.length)
        return next(new ErrorHandler("Images are missing", 400));

    const { price, discountType, discountValue } = req.body;

    if (discountType === "percent" && discountValue > 100)
        return next(new ErrorHandler("Discount value cannot be greater than 100%", 400));
    if (discountType === "amount" && discountValue > Number(price))
        return next(new ErrorHandler("Discount value cannot be greater than price", 400));
    if (discountType === "none")
        req.body.discountValue = 0;
    if (price <= 0)
        return next(new ErrorHandler("Price cannot be less than or equal to 0", 400));

    const images = await uploadImagesArray(req.files.images)

    req.body.createdBy = req.user._id
    req.body.images = images

    const response = await Product.create(req.body);
    if (response)
        return res.status(201).json({
            success: true,
            product: response._id.toString(),
            message: "Sucessfully added"
        });
})

const getAdminProducts = catchAsyncError(async (req, res, next) => {
    const response = await Product.find().lean();

    if (!response?.length)
        return next(new ErrorHandler("No Products Found", 200))

    return res.status(200).json({
        success: true,
        data: response
    })
})

const updateProduct = catchAsyncError(async (req, res, next) => {
    const productId = req.params.id;
    let product = await Product.findById(productId)

    if (!product) {
        return next(new ErrorHandler("Product doesnot exist", 404))
    }
    if (req?.files?.images.length) {
        await deleteImageArray(product.images)
        product.images = await uploadImagesArray(req.files.images)
    }

    const data = product = await Product.findByIdAndUpdate(productId, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        data,
    });
})

const deleteProduct = catchAsyncError(async (req, res, next) => {
    const productId = req.params.id
    const product = await Product.findById(productId)
    if (!product) {
        return next(new ErrorHandler("Product doesnot exist", 404))
    }
    await deleteImageArray(product.images)
    await product.deleteOne()

    res.status(200).json({
        success: true,
        message: `Product id:${product._id} name:${product.title} deleted successfully`,
    });
})

module.exports = {
    getAllProducts,
    getProductDetails,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct
}