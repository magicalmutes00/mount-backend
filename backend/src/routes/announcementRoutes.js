const express = require('express');
const AnnouncementController = require('../controllers/announcementController');

const router = express.Router();

// Check if authentication middleware is available
let authenticateToken;
try {
  const middleware = require('../middleware/authMiddleware');
  authenticateToken = middleware.authenticateToken;
} catch (error) {
  console.error('Auth middleware not available for announcement routes');
  authenticateToken = (req, res, next) => {
    console.warn('Announcement admin routes accessed without authentication');
    next();
  };
}

// Public routes (no authentication required)
router.get('/public', AnnouncementController.getActiveAnnouncements);

// Admin routes (authentication required)
router.get('/admin', authenticateToken, AnnouncementController.getAllAnnouncements);
router.post('/admin', authenticateToken, AnnouncementController.createAnnouncement);
router.put('/admin/:id', authenticateToken, AnnouncementController.updateAnnouncement);
router.delete('/admin/:id', authenticateToken, AnnouncementController.deleteAnnouncement);
router.patch('/admin/:id/toggle-active', authenticateToken, AnnouncementController.toggleActive);

module.exports = router;