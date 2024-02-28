const express = require('express');
const router = express.Router();
const { userLogin,
    userRegister,
    refresh,
    userLogout
} = require('../controller/authController');

router.route('/register').post(userRegister)

router.route('/login').post(userLogin)

router.route('/refresh').post(refresh)

router.route('/logout').post(userLogout)

module.exports = router;