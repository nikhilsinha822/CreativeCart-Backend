const express = require('express');
const { verifyJWT } = require('../middleware/auth');
const { paymentInit, paymentVerify } = require('../controller/paymentController');
const router = express.Router();

router.route('/payment/init')
    .post(verifyJWT, paymentInit)

router.route('/payment/verify')
    .post(verifyJWT, paymentVerify)

module.exports = router