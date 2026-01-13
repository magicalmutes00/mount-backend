const db = require("../db/db");

class MassBookingModel {
  // Create mass bookings table
  static async createTable() {
    const createBookingsTable = `
      CREATE TABLE IF NOT EXISTS mass_bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        start_date DATE NOT NULL,
        preferred_time VARCHAR(10) NOT NULL,
        intention_type VARCHAR(50) NOT NULL,
        intention_description TEXT NOT NULL,
        number_of_days INTEGER NOT NULL DEFAULT 1,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS mass_booking_payments (
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
        status VARCHAR(20) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_mass_bookings_status ON mass_bookings(status);
      CREATE INDEX IF NOT EXISTS idx_mass_bookings_date ON mass_bookings(start_date);
      CREATE INDEX IF NOT EXISTS idx_mass_bookings_created_at ON mass_bookings(created_at);
      CREATE INDEX IF NOT EXISTS idx_mass_booking_payments_status ON mass_booking_payments(status);
      CREATE INDEX IF NOT EXISTS idx_mass_booking_payments_created_at ON mass_booking_payments(created_at);
    `;

    await db.query(createBookingsTable);
    await db.query(createPaymentsTable);
    await db.query(createIndexes);
  }

  // Create new mass booking
  static async createBooking(bookingData) {
    const {
      name,
      email,
      phone,
      startDate,
      preferredTime,
      intentionType,
      intentionDescription,
      numberOfDays,
      totalAmount,
    } = bookingData;

    const query = `
      INSERT INTO mass_bookings (
        name, email, phone, start_date, preferred_time, 
        intention_type, intention_description, number_of_days, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const values = [
      name,
      email,
      phone,
      startDate,
      preferredTime,
      intentionType,
      intentionDescription,
      numberOfDays,
      totalAmount,
    ];

    const result = await db.query(query, values);
    return result.rows[0].id;
  }

  // Get all mass bookings
  static async getAllBookings() {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        start_date,
        preferred_time,
        intention_type,
        intention_description,
        number_of_days,
        total_amount,
        status,
        created_at,
        updated_at
      FROM mass_bookings 
      ORDER BY created_at DESC
    `;

    const result = await db.query(query);
    
    // Convert total_amount to number to ensure proper calculation
    return result.rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount) || 0
    }));
  }

  // Update booking status
  static async updateBookingStatus(id, status) {
    const query = `
      UPDATE mass_bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;

    await db.query(query, [status, id]);
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
      INSERT INTO mass_booking_payments (
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
      FROM mass_booking_payments 
      ORDER BY created_at DESC
    `;

    const result = await db.query(query);
    
    // Convert amount to number to ensure proper calculation
    return result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount) || 0
    }));
  }

  // Update payment status
  static async updatePaymentStatus(id, status) {
    const query = `
      UPDATE mass_booking_payments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;

    await db.query(query, [status, id]);
  }

  // Get booking by ID
  static async getBookingById(id) {
    const query = `
      SELECT * FROM mass_bookings WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Get payment by ID
  static async getPaymentById(id) {
    const query = `
      SELECT * FROM mass_booking_payments WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Delete payment
  static async deletePayment(id) {
    const query = `DELETE FROM mass_booking_payments WHERE id = $1`;
    await db.query(query, [id]);
  }

  // Delete booking
  static async deleteBooking(id) {
    const query = `DELETE FROM mass_bookings WHERE id = $1`;
    await db.query(query, [id]);
  }
}

module.exports = MassBookingModel;