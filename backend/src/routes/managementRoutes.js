const express = require('express');
const router = express.Router();
const ManagementController = require('../controllers/managementController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/active', ManagementController.getAllActive);
router.get('/featured', ManagementController.getFeatured);

// Protected routes (authentication required)
router.get('/admin/all', authenticateToken, ManagementController.getAll);
router.get('/admin/stats', authenticateToken, ManagementController.getStats);
router.get('/admin/:id', authenticateToken, ManagementController.getById);
router.post('/admin', authenticateToken, ManagementController.create);
router.put('/admin/:id', authenticateToken, ManagementController.update);
router.delete('/admin/:id', authenticateToken, ManagementController.delete);
router.patch('/admin/:id/toggle-active', authenticateToken, ManagementController.toggleActive);
router.patch('/admin/:id/display-order', authenticateToken, ManagementController.updateDisplayOrder);

module.exports = router;