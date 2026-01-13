const ManagementModel = require('../models/managementModel');
const fs = require('fs').promises;
const path = require('path');

class ManagementController {
  // Get all active management team members (public)
  static async getAllActive(req, res) {
    try {
      const members = await ManagementModel.getAllActive();
      
      res.json({
        success: true,
        message: 'Management team members retrieved successfully',
        data: members
      });
    } catch (error) {
      console.error('Error getting active management team members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve management team members'
      });
    }
  }

  // Get featured management team members (public) - returns first N active members
  static async getFeatured(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const members = await ManagementModel.getAllActive();
      
      // Return first N active members as "featured"
      const featuredMembers = members.slice(0, limit);
      
      res.json({
        success: true,
        message: 'Featured management team members retrieved successfully',
        data: featuredMembers
      });
    } catch (error) {
      console.error('Error getting featured management team members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve featured management team members'
      });
    }
  }

  // Get all management team members (admin)
  static async getAll(req, res) {
    try {
      const members = await ManagementModel.getAll();
      
      res.json({
        success: true,
        message: 'All management team members retrieved successfully',
        data: members
      });
    } catch (error) {
      console.error('Error getting all management team members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve management team members'
      });
    }
  }

  // Get management team member by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid member ID is required'
        });
      }

      const member = await ManagementModel.getById(id);
      
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Management team member not found'
        });
      }

      res.json({
        success: true,
        message: 'Management team member retrieved successfully',
        data: member
      });
    } catch (error) {
      console.error('Error getting management team member by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve management team member'
      });
    }
  }

  // Create new management team member
  static async create(req, res) {
    try {
      const {
        name,
        position,
        description,
        phone,
        email,
        display_order,
        is_active,
        image_data
      } = req.body;

      // Validate required fields
      if (!name || !position) {
        return res.status(400).json({
          success: false,
          message: 'Name and position are required'
        });
      }

      let imageUrl = null;
      let imageName = null;
      let imageSize = null;
      let imageType = null;

      // Handle image upload if provided
      if (image_data) {
        try {
          const imageResult = await ManagementController.saveImage(image_data);
          imageUrl = imageResult.url;
          imageName = imageResult.name;
          imageSize = imageResult.size;
          imageType = imageResult.type;
        } catch (imageError) {
          console.error('Error saving image:', imageError);
          return res.status(400).json({
            success: false,
            message: 'Failed to save image: ' + imageError.message
          });
        }
      }

      const memberData = {
        name: name.trim(),
        position: position.trim(),
        description: description?.trim() || null,
        image_url: imageUrl,
        image_name: imageName,
        image_size: imageSize,
        image_type: imageType,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        display_order: parseInt(display_order) || 0,
        is_active: is_active !== false
      };

      const newMember = await ManagementModel.create(memberData);

      res.status(201).json({
        success: true,
        message: 'Management team member created successfully',
        data: newMember
      });
    } catch (error) {
      console.error('Error creating management team member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create management team member'
      });
    }
  }

  // Update management team member
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        position,
        description,
        phone,
        email,
        display_order,
        is_active,
        image_data,
        remove_image
      } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid member ID is required'
        });
      }

      // Validate required fields
      if (!name || !position) {
        return res.status(400).json({
          success: false,
          message: 'Name and position are required'
        });
      }

      // Get existing member
      const existingMember = await ManagementModel.getById(id);
      if (!existingMember) {
        return res.status(404).json({
          success: false,
          message: 'Management team member not found'
        });
      }

      let imageUrl = existingMember.image_url;
      let imageName = existingMember.image_name;
      let imageSize = existingMember.image_size;
      let imageType = existingMember.image_type;

      // Handle image removal
      if (remove_image === true) {
        if (existingMember.image_url) {
          await ManagementController.deleteImage(existingMember.image_name);
        }
        imageUrl = null;
        imageName = null;
        imageSize = null;
        imageType = null;
      }
      // Handle new image upload
      else if (image_data) {
        try {
          // Delete old image if exists
          if (existingMember.image_url) {
            await ManagementController.deleteImage(existingMember.image_name);
          }

          const imageResult = await ManagementController.saveImage(image_data);
          imageUrl = imageResult.url;
          imageName = imageResult.name;
          imageSize = imageResult.size;
          imageType = imageResult.type;
        } catch (imageError) {
          console.error('Error saving image:', imageError);
          return res.status(400).json({
            success: false,
            message: 'Failed to save image: ' + imageError.message
          });
        }
      }

      const memberData = {
        name: name.trim(),
        position: position.trim(),
        description: description?.trim() || null,
        image_url: imageUrl,
        image_name: imageName,
        image_size: imageSize,
        image_type: imageType,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        display_order: parseInt(display_order) || 0,
        is_active: is_active !== false
      };

      const updatedMember = await ManagementModel.update(id, memberData);

      res.json({
        success: true,
        message: 'Management team member updated successfully',
        data: updatedMember
      });
    } catch (error) {
      console.error('Error updating management team member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update management team member'
      });
    }
  }

  // Delete management team member
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid member ID is required'
        });
      }

      // Get existing member to delete image
      const existingMember = await ManagementModel.getById(id);
      if (!existingMember) {
        return res.status(404).json({
          success: false,
          message: 'Management team member not found'
        });
      }

      // Delete image if exists
      if (existingMember.image_url) {
        await ManagementController.deleteImage(existingMember.image_name);
      }

      const deletedMember = await ManagementModel.delete(id);

      res.json({
        success: true,
        message: 'Management team member deleted successfully',
        data: deletedMember
      });
    } catch (error) {
      console.error('Error deleting management team member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete management team member'
      });
    }
  }

  // Toggle active status
  static async toggleActive(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid member ID is required'
        });
      }

      const updatedMember = await ManagementModel.toggleActive(id);

      if (!updatedMember) {
        return res.status(404).json({
          success: false,
          message: 'Management team member not found'
        });
      }

      res.json({
        success: true,
        message: `Management team member ${updatedMember.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedMember
      });
    } catch (error) {
      console.error('Error toggling management team member active status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle management team member status'
      });
    }
  }

  // Update display order
  static async updateDisplayOrder(req, res) {
    try {
      const { id } = req.params;
      const { display_order } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid member ID is required'
        });
      }

      if (display_order === undefined || isNaN(display_order)) {
        return res.status(400).json({
          success: false,
          message: 'Valid display order is required'
        });
      }

      const updatedMember = await ManagementModel.updateDisplayOrder(id, parseInt(display_order));

      if (!updatedMember) {
        return res.status(404).json({
          success: false,
          message: 'Management team member not found'
        });
      }

      res.json({
        success: true,
        message: 'Display order updated successfully',
        data: updatedMember
      });
    } catch (error) {
      console.error('Error updating management team member display order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update display order'
      });
    }
  }

  // Get statistics
  static async getStats(req, res) {
    try {
      const stats = await ManagementModel.getStats();
      
      res.json({
        success: true,
        message: 'Management team statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting management team statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics'
      });
    }
  }

  // Helper method to save image
  static async saveImage(imageData) {
    try {
      // Validate image data
      if (!imageData || !imageData.startsWith('data:image/')) {
        throw new Error('Invalid image data format');
      }

      // Extract image info
      const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image format');
      }

      const imageType = matches[1].toLowerCase();
      const base64Data = matches[2];

      // Validate image type
      const allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
      if (!allowedTypes.includes(imageType)) {
        throw new Error(`Unsupported image type: ${imageType}. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Validate image size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageBuffer.length > maxSize) {
        throw new Error('Image size exceeds 10MB limit');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `management_${timestamp}_${randomString}.${imageType}`;

      // Ensure upload directory exists
      const uploadDir = path.join(__dirname, '../../uploads/management');
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Save file
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, imageBuffer);

      return {
        url: `/uploads/management/${fileName}`,
        name: fileName,
        size: imageBuffer.length,
        type: `image/${imageType}`
      };
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  // Helper method to delete image
  static async deleteImage(imageName) {
    try {
      if (!imageName) return;

      const filePath = path.join(__dirname, '../../uploads/management', imageName);
      
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`Deleted image: ${imageName}`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting image ${imageName}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in deleteImage:', error);
    }
  }
}

module.exports = ManagementController;