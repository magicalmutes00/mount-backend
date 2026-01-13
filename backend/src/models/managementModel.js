const db = require('../db/db');

class ManagementModel {
  // Create management table with optimized indexes
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS management_team (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        image_name VARCHAR(255),
        image_size INTEGER,
        image_type VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_management_active ON management_team(is_active);
      CREATE INDEX IF NOT EXISTS idx_management_featured ON management_team(is_featured);
      CREATE INDEX IF NOT EXISTS idx_management_display_order ON management_team(display_order);
      CREATE INDEX IF NOT EXISTS idx_management_created_at ON management_team(created_at);
      CREATE INDEX IF NOT EXISTS idx_management_active_order ON management_team(is_active, display_order);

      -- Add trigger to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_management_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_management_updated_at ON management_team;
      CREATE TRIGGER update_management_updated_at
          BEFORE UPDATE ON management_team
          FOR EACH ROW
          EXECUTE FUNCTION update_management_updated_at();
    `;

    try {
      await db.query(query);
      console.log('Management team table and indexes created or already exist');
    } catch (error) {
      console.error('Error creating management team table:', error);
      throw error;
    }
  }

  // Get all active management team members (public)
  static async getAllActive() {
    try {
      const query = `
        SELECT id, name, position, description, image_url, image_name, 
               phone, email, display_order, created_at
        FROM management_team 
        WHERE is_active = true
        ORDER BY display_order ASC, created_at ASC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting active management team members:', error);
      throw error;
    }
  }

  // Get all management team members (admin)
  static async getAll() {
    try {
      const query = `
        SELECT id, name, position, description, image_url, image_name, 
               image_size, image_type, phone, email, display_order, 
               is_active, created_at, updated_at
        FROM management_team 
        ORDER BY display_order ASC, created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all management team members:', error);
      throw error;
    }
  }

  // Get management team member by ID
  static async getById(id) {
    try {
      const query = `
        SELECT id, name, position, description, image_url, image_name, 
               image_size, image_type, phone, email, display_order, 
               is_active, created_at, updated_at
        FROM management_team 
        WHERE id = $1
      `;
      
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting management team member by ID:', error);
      throw error;
    }
  }

  // Create new management team member
  static async create(memberData) {
    try {
      const {
        name,
        position,
        description,
        image_url,
        image_name,
        image_size,
        image_type,
        phone,
        email,
        display_order = 0,
        is_active = true
      } = memberData;

      const query = `
        INSERT INTO management_team (
          name, position, description, image_url, image_name, 
          image_size, image_type, phone, email, display_order, 
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        name, position, description, image_url, image_name,
        image_size, image_type, phone, email, display_order,
        is_active
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating management team member:', error);
      throw error;
    }
  }

  // Update management team member
  static async update(id, memberData) {
    try {
      const {
        name,
        position,
        description,
        image_url,
        image_name,
        image_size,
        image_type,
        phone,
        email,
        display_order,
        is_active
      } = memberData;

      const query = `
        UPDATE management_team 
        SET name = $2, position = $3, description = $4, image_url = $5, 
            image_name = $6, image_size = $7, image_type = $8, phone = $9, 
            email = $10, display_order = $11, is_active = $12,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id, name, position, description, image_url, image_name,
        image_size, image_type, phone, email, display_order,
        is_active
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating management team member:', error);
      throw error;
    }
  }

  // Delete management team member
  static async delete(id) {
    try {
      const query = 'DELETE FROM management_team WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting management team member:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleActive(id) {
    try {
      const query = `
        UPDATE management_team 
        SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error toggling management team member active status:', error);
      throw error;
    }
  }

  // Toggle featured status
  static async toggleFeatured(id) {
    try {
      const query = `
        UPDATE management_team 
        SET is_featured = NOT is_featured, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error toggling management team member featured status:', error);
      throw error;
    }
  }

  // Update display order
  static async updateDisplayOrder(id, display_order) {
    try {
      const query = `
        UPDATE management_team 
        SET display_order = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [id, display_order]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating management team member display order:', error);
      throw error;
    }
  }

  // Get statistics
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_active = true) as active,
          COUNT(*) FILTER (WHERE is_active = false) as inactive
        FROM management_team
      `;
      
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting management team statistics:', error);
      throw error;
    }
  }
}

module.exports = ManagementModel;