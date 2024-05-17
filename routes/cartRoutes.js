const express = require('express');
const { verifyJWT } = require('../middleware/auth');
const { getUserCart,
    createUserCart,
    updateUserCart,
    deleteUserCart,
    getCartData
} = require('../controller/cartController');
const router = express.Router();

router.route("/cart")
    .get(verifyJWT, getUserCart)
    .post(verifyJWT, createUserCart)

router.route("/cart/:id")
    .get(verifyJWT, getCartData)
    .put(verifyJWT, updateUserCart)
    .delete(verifyJWT, deleteUserCart)

module.exports = router;