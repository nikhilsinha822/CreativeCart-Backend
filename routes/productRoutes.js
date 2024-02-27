const express = require('express')
const app = express();
const router = express.Router();
const productController = require('../controller/productController')
const {verifyJWT} = require('../middleware/auth')

router.route("/admin/product/new")
    .post(verifyJWT, productController.createProduct)

router.route("/admin/product/:id")
    .put(verifyJWT, productController.updateProduct)
    .delete(verifyJWT, productController.deleteProduct)

router.route("/admin/product")
    .get(verifyJWT, productController.getAdminProducts)

router.route("/product")
    .get(productController.getAllProducts)

router.route("/product/:id")
    .get(productController.getProductDetails)

module.exports = router