const db = require('../db/db');

class AnnouncementModel {
  // Create announcements table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        announcement_type VARCHAR(50) DEFAULT 'general',
        priority VARCHAR(20) DEFAULT 'normal',
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP NULL,
        created_by VARCHAR(100) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
      CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(announcement_type);
      CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
      CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
      CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
    `;

    try {
      await db.query(query);
      console.log('Announcements table and indexes created or already exist');
    } catch (error) {
      console.error('Error creating announcements table:', error);
      throw error;
    }
  }

  // Get active announcements (public)
  static async getActive() {
    try {
      const query = `
        SELECT * FROM announcements 
        WHERE is_active = true 
        AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
        AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
        ORDER BY 
          CASE priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
            ELSE 5 
          END,
          created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting active announcements:', error);
      throw error;
    }
  }

  // Get all announcements (admin)
  static async getAll() {
    try {
      const query = `
        SELECT * FROM announcements 
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all announcements:', error);
      throw error;
    }
  }

  // Create new announcement
  static async create(announcementData) {
    try {
      const {
        title,
        content,
        announcement_type,
        priority,
        is_active,
        start_date,
        end_date,
        created_by
      } = announcementData;

      const query = `
        INSERT INTO announcements (
          title, content, announcement_type, priority, is_active, 
          start_date, end_date, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `;

      const values = [
        title,
        content,
        announcement_type || 'general',
        priority || 'normal',
        is_active !== undefined ? is_active : true,
        start_date || null,
        end_date || null,
        created_by || 'admin'
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  // Update announcement
  static async update(id, announcementData) {
    try {
      const {
        title,
        content,
        announcement_type,
        priority,
        is_active,
        start_date,
        end_date
      } = announcementData;

      const query = `
        UPDATE announcements SET 
          title = $1,
          content = $2,
          announcement_type = $3,
          priority = $4,
          is_active = $5,
          start_date = $6,
          end_date = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const values = [
        title,
        content,
        announcement_type,
        priority,
        is_active,
        start_date,
        end_date,
        id
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  // Delete announcement
  static async delete(id) {
    try {
      const query = 'DELETE FROM announcements WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleActive(id) {
    try {
      const query = `
        UPDATE announcements SET 
          is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error toggling announcement active status:', error);
      throw error;
    }
  }
}

module.exports = AnnouncementModel;