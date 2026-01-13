const TestimonyModel = require('../models/testimonyModel');

// Create testimony
exports.createTestimony = async (req, res) => {
  try {
    const { name, testimony } = req.body;

    if (!name || !testimony) {
      return res.status(400).json({
        success: false,
        message: 'Name and testimony are required'
      });
    }

    const newTestimony = await TestimonyModel.create({ name, testimony });

    res.status(201).json({
      success: true,
      message: 'Testimony submitted successfully',
      data: newTestimony
    });
  } catch (error) {
    console.error('Create testimony error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit testimony'
    });
  }
};

// Get approved testimonies
exports.getApprovedTestimonies = async (req, res) => {
  try {
    const testimonies = await TestimonyModel.getApproved();
    
    res.json({
      success: true,
      data: testimonies
    });
  } catch (error) {
    console.error('Get approved testimonies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get testimonies'
    });
  }
};

// Get all testimonies (admin)
exports.getAllTestimonies = async (req, res) => {
  try {
    const testimonies = await TestimonyModel.getAll();
    
    res.json({
      success: true,
      data: testimonies
    });
  } catch (error) {
    console.error('Get all testimonies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get testimonies'
    });
  }
};

// Get pending testimonies
exports.getPendingTestimonies = async (req, res) => {
  try {
    const testimonies = await TestimonyModel.getPending();
    
    res.json({
      success: true,
      data: testimonies
    });
  } catch (error) {
    console.error('Get pending testimonies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending testimonies'
    });
  }
};

// Approve / Reject testimony
exports.updateTestimonyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    const updatedTestimony = await TestimonyModel.updateStatus(id, status);

    if (!updatedTestimony) {
      return res.status(404).json({
        success: false,
        message: 'Testimony not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimony status updated successfully',
      data: updatedTestimony
    });
  } catch (error) {
    console.error('Update testimony status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimony status'
    });
  }
};

// Delete testimony
exports.deleteTestimony = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTestimony = await TestimonyModel.delete(id);

    if (!deletedTestimony) {
      return res.status(404).json({
        success: false,
        message: 'Testimony not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimony deleted successfully',
      data: deletedTestimony
    });
  } catch (error) {
    console.error('Delete testimony error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimony'
    });
  }
};
