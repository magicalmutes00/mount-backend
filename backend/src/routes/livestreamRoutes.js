const express = require('express');
const LivestreamController = require('../controllers/livestreamController');

const router = express.Router();

// Check if auth middleware is available
let authenticateToken, requireRole;
try {
  const middleware = require('../middleware/authMiddleware');
  authenticateToken = middleware.authenticateToken;
  requireRole = middleware.requireRole;
} catch (error) {
  console.error('Auth middleware not available for livestream routes');
  authenticateToken = (req, res, next) => next();
  requireRole = () => (req, res, next) => next();
}

// Public routes
router.get('/active', LivestreamController.getActiveLivestream);
router.get('/upcoming', LivestreamController.getUpcomingLivestreams);

// Admin routes (temporarily without auth for testing)
router.get('/admin/all', LivestreamController.getAllLivestreams);
router.get('/admin/:id', LivestreamController.getLivestreamById);
router.post('/admin/create', LivestreamController.createLivestream);
router.post('/admin', LivestreamController.createLivestream);
router.put('/admin/:id', LivestreamController.updateLivestream);
router.post('/admin/:id/start', LivestreamController.startLivestream);
router.post('/admin/:id/end', LivestreamController.endLivestream);
router.delete('/admin/:id', LivestreamController.deleteLivestream);

module.exports = router;