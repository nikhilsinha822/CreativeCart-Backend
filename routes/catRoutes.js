const express = require('express');
const router = express.Router();
const { getCategory,
    createCategory,
    updateCategory 
} = require('../controller/categoryController');
const { verifyJWT } = require('../middleware/auth');

router.route('/category')
    .get(getCategory)

router.route('/admin/category')
    .post(verifyJWT, createCategory)
    .put(verifyJWT, updateCategory)

module.exports = router;
