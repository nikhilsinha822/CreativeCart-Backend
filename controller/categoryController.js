const Category = require('../models/category');

const getCategory = async (req,res) => {
    const result = await Category.find().lean().exec();
    if(!result?.length){
        return res.status(400).json({message: "No category found"})
    }
    res.status(200).json(result);
}

const createCategory = async (req,res) => {
    const {name, description, tags} = req.body;
    if(!name || !description || !tags){
        return res.status(400).json({message: "Required fields are missing"});
    } 
    if(!Array.isArray(tags) || !tags.length){
        return res.status(400).json({message: "Atleast one tag is required"});
    }
    const duplicate = await Category.findOne({name}).lean();
    if(duplicate){
        return res.status(409).json({message: `${name} name category already exists`})
    }
    const cat = await Category.create({name , description, tags});
    if(cat){
        return res.status(200).json({message: "Successfully Added"})
    }
    else{
        console.log({message: "Invalid request"})
        return res.status(400).json({message: "Invalid request"});
    }
}

const updateCategory = async (req,res) => {
    const {id, name, description, tags} = req.body;    
    if(!id || !name || !description || !tags){
        return res.status(400).json({message: "Invalid Request"})
    }
    if(id.length != 24){
        return res.status(400).json({message: "Invalid ID"})
    }
    const cat = await Category.findById(id).exec();
    
    if(!cat){
        return res.status(400).json({message: "No such category found"})
    }
    if(!Array.isArray(tags) || !tags.length){
        return res.status(400).json({message: "Atleast one tag is required"});
    }
    cat.name = name;
    cat.description = description;
    cat.tags = tags;
    const response = await cat.save();
    if(response){
        return res.sendStatus(200);
    }
    else{
        return res.status(400).json({message: "Invalid request"})
    }
}

module.exports = {
    getCategory,
    createCategory,
    updateCategory
}