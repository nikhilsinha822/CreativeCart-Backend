const express = require('express')
const router = express.Router();
const categoryController = require('../controller/categoryController')

router.route('/')
    .get(categoryController.getCategory)
    .post(categoryController.createCategory)
    .put(categoryController.updateCategory)

module.exports = router
