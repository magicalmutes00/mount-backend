const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

class AdminController {
  // Login admin
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find admin by username
      const admin = await AdminModel.findByUsername(username);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isPasswordValid = await AdminModel.verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      await AdminModel.updateLastLogin(admin.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          username: admin.username, 
          role: admin.role 
        },
        process.env.JWT_SECRET || 'shrine_secret_key_2024',
        { expiresIn: '24h' }
      );

      // Return success response (don't send password)
      const { password: _, ...adminData } = admin;
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          admin: adminData,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Verify token
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shrine_secret_key_2024');
      
      // Find admin to ensure they still exist and are active
      const admin = await AdminModel.findByUsername(decoded.username);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      const { password: _, ...adminData } = admin;
      
      res.json({
        success: true,
        data: {
          admin: adminData
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.admin.id;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        });
      }

      // Find admin
      const admin = await AdminModel.findByUsername(req.admin.username);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await AdminModel.verifyPassword(currentPassword, admin.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await AdminModel.updatePassword(adminId, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Logout (client-side token removal, but we can log it)
  static async logout(req, res) {
    try {
      // In a more sophisticated system, you might want to blacklist the token
      // For now, we'll just return success as the client will remove the token
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AdminController;