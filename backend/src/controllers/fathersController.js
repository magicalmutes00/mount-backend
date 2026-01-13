const FathersModel = require('../models/fathersModel');

class FathersController {
  // Get all active fathers grouped by category (public endpoint)
  static async getAllActiveByCategory(req, res) {
    try {
      const fathers = await FathersModel.getAllActiveByCategory();
      res.json({
        success: true,
        data: fathers
      });
    } catch (error) {
      console.error('Error getting active fathers by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get fathers data',
        error: error.message
      });
    }
  }

  // Get all fathers (admin endpoint)
  static async getAll(req, res) {
    try {
      const fathers = await FathersModel.getAll();
      res.json({
        success: true,
        data: fathers
      });
    } catch (error) {
      console.error('Error getting all fathers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get fathers data',
        error: error.message
      });
    }
  }

  // Get fathers by category (admin endpoint)
  static async getByCategory(req, res) {
    try {
      const { category } = req.params;
      
      // Validate category
      const validCategories = ['parish_priest', 'assistant_priest', 'son_of_soil', 'deacon'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
        });
      }

      const fathers = await FathersModel.getByCategory(category);
      res.json({
        success: true,
        data: fathers
      });
    } catch (error) {
      console.error('Error getting fathers by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get fathers data',
        error: error.message
      });
    }
  }

  // Get father by ID (admin endpoint)
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid father ID is required'
        });
      }

      const father = await FathersModel.getById(id);
      
      if (!father) {
        return res.status(404).json({
          success: false,
          message: 'Father not found'
        });
      }

      res.json({
        success: true,
        data: father
      });
    } catch (error) {
      console.error('Error getting father by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get father data',
        error: error.message
      });
    }
  }

  // Create new father (admin endpoint)
  static async create(req, res) {
    try {
      const { name, period, category, display_order } = req.body;

      // Validation
      if (!name || !category) {
        return res.status(400).json({
          success: false,
          message: 'Name and category are required'
        });
      }

      const validCategories = ['parish_priest', 'assistant_priest', 'son_of_soil', 'deacon'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
        });
      }

      const fatherData = {
        name: name.trim(),
        period: period ? period.trim() : null,
        category,
        display_order: display_order || 0,
        is_active: true // Always active since we removed deactivate functionality
      };

      const newFather = await FathersModel.create(fatherData);
      
      res.status(201).json({
        success: true,
        message: 'Father created successfully',
        data: newFather
      });
    } catch (error) {
      console.error('Error creating father:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create father',
        error: error.message
      });
    }
  }

  // Update father (admin endpoint)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, period, category, display_order } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid father ID is required'
        });
      }

      // Check if father exists
      const existingFather = await FathersModel.getById(id);
      if (!existingFather) {
        return res.status(404).json({
          success: false,
          message: 'Father not found'
        });
      }

      // Validation
      if (!name || !category) {
        return res.status(400).json({
          success: false,
          message: 'Name and category are required'
        });
      }

      const validCategories = ['parish_priest', 'assistant_priest', 'son_of_soil', 'deacon'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
        });
      }

      const fatherData = {
        name: name.trim(),
        period: period ? period.trim() : null,
        category,
        display_order: display_order || 0,
        is_active: true // Always active since we removed deactivate functionality
      };

      const updatedFather = await FathersModel.update(id, fatherData);
      
      res.json({
        success: true,
        message: 'Father updated successfully',
        data: updatedFather
      });
    } catch (error) {
      console.error('Error updating father:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update father',
        error: error.message
      });
    }
  }

  // Delete father (admin endpoint)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid father ID is required'
        });
      }

      // Check if father exists
      const existingFather = await FathersModel.getById(id);
      if (!existingFather) {
        return res.status(404).json({
          success: false,
          message: 'Father not found'
        });
      }

      const deletedFather = await FathersModel.delete(id);
      
      res.json({
        success: true,
        message: 'Father deleted successfully',
        data: deletedFather
      });
    } catch (error) {
      console.error('Error deleting father:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete father',
        error: error.message
      });
    }
  }

  // Toggle active status (admin endpoint)
  static async toggleActive(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid father ID is required'
        });
      }

      // Check if father exists
      const existingFather = await FathersModel.getById(id);
      if (!existingFather) {
        return res.status(404).json({
          success: false,
          message: 'Father not found'
        });
      }

      const updatedFather = await FathersModel.toggleActive(id);
      
      res.json({
        success: true,
        message: `Father ${updatedFather.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedFather
      });
    } catch (error) {
      console.error('Error toggling father active status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle father active status',
        error: error.message
      });
    }
  }

  // Update display order (admin endpoint)
  static async updateDisplayOrder(req, res) {
    try {
      const { id } = req.params;
      const { display_order } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid father ID is required'
        });
      }

      if (display_order === undefined || isNaN(display_order)) {
        return res.status(400).json({
          success: false,
          message: 'Valid display order is required'
        });
      }

      // Check if father exists
      const existingFather = await FathersModel.getById(id);
      if (!existingFather) {
        return res.status(404).json({
          success: false,
          message: 'Father not found'
        });
      }

      const updatedFather = await FathersModel.updateDisplayOrder(id, display_order);
      
      res.json({
        success: true,
        message: 'Display order updated successfully',
        data: updatedFather
      });
    } catch (error) {
      console.error('Error updating father display order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update display order',
        error: error.message
      });
    }
  }

  // Get statistics (admin endpoint)
  static async getStats(req, res) {
    try {
      const stats = await FathersModel.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting fathers statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      });
    }
  }
}

module.exports = FathersController;