const cloudinary = require('cloudinary').v2
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userRegister = async (req, res) => {
    try {
        if (!req?.files) {
            return res.status(400).json({ message: "Avatar is missing" });
        }

        const { email, password, name, roles } = req?.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Please enter all required fields" })
        }

        const duplicate = await User.findOne({ email }).lean().exec();

        if (duplicate) {
            return res.status(409).json({ message: "Email already registered" })
        }
        // alternate method to upload on cloudinary 
        // const {mimetype, data} = req.files.avatar;
        // const base64Image = data.toString('base64');
        // const avatar = await cloudinary.uploader.upload(`data:${mimetype};base64,${base64Image}`, {
        //     folder: "avatar"
        // })
        // console.log(avatar);

        const hsdPwd = bcrypt.hashSync(password, 10);

        const userObj = (!Array.isArray(roles) || !roles.length) ?
            { email, avatar, password: hsdPwd, name } :
            { email, avatar, password: hsdPwd, name }

        const upload = await new Promise((resolve) => {
            cloudinary.uploader.upload_stream((error, uploadResult) => {
                return resolve(uploadResult);
            }).end(req.files.avatar.data)
        });

        const avatar = {
            publicId: upload.public_id,
            url: upload.secure_url
        }

        const user = await User.create(userObj);
        // console.log(user);

        const accessToken = jwt.sign({
            "UserInfo": {
                "email": email,
                "roles": roles
            }
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' });

        const refreshToken = jwt.sign(
            { "email": email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' });

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.json({ accessToken, name, email, avatar });
    } catch (err) {
        console.log(err)
    }
}

const userLogin = async (req, res) => {
    const { email, password } = req?.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password is required" })
    }

    const user = await User.findOne({ email }).lean().exec();
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const pass = bcrypt.compareSync(password, user.password);
    if (!pass) {
        return res.status(401).json({ message: "Unauthorized" });
    }

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
}

const refresh = async (req, res) => {
    if(!req?.cookies?.jwt){
        return res.status(401).json({message : "Unauthorized"})
    }

    jwt.verify(req.cookies.jwt, 
        process.env.REFRESH_TOKEN_SECRET, 
        async (err, decoded)=>{
            if(err){
                return res.status(403).json({message: "Forbidden"});
            }
            const user = await User.findOne({ email:decoded.email }).lean().exec();
            if(!user){
                return res.status(401).json({message: "Unauthorized"})
            }
            const accessToken = jwt.sign({
                "userInfo":{
                    "email": user.email,
                    "roles": user.roles
                }
            }, process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '1d'});

            res.status(200).json({accessToken});
    })
}

const userLogout = (req,res) => {
    if(!req?.cookies?.jwt) return res.sendStatus(204);
    res.clearCookie('jwt', { 
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    })
    res.json({ message: 'Cookie cleared' });
}

module.exports = {
    userRegister,
    userLogin,
    refresh,
    userLogout
}
