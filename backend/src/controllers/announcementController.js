const AnnouncementModel = require('../models/announcementModel');

class AnnouncementController {
  // Get active announcements (public)
  static async getActiveAnnouncements(req, res) {
    try {
      const announcements = await AnnouncementModel.getActive();
      
      res.json({
        success: true,
        data: announcements,
        count: announcements.length
      });
    } catch (error) {
      console.error('Error getting active announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements'
      });
    }
  }

  // Get all announcements (admin)
  static async getAllAnnouncements(req, res) {
    try {
      const announcements = await AnnouncementModel.getAll();
      
      res.json({
        success: true,
        data: announcements,
        count: announcements.length
      });
    } catch (error) {
      console.error('Error getting all announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements'
      });
    }
  }

  // Create new announcement
  static async createAnnouncement(req, res) {
    try {
      const {
        title,
        content,
        announcement_type,
        priority,
        is_active,
        start_date,
        end_date
      } = req.body;

      // Validation
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const announcementData = {
        title,
        content,
        announcement_type: announcement_type || 'general',
        priority: priority || 'normal',
        is_active: is_active !== undefined ? is_active : true,
        start_date: start_date || null,
        end_date: end_date || null,
        created_by: req.admin ? req.admin.username : 'admin'
      };

      const newAnnouncement = await AnnouncementModel.create(announcementData);

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: newAnnouncement
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create announcement'
      });
    }
  }

  // Update announcement
  static async updateAnnouncement(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        announcement_type,
        priority,
        is_active,
        start_date,
        end_date
      } = req.body;

      // Validation
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const announcementData = {
        title,
        content,
        announcement_type,
        priority,
        is_active,
        start_date,
        end_date
      };

      const updatedAnnouncement = await AnnouncementModel.update(id, announcementData);

      if (!updatedAnnouncement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: updatedAnnouncement
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update announcement'
      });
    }
  }

  // Delete announcement
  static async deleteAnnouncement(req, res) {
    try {
      const { id } = req.params;
      const deletedAnnouncement = await AnnouncementModel.delete(id);

      if (!deletedAnnouncement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      res.json({
        success: true,
        message: 'Announcement deleted successfully',
        data: deletedAnnouncement
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete announcement'
      });
    }
  }

  // Toggle active status
  static async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const updatedAnnouncement = await AnnouncementModel.toggleActive(id);

      if (!updatedAnnouncement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      res.json({
        success: true,
        message: `Announcement ${updatedAnnouncement.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedAnnouncement
      });
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle announcement status'
      });
    }
  }
}

module.exports = AnnouncementController;