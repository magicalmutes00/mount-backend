const db = require("../db/db");

class DonationModel {
  // Create donations and donation purposes tables
  static async createTable() {
    // Create donation purposes table
    const createPurposesTable = `
      CREATE TABLE IF NOT EXISTS donation_purposes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create donations table
    const createDonationsTable = `
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        donor_name VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
        purpose VARCHAR(255) NOT NULL,
        purpose_id INTEGER REFERENCES donation_purposes(id),
        donation_type VARCHAR(50) DEFAULT 'online' CHECK (donation_type IN ('online', 'offline', 'cash')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
        payment_method VARCHAR(50) DEFAULT 'upi' CHECK (payment_method IN ('upi', 'cash', 'cheque', 'bank_transfer')),
        utr_number VARCHAR(50),
        screenshot_path VARCHAR(500),
        screenshot_name VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
      CREATE INDEX IF NOT EXISTS idx_donations_purpose ON donations(purpose);
      CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
      CREATE INDEX IF NOT EXISTS idx_donations_donor_name ON donations(donor_name);
    `;

    await db.query(createPurposesTable);
    await db.query(createDonationsTable);
    await db.query(createIndexes);

    // Insert default donation purposes
    const insertPurposes = `
      INSERT INTO donation_purposes (name, description) VALUES
      ('General Donation', 'General support for shrine maintenance and activities'),
      ('Feast Day Celebration', 'Support for special feast day celebrations and events'),
      ('Shrine Renovation', 'Contributions for shrine building maintenance and renovation'),
      ('Charity Work', 'Support for charitable activities and community service'),
      ('Education Fund', 'Support for educational programs and scholarships'),
      ('Poor Relief', 'Direct assistance to needy families and individuals')
      ON CONFLICT (name) DO NOTHING
    `;

    await db.query(insertPurposes);
  }

  // Get all donation purposes
  static async getDonationPurposes() {
    const query = `
      SELECT id, name, description, is_active
      FROM donation_purposes 
      WHERE is_active = true
      ORDER BY name
    `;

    const result = await db.query(query);
    return result.rows;
  }

  // Submit donation
  static async submitDonation(donationData) {
    const {
      donorName,
      email,
      phone,
      amount,
      purpose,
      utrNumber,
      screenshotPath,
      screenshotName,
      notes
    } = donationData;

    // Get purpose_id if purpose exists
    let purposeId = null;
    if (purpose) {
      const purposeQuery = `SELECT id FROM donation_purposes WHERE name = $1`;
      const purposeResult = await db.query(purposeQuery, [purpose]);
      if (purposeResult.rows.length > 0) {
        purposeId = purposeResult.rows[0].id;
      }
    }

    const query = `
      INSERT INTO donations (
        donor_name, email, phone, amount, purpose, purpose_id,
        utr_number, screenshot_path, screenshot_name, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;

    const values = [
      donorName,
      email || null,
      phone || null,
      amount,
      purpose,
      purposeId,
      utrNumber,
      screenshotPath,
      screenshotName,
      notes || null
    ];

    const result = await db.query(query, values);
    return result.rows[0].id;
  }

  // Get all donations
  static async getAllDonations() {
    const query = `
      SELECT 
        d.id,
        d.donor_name,
        d.email,
        d.phone,
        d.amount,
        d.purpose,
        d.donation_type,
        d.status,
        d.payment_method,
        d.utr_number,
        d.screenshot_path,
        d.screenshot_name,
        d.notes,
        d.created_at,
        d.updated_at,
        dp.description as purpose_description
      FROM donations d
      LEFT JOIN donation_purposes dp ON d.purpose_id = dp.id
      ORDER BY d.created_at DESC
    `;

    const result = await db.query(query);
    
    // Convert to frontend-expected format (camelCase) and ensure proper data types
    return result.rows.map(row => ({
      id: row.id,
      name: row.donor_name,
      email: row.email,
      phone: row.phone,
      amount: parseFloat(row.amount) || 0,
      purpose: row.purpose,
      donation_type: row.donation_type,
      status: row.status,
      payment_method: row.payment_method,
      utr_number: row.utr_number,
      screenshot_path: row.screenshot_path,
      screenshot_name: row.screenshot_name,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      purpose_description: row.purpose_description
    }));
  }

  // Update donation status
  static async updateDonationStatus(id, status) {
    const query = `
      UPDATE donations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;

    await db.query(query, [status, id]);
  }

  // Get donation by ID
  static async getDonationById(id) {
    const query = `
      SELECT 
        d.*,
        dp.description as purpose_description
      FROM donations d
      LEFT JOIN donation_purposes dp ON d.purpose_id = dp.id
      WHERE d.id = $1
    `;

    const result = await db.query(query, [id]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.donor_name,
        email: row.email,
        phone: row.phone,
        amount: parseFloat(row.amount) || 0,
        purpose: row.purpose,
        donation_type: row.donation_type,
        status: row.status,
        payment_method: row.payment_method,
        utr_number: row.utr_number,
        screenshot_path: row.screenshot_path,
        screenshot_name: row.screenshot_name,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        purpose_description: row.purpose_description
      };
    }
    return null;
  }

  // Delete donation
  static async deleteDonation(id) {
    const query = `DELETE FROM donations WHERE id = $1`;
    await db.query(query, [id]);
  }

  // Get donation statistics
  static async getDonationStats() {
    const query = `
      SELECT 
        COUNT(*) as total_donations,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count
      FROM donations
    `;

    const result = await db.query(query);
    const stats = result.rows[0];
    
    return {
      total_donations: parseInt(stats.total_donations) || 0,
      total_amount: parseFloat(stats.total_amount) || 0,
      pending_count: parseInt(stats.pending_count) || 0,
      verified_count: parseInt(stats.verified_count) || 0
    };
  }
}

module.exports = DonationModel;