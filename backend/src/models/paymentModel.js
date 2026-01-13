const db = require("../db/db");

class PaymentModel {
  // Create payments table
  static async createTable() {
    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        amount DECIMAL(10, 2) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        utr_number VARCHAR(50) NOT NULL,
        screenshot_path VARCHAR(500) NOT NULL,
        screenshot_name VARCHAR(255) NOT NULL,
        mass_details JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_purpose ON payments(purpose);
      CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
      CREATE INDEX IF NOT EXISTS idx_payments_utr ON payments(utr_number);
    `;

    await db.query(createPaymentsTable);
    await db.query(createIndexes);
  }

  // Submit payment details
  static async submitPayment(paymentData) {
    const {
      name,
      email,
      phone,
      amount,
      purpose,
      utrNumber,
      screenshotPath,
      screenshotName,
      massDetails,
    } = paymentData;

    const query = `
      INSERT INTO payments (
        name, email, phone, amount, purpose, utr_number, 
        screenshot_path, screenshot_name, mass_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const values = [
      name,
      email,
      phone,
      amount,
      purpose,
      utrNumber,
      screenshotPath,
      screenshotName,
      massDetails ? JSON.stringify(massDetails) : null,
    ];

    const result = await db.query(query, values);
    return result.rows[0].id;
  }

  // Get all payments
  static async getAllPayments() {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        amount,
        purpose,
        utr_number,
        screenshot_path,
        screenshot_name,
        mass_details,
        status,
        created_at,
        updated_at
      FROM payments 
      ORDER BY created_at DESC
    `;

    const result = await db.query(query);
    
    // Convert amount to number to ensure proper calculation
    return result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount) || 0
    }));
  }

  // Get payments by purpose
  static async getPaymentsByPurpose(purpose) {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        amount,
        purpose,
        utr_number,
        screenshot_path,
        screenshot_name,
        mass_details,
        status,
        created_at,
        updated_at
      FROM payments 
      WHERE purpose = $1
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [purpose]);
    return result.rows;
  }

  // Get payments by status
  static async getPaymentsByStatus(status) {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        amount,
        purpose,
        utr_number,
        screenshot_path,
        screenshot_name,
        mass_details,
        status,
        created_at,
        updated_at
      FROM payments 
      WHERE status = $1
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [status]);
    return result.rows;
  }

  // Update payment status
  static async updatePaymentStatus(id, status) {
    const query = `
      UPDATE payments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;

    await db.query(query, [status, id]);
  }

  // Get payment by ID
  static async getPaymentById(id) {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        amount,
        purpose,
        utr_number,
        screenshot_path,
        screenshot_name,
        mass_details,
        status,
        created_at,
        updated_at
      FROM payments 
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Get payment by UTR number
  static async getPaymentByUTR(utrNumber) {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        amount,
        purpose,
        utr_number,
        screenshot_path,
        screenshot_name,
        mass_details,
        status,
        created_at,
        updated_at
      FROM payments 
      WHERE utr_number = $1
    `;

    const result = await db.query(query, [utrNumber]);
    return result.rows[0];
  }

  // Get payment statistics
  static async getPaymentStats() {
    const query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END) as verified_amount
      FROM payments
    `;

    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = PaymentModel;