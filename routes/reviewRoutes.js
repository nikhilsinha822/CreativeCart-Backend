const express = require('express');
const router = express.Router();
const { getReviews,
    createReview,
    updateReview,
    deleteReview } = require('../controller/reviewController');
const { verifyJWT } = require('../middleware/auth');

router.route('/product/review/:id')
    .get(verifyJWT, getReviews)
    .post(verifyJWT, createReview)
    .put(verifyJWT, updateReview)
    .delete(verifyJWT, deleteReview)

module.exports = router;