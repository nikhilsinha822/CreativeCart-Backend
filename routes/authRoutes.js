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
    resetPassword,
    getUserList,
    updateUserRole,
    deleteUser
} = require('../controller/authController');
const { verifyJWT, verifyRoles } = require('../middleware/auth')

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

router.route('/admin/users').get(verifyJWT, verifyRoles(['Admin']), getUserList)

router.route('/admin/user/:id')
    .put(verifyJWT, verifyRoles(['Admin']), updateUserRole)
    .delete(verifyJWT, verifyRoles(['Admin']), deleteUser)

module.exports = router;