const jwt = require('jsonwebtoken')

const sendTokens = (res, email, roles, userId) => {
    const accessToken = jwt.sign({
        "userInfo": {
            "userId": userId,
            "email": email,
            "roles": roles
        }
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' });

    const refreshToken = jwt.sign({
        userId,
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
}

module.exports = {
    sendTokens
}