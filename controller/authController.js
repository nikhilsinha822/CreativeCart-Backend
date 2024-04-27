const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const catchAsyncError = require('../middleware/catchAsyncError')
const ErrorHandler = require('../utils/ErrorHandler')
const { uploadSingleImage, deleteSingleImage } = require('../utils/imageHandler')
const { sendTokens } = require('../utils/sendTokens')
const { sendEmail } = require('../utils/sendEmail')
const fs = require('fs')

const userRegister = catchAsyncError(async (req, res, next) => {

    if (!req?.files?.avatar || !req?.files?.avatar?.mimetype?.startsWith('image'))
        return next(new ErrorHandler("Avatar is missing or not valid image", 400));

    const { email, password, name, roles } = req?.body;
    if (!email || !password || !name)
        return next(new ErrorHandler("Required fields missing", 400));

    const duplicate = await User.findOne({ email }).lean().exec();

    if (duplicate)
        return next(new ErrorHandler("Email already registered", 409));

    const avatar = await uploadSingleImage(req.files.avatar);

    const hsdPwd = bcrypt.hashSync(password, 10);

    const userObj = (!Array.isArray(roles) || !roles.length) ?
        { email, avatar, password: hsdPwd, name } :
        { email, avatar, password: hsdPwd, name }

    const user = await User.create(userObj);

    sendTokens(res, user.email, user.roles);
})

const userLogin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req?.body;

    if (!email || !password)
        return next(new ErrorHandler("Invalid Request", 400));

    const user = await User.findOne({ email }).lean().exec();
    if (!user)
        return next(new ErrorHandler("Unauthorized", 401));

    const pass = bcrypt.compareSync(password, user.password);
    if (!pass)
        return next(new ErrorHandler("Unauthorized", 401))

    sendTokens(res, user.email, user.roles)
})

const refresh = catchAsyncError(async (req, res, next) => {
    if (!req?.cookies?.jwt)
        return next(new ErrorHandler("Unauthorized", 401))

    const decoded = jwt.verify(req.cookies.jwt, process.env.REFRESH_TOKEN_SECRET)

    if (!decoded)
        return next(new ErrorHandler("Forbidden", 403))

    const user = await User.findOne({ email: decoded.email }).lean().exec();
    if (!user)
        return next(new ErrorHandler("Unauthorized", 401))

    const accessToken = jwt.sign({
        "userInfo": {
            "email": user.email,
            "roles": user.roles
        }
    }, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' });

    res.status(200).json({ accessToken });
})

const forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    if (!email)
        return next(new ErrorHandler("Email is required", 400));

    const user = await User.findOne({ email: email }).lean().exec();
    if (!user)
        return next(new ErrorHandler("User not found", 404));

    const resetToken = jwt.sign({
        userId: user._id,
    },
        process.env.RESET_PASSWORD_SECRET,
        { expiresIn: '10m' });

    const resetUrl = `${process.env.CLIENT_BASE_URL}/resetpassword/${resetToken}`;
    const forgotPasswordTemplate = fs.readFileSync('./public/emailTemplates/forgotPassword.html', 'utf8');
    const message = forgotPasswordTemplate.replace("resetUrlLink", resetUrl);

    await sendEmail({
        email: email,
        subject: 'Password Recovery',
        message
    })
    
    res.status(200).json({
        success: true,
        message: 'Email sent'
    })
})

const resetPassword = catchAsyncError(async (req, res, next) => {
    if(!req.params.resetToken)
        return next(new ErrorHandler("Invalid Token", 401));

    const userInfo = jwt.verify(req.params.resetToken, process.env.RESET_PASSWORD_SECRET);

    if (!userInfo)
        return next(new ErrorHandler("Invalid Token", 401));

    const user = await User.findById(userInfo.userId).exec();

    if(!user)
        return next(new ErrorHandler("User not found", 404));

    const { password } = req.body;

    if (!password)
        return next(new ErrorHandler("Password is required", 400));

    const hsdPwd = bcrypt.hashSync(password, 10);

    user.password = hsdPwd;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated'
    })
});

const validateUser = catchAsyncError((req, res) => {
    res.status(200).json({ message: 'Authorized' });
})

const userLogout = catchAsyncError((req, res) => {
    if (!req?.cookies?.jwt) return res.sendStatus(204);
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    })
    res.json({ message: 'Cookie cleared' });
})

const getUserDetails = catchAsyncError(async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).select('-password').lean().exec();
    res.status(200).json({
        success: true,
        user
    })
})

const updateUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const { email, name, shippingInfo } = req.body;

    if (req?.files?.avatar || req?.files?.avatar?.mimetype?.startsWith('image')) {
        await deleteSingleImage(user.avatar);
        const avatar = await uploadSingleImage(req.files.avatar);
        user.avatar = avatar
    };
    user.email = email || user.email
    user.name = name || user.name
    user.shippingInfo = shippingInfo || user.shippingInfo
    await user.save()

    sendTokens(res, user.email, user.roles)
})

module.exports = {
    userLogin,
    refresh,
    userLogout,
    updateUser,
    userRegister,
    validateUser,
    getUserDetails,
    forgotPassword,
    resetPassword
}
