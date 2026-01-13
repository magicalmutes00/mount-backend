const express = require('express');
const router = express.Router();
const FathersController = require('../controllers/fathersController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/active', FathersController.getAllActiveByCategory);

// Protected routes (authentication required)
router.get('/admin/all', authenticateToken, FathersController.getAll);
router.get('/admin/stats', authenticateToken, FathersController.getStats);
router.get('/admin/category/:category', authenticateToken, FathersController.getByCategory);
router.get('/admin/:id', authenticateToken, FathersController.getById);
router.post('/admin', authenticateToken, FathersController.create);
router.put('/admin/:id', authenticateToken, FathersController.update);
router.delete('/admin/:id', authenticateToken, FathersController.delete);
router.patch('/admin/:id/toggle-active', authenticateToken, FathersController.toggleActive);
router.patch('/admin/:id/display-order', authenticateToken, FathersController.updateDisplayOrder);

module.exports = router;