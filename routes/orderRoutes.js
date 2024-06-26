const express = require('express');
const { verifyJWT, verifyRoles } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder, updateStatus } = require('../controller/orderController');
const router = express.Router();

router.route('/order')
    .get(verifyJWT, getMyOrders)
    .post(verifyJWT, createOrder)

router.route('/order/:id')
    .get(getOrder)

router.route('/admin/order')
    .put(verifyJWT, verifyRoles(['Admin']), updateStatus)

module.exports = router