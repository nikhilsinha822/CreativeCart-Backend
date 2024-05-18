const express = require('express')
const router = express.Router();
const { createProduct,
    getAdminProducts,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductDetails
} = require('../controller/productController')
const { verifyJWT, verifyRoles } = require('../middleware/auth')

router.route("/admin/product/new")
    .post(verifyJWT, verifyRoles(['Admin']), createProduct)

router.route("/admin/product/:id")
    .put(verifyJWT, verifyRoles(['Admin']), updateProduct)
    .delete(verifyJWT, verifyRoles(['Admin']), deleteProduct)

router.route("/admin/product")
    .get(verifyJWT, verifyRoles(['Admin']), getAdminProducts)

router.route("/product")
    .get(getAllProducts)

router.route("/product/:id")
    .get(getProductDetails)

module.exports = router