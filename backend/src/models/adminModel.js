const db = require('../db/db');
const bcrypt = require('bcryptjs');

class AdminModel {
  // Create admin table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(20) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await db.query(query);
      console.log('Admin table created or already exists');
    } catch (error) {
      console.error('Error creating admin table:', error);
      throw error;
    }
  }

  // Create default admin user
  static async createDefaultAdmin() {
    try {
      // Check if any admin exists
      const existingAdmins = await db.query('SELECT COUNT(*) as count FROM admins');
      
      if (existingAdmins.rows[0].count === '0') {
        const defaultUsername = 'admin';
        const defaultPassword = 'shrine@admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        
        const query = `
          INSERT INTO admins (username, password, email, role) 
          VALUES ($1, $2, $3, $4)
        `;
        
        await db.query(query, [
          defaultUsername, 
          hashedPassword, 
          'admin@devasahayamshrine.com', 
          'super_admin'
        ]);
        
        console.log('Default admin user created');
        console.log('Username: admin');
        console.log('Password: shrine@admin123');
        console.log('Please change the password after first login');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
      throw error;
    }
  }

  // Find admin by username
  static async findByUsername(username) {
    try {
      const query = 'SELECT * FROM admins WHERE username = $1 AND is_active = true';
      const result = await db.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding admin by username:', error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(adminId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const query = 'UPDATE admins SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
      await db.query(query, [hashedPassword, adminId]);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(adminId) {
    try {
      const query = 'UPDATE admins SET updated_at = CURRENT_TIMESTAMP WHERE id = $1';
      await db.query(query, [adminId]);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
}

module.exports = AdminModel;