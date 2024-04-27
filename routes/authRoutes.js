const express = require('express');
const router = express.Router();
const { userLogin,
    refresh,
    userLogout,
    updateUser,
    userRegister,
    getUserDetails,
    validateUser,
    forgotPassword,
    resetPassword
} = require('../controller/authController');
const {verifyJWT} = require('../middleware/auth')

router.route('/register').post(userRegister)

router.route('/login').post(userLogin)

router.route('/refresh').post(refresh)

router.route('/validate').get(verifyJWT, validateUser)

router.route('/forgotpassword').post(forgotPassword)

router.route('/resetpassword/:resetToken').put(resetPassword)

router.route('/profile/me')
    .get(verifyJWT, getUserDetails)
    .put(verifyJWT, updateUser)

router.route('/logout').post(userLogout)

module.exports = router;