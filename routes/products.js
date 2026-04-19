const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');

// GET /api/products
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

module.exports = router;
