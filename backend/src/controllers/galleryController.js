const GalleryModel = require('../models/galleryModel');
const path = require('path');
const fs = require('fs').promises;

class GalleryController {
  // Get all active gallery items (public)
  static async getPublicGallery(req, res) {
    try {
      const { category, limit } = req.query;
      const items = await GalleryModel.getAllActive(category, limit ? parseInt(limit) : null);
      
      res.json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      console.error('Error getting public gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery items'
      });
    }
  }

  // Get all gallery items (admin)
  static async getAllGallery(req, res) {
    try {
      const { category } = req.query;
      const items = await GalleryModel.getAll(category);
      
      res.json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      console.error('Error getting all gallery items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery items'
      });
    }
  }

  // Create new gallery item
  static async createGalleryItem(req, res) {
    try {
      const {
        title,
        description,
        image_url,
        image_name,
        image_size,
        image_type,
        file_type,
        category,
        is_featured,
        display_order
      } = req.body;

      // Validation
      if (!title || !image_url || !image_name) {
        return res.status(400).json({
          success: false,
          message: 'Title, image URL, and image name are required'
        });
      }

      const galleryData = {
        title,
        description,
        image_url,
        image_name,
        image_size,
        image_type,
        file_type: file_type || 'image', // Default to 'image' if not provided
        category: category || 'general',
        is_featured: is_featured === true || is_featured === 'true',
        display_order: display_order ? parseInt(display_order) : 0,
        uploaded_by: req.admin ? req.admin.username : 'admin'
      };

      const newItem = await GalleryModel.create(galleryData);

      res.status(201).json({
        success: true,
        message: 'Gallery item created successfully',
        data: newItem
      });
    } catch (error) {
      console.error('Error creating gallery item:', error);
      console.error('Error details:', error.message);
      res.status(500).json({
        success: false,
        message: `Failed to create gallery item: ${error.message}`
      });
    }
  }

  // Update gallery item
  static async updateGalleryItem(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        category,
        is_featured,
        is_active,
        display_order
      } = req.body;

      // Validation
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      const galleryData = {
        title,
        description,
        category,
        is_featured: is_featured === true || is_featured === 'true',
        is_active: is_active === true || is_active === 'true',
        display_order: display_order ? parseInt(display_order) : 0
      };

      const updatedItem = await GalleryModel.update(id, galleryData);

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        });
      }

      res.json({
        success: true,
        message: 'Gallery item updated successfully',
        data: updatedItem
      });
    } catch (error) {
      console.error('Error updating gallery item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update gallery item'
      });
    }
  }

  // Delete gallery item
  static async deleteGalleryItem(req, res) {
    try {
      const { id } = req.params;
      console.log('Attempting to delete gallery item with ID:', id);
      
      const deletedItem = await GalleryModel.delete(id);
      console.log('Delete result:', deletedItem);

      if (!deletedItem) {
        console.log('Gallery item not found for ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        });
      }

      // Optionally delete the image file from server
      // This would depend on your file storage setup
      
      console.log('Gallery item deleted successfully:', deletedItem.id);
      res.json({
        success: true,
        message: 'Gallery item deleted successfully',
        data: deletedItem
      });
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete gallery item'
      });
    }
  }

  // Upload image (for drag & drop and copy-paste)
  static async uploadImage(req, res) {
    try {
      const { image_data, image_name, image_type, image_size } = req.body;
      
      if (!image_data || !image_name) {
        return res.status(400).json({
          success: false,
          message: 'Image data and name are required'
        });
      }

      // Validate image data format
      if (!image_data.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image data format'
        });
      }

      // Extract base64 data
      const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'Image size too large. Maximum size is 10MB.'
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(image_name) || '.jpg';
      const uniqueName = `gallery_${timestamp}_${Math.random().toString(36).substr(2, 9)}${extension}`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads/gallery');
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        console.log('Uploads directory already exists or created');
      }

      // Save file to disk
      const filePath = path.join(uploadsDir, uniqueName);
      try {
        await fs.writeFile(filePath, buffer);
      } catch (error) {
        console.error('Error saving file:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to save image file'
        });
      }

      // Return the URL that can be accessed by the frontend
      const image_url = `/uploads/gallery/${uniqueName}`;

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          image_url,
          image_name: uniqueName,
          original_name: image_name,
          image_type: image_type || 'image/jpeg',
          image_size: buffer.length
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
  }

  // Get gallery statistics (admin)
  static async getGalleryStats(req, res) {
    try {
      const stats = await GalleryModel.getStats();
      const categories = await GalleryModel.getCategoriesWithCounts();
      
      // Convert categories array to object
      const categoriesObj = {};
      categories.forEach(cat => {
        categoriesObj[cat.category] = parseInt(cat.count);
      });

      res.json({
        success: true,
        data: {
          ...stats,
          total: parseInt(stats.total),
          active: parseInt(stats.active),
          featured: parseInt(stats.featured),
          inactive: parseInt(stats.inactive),
          categories: categoriesObj
        }
      });
    } catch (error) {
      console.error('Error getting gallery stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery statistics'
      });
    }
  }

  // Toggle active status
  static async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const updatedItem = await GalleryModel.toggleActive(id);

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        });
      }

      res.json({
        success: true,
        message: `Gallery item ${updatedItem.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedItem
      });
    } catch (error) {
      console.error('Error toggling gallery item status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle gallery item status'
      });
    }
  }

  // Toggle featured status
  static async toggleFeatured(req, res) {
    try {
      const { id } = req.params;
      const updatedItem = await GalleryModel.toggleFeatured(id);

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        });
      }

      res.json({
        success: true,
        message: `Gallery item ${updatedItem.is_featured ? 'marked as featured' : 'removed from featured'} successfully`,
        data: updatedItem
      });
    } catch (error) {
      console.error('Error toggling gallery item featured status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle gallery item featured status'
      });
    }
  }

  // Debug endpoint to test gallery creation
  static async debugCreate(req, res) {
    try {
      console.log('Debug: Testing gallery creation...');
      console.log('Request body:', req.body);
      
      // Test with minimal data
      const testData = {
        title: 'Debug Test Image',
        description: 'Test description',
        image_url: 'https://via.placeholder.com/400x300',
        image_name: 'debug_test.jpg',
        image_type: 'image/jpeg',
        file_type: 'image',
        category: 'general',
        is_featured: false,
        display_order: 0,
        uploaded_by: 'debug'
      };
      
      console.log('Creating with data:', testData);
      const newItem = await GalleryModel.create(testData);
      console.log('Created item:', newItem);
      
      res.json({
        success: true,
        message: 'Debug gallery item created successfully',
        data: newItem
      });
    } catch (error) {
      console.error('Debug creation error:', error);
      res.status(500).json({
        success: false,
        message: `Debug creation failed: ${error.message}`,
        error: error.toString()
      });
    }
  }
}

module.exports = GalleryController;