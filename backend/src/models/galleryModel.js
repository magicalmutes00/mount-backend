const db = require('../db/db');

class GalleryModel {
  // Create gallery table with optimized indexes
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        image_name VARCHAR(255) NOT NULL,
        image_size INTEGER,
        image_type VARCHAR(50),
        file_type VARCHAR(10) DEFAULT 'image',
        category VARCHAR(50) DEFAULT 'general',
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        uploaded_by VARCHAR(100) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);
      CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(is_featured);
      CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
      CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);
      CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at);
      CREATE INDEX IF NOT EXISTS idx_gallery_active_category ON gallery(is_active, category);
      CREATE INDEX IF NOT EXISTS idx_gallery_active_featured ON gallery(is_active, is_featured);
    `;

    try {
      await db.query(query);
      console.log('Gallery table and indexes created or already exist');
    } catch (error) {
      console.error('Error creating gallery table:', error);
      throw error;
    }
  }

  // Get all gallery items (public) - optimized query
  static async getAllActive(category = null, limit = null) {
    try {
      let query = `
        SELECT id, title, description, image_url, image_name, 
               category, is_featured, is_active, file_type, created_at
        FROM gallery 
        WHERE is_active = true
      `;
      const params = [];
      let paramCount = 1;
      
      if (category) {
        query += ` AND category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }
      
      query += ' ORDER BY display_order ASC, created_at DESC';
      
      if (limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(limit);
      }
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting active gallery items:', error);
      throw error;
    }
  }

  // Get featured items only (optimized)
  static async getFeatured(limit = 3) {
    try {
      const query = `
        SELECT id, title, description, image_url, image_name, 
               category, is_featured, file_type, created_at
        FROM gallery 
        WHERE is_active = true AND is_featured = true
        ORDER BY display_order ASC, created_at DESC
        LIMIT $1
      `;
      
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting featured gallery items:', error);
      throw error;
    }
  }

  // Get categories with counts (optimized)
  static async getCategoriesWithCounts() {
    try {
      const query = `
        SELECT category, COUNT(*) as count
        FROM gallery 
        WHERE is_active = true
        GROUP BY category
        ORDER BY category
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting categories with counts:', error);
      throw error;
    }
  }

  // Get all gallery items (admin)
  static async getAll(category = null) {
    try {
      let query = 'SELECT * FROM gallery';
      const params = [];
      
      if (category) {
        query += ' WHERE category = $1';
        params.push(category);
      }
      
      query += ' ORDER BY display_order ASC, created_at DESC';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting all gallery items:', error);
      throw error;
    }
  }

  // Create new gallery item
  static async create(galleryData) {
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
        display_order,
        uploaded_by
      } = galleryData;

      const query = `
        INSERT INTO gallery (
          title, description, image_url, image_name, image_size, 
          image_type, file_type, category, is_featured, display_order, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *
      `;

      const values = [
        title,
        description || null,
        image_url,
        image_name,
        image_size || null,
        image_type || null,
        file_type || 'image',
        category || 'general',
        is_featured || false,
        display_order || 0,
        uploaded_by || 'admin'
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating gallery item:', error);
      throw error;
    }
  }

  // Update gallery item
  static async update(id, galleryData) {
    try {
      const {
        title,
        description,
        category,
        is_featured,
        is_active,
        display_order
      } = galleryData;

      const query = `
        UPDATE gallery SET 
          title = $1,
          description = $2,
          category = $3,
          is_featured = $4,
          is_active = $5,
          display_order = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `;

      const values = [
        title,
        description,
        category,
        is_featured,
        is_active,
        display_order,
        id
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating gallery item:', error);
      throw error;
    }
  }

  // Delete gallery item
  static async delete(id) {
    try {
      const query = 'DELETE FROM gallery WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleActive(id) {
    try {
      const query = `
        UPDATE gallery SET 
          is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error toggling gallery item active status:', error);
      throw error;
    }
  }

  // Toggle featured status
  static async toggleFeatured(id) {
    try {
      const query = `
        UPDATE gallery SET 
          is_featured = NOT is_featured,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error toggling gallery item featured status:', error);
      throw error;
    }
  }

  // Get gallery statistics (optimized)
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive
        FROM gallery
      `;
      
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting gallery stats:', error);
      throw error;
    }
  }
}

module.exports = GalleryModel;