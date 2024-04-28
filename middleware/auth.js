const catchAsyncError = require('./catchAsyncError')
const ErrorHandler = require('../utils/ErrorHandler')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


const verifyJWT = catchAsyncError(async (req, res, next) => {
    const authUser = req?.headers?.Authorization || req?.headers?.authorization

    if(!authUser?.startsWith('Bearer '))
        return next(new ErrorHandler("Please login again", 401))
    
    const token = authUser.split(' ')[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    req.user = await User.findById(decoded.userInfo.userId)
    
    next();
})

module.exports = {
    verifyJWT
}