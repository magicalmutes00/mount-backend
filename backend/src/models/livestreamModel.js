const db = require('../db/db');

class LivestreamModel {
  // Create livestream table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS livestreams (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        stream_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        stream_platform VARCHAR(50) DEFAULT 'youtube',
        is_active BOOLEAN DEFAULT false,
        is_scheduled BOOLEAN DEFAULT false,
        scheduled_at TIMESTAMP,
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        viewer_count INTEGER DEFAULT 0,
        max_viewers INTEGER DEFAULT 0,
        notification_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await db.query(query);
      console.log('Livestream table created or already exists');
    } catch (error) {
      console.error('Error creating livestream table:', error);
      throw error;
    }
  }

  // Create a new livestream
  static async create(livestreamData) {
    const {
      title,
      description,
      stream_url,
      thumbnail_url,
      stream_platform = 'youtube',
      is_scheduled,
      scheduled_at
    } = livestreamData;

    const query = `
      INSERT INTO livestreams (
        title, description, stream_url, thumbnail_url, 
        stream_platform, is_scheduled, scheduled_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    try {
      const result = await db.query(query, [
        title, description, stream_url, thumbnail_url,
        stream_platform, is_scheduled, scheduled_at
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating livestream:', error);
      throw error;
    }
  }

  // Get all livestreams (admin)
  static async getAll() {
    const query = 'SELECT * FROM livestreams ORDER BY created_at DESC';
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all livestreams:', error);
      throw error;
    }
  }

  // Get upcoming scheduled livestreams
  static async getUpcoming() {
    const query = `
      SELECT * FROM livestreams 
      WHERE is_scheduled = true AND scheduled_at > NOW()
      ORDER BY scheduled_at ASC
    `;
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting upcoming livestreams:', error);
      throw error;
    }
  }

  // Get active livestream
  static async getActive() {
    const query = `
      SELECT * FROM livestreams 
      WHERE is_active = true 
      ORDER BY started_at DESC LIMIT 1
    `;
    
    try {
      const result = await db.query(query);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting active livestream:', error);
      throw error;
    }
  }

  // Get livestream by ID
  static async getById(id) {
    const query = 'SELECT * FROM livestreams WHERE id = $1';
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting livestream by ID:', error);
      throw error;
    }
  }

  // Update livestream
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE livestreams 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating livestream:', error);
      throw error;
    }
  }

  // Start livestream
  static async start(id) {
    const query = `
      UPDATE livestreams 
      SET is_active = true, started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error starting livestream:', error);
      throw error;
    }
  }

  // End livestream
  static async end(id) {
    const query = `
      UPDATE livestreams 
      SET is_active = false, ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error ending livestream:', error);
      throw error;
    }
  }

  // Update viewer count
  static async updateViewerCount(id, count) {
    const query = `
      UPDATE livestreams 
      SET viewer_count = $1, max_viewers = GREATEST(max_viewers, $1), updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await db.query(query, [count, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating viewer count:', error);
      throw error;
    }
  }

  // Mark notification as sent
  static async markNotificationSent(id) {
    const query = `
      UPDATE livestreams 
      SET notification_sent = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking notification as sent:', error);
      throw error;
    }
  }

  // Delete livestream
  static async delete(id) {
    const query = 'DELETE FROM livestreams WHERE id = $1 RETURNING *';
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting livestream:', error);
      throw error;
    }
  }

  // Get recent livestreams (for public view)
  static async getRecent(limit = 5) {
    const query = `
      SELECT * FROM livestreams 
      WHERE ended_at IS NOT NULL
      ORDER BY ended_at DESC 
      LIMIT $1
    `;
    
    try {
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting recent livestreams:', error);
      throw error;
    }
  }
}

module.exports = LivestreamModel;