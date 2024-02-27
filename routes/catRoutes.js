const express = require('express')
const router = express.Router();
const categoryController = require('../controller/categoryController')

router.route('/category')
    .get(categoryController.getCategory)

router.route('/admin/category')
    .post(categoryController.createCategory)
    .put(categoryController.updateCategory)

module.exports = router
