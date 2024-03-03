const express = require('express');
const { verifyJWT } = require('../middleware/auth');
const { getUserCart,
    createUserCart,
    updateUserCart,
    deleteUserCart
} = require('../controller/cartController');
const router = express.Router();

router.route("/cart")
    .get(verifyJWT, getUserCart)
    .post(verifyJWT, createUserCart)

router.route("/cart/:id")
    .put(verifyJWT, updateUserCart)
    .delete(verifyJWT, deleteUserCart)

module.exports = router;