const db = require('../db/db');

class TestimonyModel {
  // Create testimonies table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS testimonies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        testimony TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_testimonies_status ON testimonies(status);
      CREATE INDEX IF NOT EXISTS idx_testimonies_created_at ON testimonies(created_at);
    `;

    try {
      await db.query(query);
      console.log('Testimonies table and indexes created or already exist');
    } catch (error) {
      console.error('Error creating testimonies table:', error);
      throw error;
    }
  }

  // Create new testimony
  static async create(testimonyData) {
    try {
      const { name, testimony } = testimonyData;

      const query = `
        INSERT INTO testimonies (name, testimony, status)
        VALUES ($1, $2, 'pending')
        RETURNING *
      `;

      const result = await db.query(query, [name, testimony]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating testimony:', error);
      throw error;
    }
  }

  // Get approved testimonies
  static async getApproved() {
    try {
      const query = `
        SELECT * FROM testimonies 
        WHERE status = 'approved' 
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting approved testimonies:', error);
      throw error;
    }
  }

  // Get pending testimonies
  static async getPending() {
    try {
      const query = `
        SELECT * FROM testimonies 
        WHERE status = 'pending' 
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting pending testimonies:', error);
      throw error;
    }
  }

  // Update testimony status
  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE testimonies 
        SET status = $1
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await db.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating testimony status:', error);
      throw error;
    }
  }

  // Delete testimony
  static async delete(id) {
    try {
      const query = 'DELETE FROM testimonies WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting testimony:', error);
      throw error;
    }
  }

  // Get all testimonies (admin)
  static async getAll() {
    try {
      const query = `
        SELECT * FROM testimonies 
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all testimonies:', error);
      throw error;
    }
  }
}

module.exports = TestimonyModel;