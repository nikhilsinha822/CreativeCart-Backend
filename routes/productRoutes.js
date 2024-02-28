const express = require('express')
const router = express.Router();
const { createProduct,
    getAdminProducts,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductDetails
} = require('../controller/productController')
const { verifyJWT } = require('../middleware/auth')

router.route("/admin/product/new")
    .post(verifyJWT, createProduct)

router.route("/admin/product/:id")
    .put(verifyJWT, updateProduct)
    .delete(verifyJWT, deleteProduct)

router.route("/admin/product")
    .get(verifyJWT, getAdminProducts)

router.route("/product")
    .get(getAllProducts)

router.route("/product/:id")
    .get(getProductDetails)

module.exports = router