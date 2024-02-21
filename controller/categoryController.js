const catchAsyncError = require('../middleware/catchAsyncError');
const Category = require('../models/category');
const ErrorHandler = require('../utils/ErrorHandler')

const getCategory = catchAsyncError(async (req,res) => {
    const result = await Category.find().lean().exec();
    if(!result?.length){
        return res.status(400).json({message: "No category found"})
    }
    res.status(200).json(result);
})

const createCategory = catchAsyncError(async (req,res,next) => {
    const {name, description, tags} = req.body;
    if(!name || !description || !tags){
        return next(new ErrorHandler("Invalid Request",400))
    } 
    if(!Array.isArray(tags) || !tags.length){
        return next(new ErrorHandler("atleast one tag is required",400));
    }
    const duplicate = await Category.findOne({name}).lean();
    if(duplicate){
        return next(new ErrorHandler(`${name} name category already exists`,409));
    }
    const cat = await Category.create({name , description, tags});
    if(cat){
        return res.status(200).json({message: "Successfully Added"})
    }
})

const updateCategory = catchAsyncError(async (req,res,next) => {
    const {id, name, description, tags} = req.body;    
    if(!id || !name || !description || !tags){
        return next(new ErrorHandler("Invalid Request", 400));
    }
    const cat = await Category.findById(id).exec();
    
    if(!cat){
        return next(new ErrorHandler("No such category found",400));
    }
    if(!Array.isArray(tags) || !tags.length){
        return next(new ErrorHandler("Atleast one tag is required",400));
    }
    cat.name = name;
    cat.description = description;
    cat.tags = tags;
    const response = await cat.save();
    if(response){
        return res.sendStatus(200);
    }
})

module.exports = {
    getCategory,
    createCategory,
    updateCategory
}