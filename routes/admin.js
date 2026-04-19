const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getAdminStats,
  uploadImage
} = require('../controllers/adminController');

// All routes here are protected by adminAuth middleware
router.use(adminAuth);

// GET /api/admin/stats
router.get('/stats', getAdminStats);

// POST /api/admin/upload
router.post('/upload', uploadImage);

// POST /api/admin/products
router.post('/products', addProduct);

// PUT /api/admin/products/:id
router.put('/products/:id', updateProduct);

// DELETE /api/admin/products/:id
router.delete('/products/:id', deleteProduct);

module.exports = router;
