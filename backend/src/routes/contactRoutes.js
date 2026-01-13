const express = require('express');
const ContactModel = require('../models/contactModel');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get contact information (public endpoint)
router.get('/', async (req, res) => {
  try {
    const contactInfo = await ContactModel.getContactInfo();
    
    if (!contactInfo) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    res.json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information'
    });
  }
});

// Update contact information (admin only)
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      contact_phone,
      contact_email,
      contact_address,
      map_lat,
      map_lng,
      office_hours,
      mass_timings,
      social_media,
      transportation_info
    } = req.body;

    // Validate required fields
    if (!contact_phone && !contact_email && !contact_address) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update'
      });
    }

    // Validate email format if provided
    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate phone format if provided
    if (contact_phone && !/^\+?[\d\s\-\(\)]+$/.test(contact_phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Validate coordinates if provided
    if (map_lat && (map_lat < -90 || map_lat > 90)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude value'
      });
    }

    if (map_lng && (map_lng < -180 || map_lng > 180)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude value'
      });
    }

    const updatedContact = await ContactModel.updateContactInfo(req.body);

    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: updatedContact
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information'
    });
  }
});

// Get contact history (admin only)
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const history = await ContactModel.getContactHistory();

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching contact history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact history'
    });
  }
});

// Get contact statistics (admin only)
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const contactInfo = await ContactModel.getContactInfo();
    
    if (!contactInfo) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    const stats = {
      last_updated: contactInfo.updated_at,
      has_phone: !!contactInfo.contact_phone,
      has_email: !!contactInfo.contact_email,
      has_address: !!contactInfo.contact_address,
      has_coordinates: !!(contactInfo.map_lat && contactInfo.map_lng),
      has_office_hours: !!(contactInfo.office_hours && Object.keys(contactInfo.office_hours).length > 0),
      has_mass_timings: !!(contactInfo.mass_timings && Object.keys(contactInfo.mass_timings).length > 0),
      has_social_media: !!(contactInfo.social_media && Object.keys(contactInfo.social_media).length > 0),
      has_transportation_info: !!(contactInfo.transportation_info && Object.keys(contactInfo.transportation_info).length > 0)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});

module.exports = router;