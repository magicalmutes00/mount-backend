const LivestreamModel = require('../models/livestreamModel');

class LivestreamController {
  // Get current active livestream (public)
  static async getActiveLivestream(req, res) {
    try {
      const activeStream = await LivestreamModel.getActive();
      
      res.json({
        success: true,
        data: activeStream
      });
    } catch (error) {
      console.error('Get active livestream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active livestream'
      });
    }
  }

  // Get upcoming livestreams (public)
  static async getUpcomingLivestreams(req, res) {
    try {
      const upcomingStreams = await LivestreamModel.getUpcoming();
      
      res.json({
        success: true,
        data: upcomingStreams
      });
    } catch (error) {
      console.error('Get upcoming livestreams error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get upcoming livestreams'
      });
    }
  }

  // Get all livestreams (admin)
  static async getAllLivestreams(req, res) {
    try {
      const allStreams = await LivestreamModel.getAll();
      
      res.json({
        success: true,
        data: allStreams
      });
    } catch (error) {
      console.error('Get all livestreams error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get livestreams'
      });
    }
  }

  // Get livestream by ID (admin)
  static async getLivestreamById(req, res) {
    try {
      const { id } = req.params;
      const livestream = await LivestreamModel.getById(id);
      
      if (!livestream) {
        return res.status(404).json({
          success: false,
          message: 'Livestream not found'
        });
      }

      res.json({
        success: true,
        data: livestream
      });
    } catch (error) {
      console.error('Get livestream by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get livestream'
      });
    }
  }

  // Create new livestream (admin)
  static async createLivestream(req, res) {
    try {
      const {
        title,
        description,
        stream_url,
        thumbnail_url,
        is_scheduled,
        scheduled_at,
        stream_platform
      } = req.body;

      // Validate required fields
      if (!title || !stream_url) {
        return res.status(400).json({
          success: false,
          message: 'Title and stream URL are required'
        });
      }

      const livestreamData = {
        title,
        description,
        stream_url,
        thumbnail_url,
        is_scheduled: is_scheduled || false,
        scheduled_at: scheduled_at || null,
        stream_platform: stream_platform || 'youtube'
      };

      const newLivestream = await LivestreamModel.create(livestreamData);

      res.status(201).json({
        success: true,
        message: 'Livestream created successfully',
        data: newLivestream
      });
    } catch (error) {
      console.error('Create livestream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create livestream'
      });
    }
  }

  // Update livestream (admin)
  static async updateLivestream(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedLivestream = await LivestreamModel.update(id, updateData);

      if (!updatedLivestream) {
        return res.status(404).json({
          success: false,
          message: 'Livestream not found'
        });
      }

      res.json({
        success: true,
        message: 'Livestream updated successfully',
        data: updatedLivestream
      });
    } catch (error) {
      console.error('Update livestream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update livestream'
      });
    }
  }

  // Start livestream (admin)
  static async startLivestream(req, res) {
    try {
      const { id } = req.params;

      // End any currently active streams first
      const activeStream = await LivestreamModel.getActive();
      if (activeStream && activeStream.id !== parseInt(id)) {
        await LivestreamModel.end(activeStream.id);
      }

      const startedLivestream = await LivestreamModel.start(id);

      if (!startedLivestream) {
        return res.status(404).json({
          success: false,
          message: 'Livestream not found'
        });
      }

      res.json({
        success: true,
        message: 'Livestream started successfully',
        data: startedLivestream
      });
    } catch (error) {
      console.error('Start livestream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start livestream'
      });
    }
  }

  // End livestream (admin)
  static async endLivestream(req, res) {
    try {
      const { id } = req.params;

      const endedLivestream = await LivestreamModel.end(id);

      if (!endedLivestream) {
        return res.status(404).json({
          success: false,
          message: 'Livestream not found'
        });
      }

      res.json({
        success: true,
        message: 'Livestream ended successfully',
        data: endedLivestream
      });
    } catch (error) {
      console.error('End livestream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end livestream'
      });
    }
  }

  // Delete livestream (admin)
  static async deleteLivestream(req, res) {
    try {
      const { id } = req.params;

      const deletedLivestream = await LivestreamModel.delete(id);

      if (!deletedLivestream) {
        return res.status(404).json({
          success: false,
          message: 'Livestream not found'
        });
      }

      res.json({
        success: true,
        message: 'Livestream deleted successfully'
      });
    } catch (error) {
      console.error('Delete livestream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete livestream'
      });
    }
  }
}

module.exports = LivestreamController;