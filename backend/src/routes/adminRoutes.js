const express = require('express');
const router = express.Router();

// Check if required dependencies are available
let AdminController, authenticateToken, requireRole;

try {
  AdminController = require('../controllers/adminController');
  const middleware = require('../middleware/authMiddleware');
  authenticateToken = middleware.authenticateToken;
  requireRole = middleware.requireRole;
} catch (error) {
  console.error('Admin dependencies not available:', error.message);
  
  // Fallback handlers when dependencies are missing
  const dependencyError = (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Admin system is not available. Please install required dependencies: bcryptjs, jsonwebtoken'
    });
  };
  
  AdminController = {
    login: dependencyError,
    verifyToken: dependencyError,
    logout: dependencyError,
    changePassword: dependencyError
  };
  
  authenticateToken = dependencyError;
  requireRole = () => dependencyError;
}

// Public routes (no authentication required)
router.post('/login', AdminController.login);

// Protected routes (authentication required)
router.get('/verify-token', authenticateToken, AdminController.verifyToken);
router.post('/logout', authenticateToken, AdminController.logout);
router.post('/change-password', authenticateToken, AdminController.changePassword);

// Super admin only routes
router.get('/profile', authenticateToken, requireRole(['admin', 'super_admin']), (req, res) => {
  res.json({
    success: true,
    data: {
      admin: req.admin
    }
  });
});

module.exports = router;