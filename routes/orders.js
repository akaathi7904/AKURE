const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createOrder, getUserOrders } = require('../controllers/orderController');

// POST /api/orders  (protected)
router.post('/', authMiddleware, createOrder);

// GET /api/orders   (protected)
router.get('/', authMiddleware, getUserOrders);

module.exports = router;
