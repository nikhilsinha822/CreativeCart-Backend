const express = require('express')
const router = express.Router();
const authController = require('../controller/authController')

router.route('/register')
    .post(authController.userRegister)
router.route('/login')
    .post(authController.userLogin)
router.route('/refresh')
    .post(authController.refresh)
router.route('/logout')
    .post(authController.userLogout)

module.exports = router