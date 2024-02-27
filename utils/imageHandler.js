const cloudinary = require('cloudinary').v2

const uploadSingleImage = async (image) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream((error, uploadResult) => {
            if(error) return reject(error)
            resolve({publicId: uploadResult.public_id, url: uploadResult.secure_url});
        }).end(image.data)
    });
} 

const uploadImagesArray = async (images) => {
    const upload = await Promise.all(images.map(image =>
        uploadSingleImage(image)
    ))
    return upload
}

const deleteSingleImage = async (image) => {
    await new Promise((resolve, reject)=>{
        cloudinary.uploader.destroy(image.publicId)
            .then(() => resolve()) 
            .catch(error => reject(error));
    })
    return
}

const deleteImageArray = async (images) => {
    await Promise.all(images.map(image => 
        deleteSingleImage(image)
    ))
    return
}

module.exports={
    uploadSingleImage,
    uploadImagesArray,
    deleteSingleImage,
    deleteImageArray
}