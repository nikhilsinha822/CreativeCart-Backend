const cloudinary = require('cloudinary').v2
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const catchAsyncError = require('../middleware/catchAsyncError')
const ErrorHandler = require('../utils/ErrorHandler')
const { uploadSingleImage } = require('../utils/imageHandler')

const userRegister = catchAsyncError(async (req, res, next) => {
    if (!req?.files)
        return next(new ErrorHandler("Avatar is missing", 400));

    const { email, password, name, roles } = req?.body;
    if (!email || !password || !name)
        return next(new ErrorHandler("Required fields missing", 400));

    const duplicate = await User.findOne({ email }).lean().exec();

    if (duplicate)
        return next(new ErrorHandler("Email already registered", 409));

    const upload = await uploadSingleImage(req.files.avatar);

    const avatar = {
        publicId: upload.public_id,
        url: upload.secure_url
    }

    const hsdPwd = bcrypt.hashSync(password, 10);

    const userObj = (!Array.isArray(roles) || !roles.length) ?
        { email, avatar, password: hsdPwd, name } :
        { email, avatar, password: hsdPwd, name }

    await User.create(userObj);

    const accessToken = jwt.sign({
        "UserInfo": {
            "email": email,
            "roles": roles
        }
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' });

    const refreshToken = jwt.sign({
        "email": email
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' });

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    
    res.json({ accessToken });
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

    const accessToken = jwt.sign({
        "userInfo": {
            "email": user.email,
            "roles": user.roles
        }
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign({
        "email": user.email
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ accessToken });
})

const refresh = catchAsyncError(async (req, res, next) => {
    if (!req?.cookies?.jwt) 
        return next(new ErrorHandler("Unauthorized", 401))

    jwt.verify(req.cookies.jwt,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) 
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

module.exports = {
    userRegister,
    userLogin,
    refresh,
    userLogout
}
