const express = require('express');
const GalleryController = require('../controllers/galleryController');

const router = express.Router();

// Check if authentication middleware is available
let authenticateToken;
try {
  const middleware = require('../middleware/authMiddleware');
  authenticateToken = middleware.authenticateToken;
} catch (error) {
  console.error('Auth middleware not available for gallery routes');
  authenticateToken = (req, res, next) => {
    console.warn('Gallery admin routes accessed without authentication');
    next();
  };
}

// Public routes (no authentication required)
router.get('/public', GalleryController.getPublicGallery);

// Admin routes (authentication required)
router.get('/admin', authenticateToken, GalleryController.getAllGallery);
router.post('/admin', GalleryController.createGalleryItem); // Temporarily remove auth for testing
router.put('/admin/:id', authenticateToken, GalleryController.updateGalleryItem);
router.delete('/admin/:id', GalleryController.deleteGalleryItem); // Temporarily remove auth for testing
router.post('/admin/upload', GalleryController.uploadImage); // Temporarily remove auth for testing
router.get('/admin/stats', authenticateToken, GalleryController.getGalleryStats);
router.patch('/admin/:id/toggle-active', authenticateToken, GalleryController.toggleActive);
router.patch('/admin/:id/toggle-featured', authenticateToken, GalleryController.toggleFeatured);

// Debug route (no auth for testing)
router.post('/debug/create', GalleryController.debugCreate);

module.exports = router;