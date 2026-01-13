const pool = require('../db/db');

class ContactModel {
  // Create contact_info table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        contact_phone VARCHAR(20) NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        contact_address TEXT NOT NULL,
        map_lat DECIMAL(10, 8) NOT NULL,
        map_lng DECIMAL(11, 8) NOT NULL,
        office_hours JSONB DEFAULT '{}',
        mass_timings JSONB DEFAULT '{}',
        social_media JSONB DEFAULT '{}',
        transportation_info JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create trigger function for updated_at
      CREATE OR REPLACE FUNCTION update_contact_info_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger
      DROP TRIGGER IF EXISTS update_contact_info_updated_at ON contact_info;
      CREATE TRIGGER update_contact_info_updated_at
          BEFORE UPDATE ON contact_info
          FOR EACH ROW
          EXECUTE FUNCTION update_contact_info_updated_at();

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_contact_info_active ON contact_info(is_active);
      CREATE INDEX IF NOT EXISTS idx_contact_info_updated_at ON contact_info(updated_at);
    `;

    try {
      await pool.query(query);
      console.log('Contact info table created successfully');
    } catch (error) {
      console.error('Error creating contact info table:', error);
      throw error;
    }
  }

  // Initialize default contact information
  static async initializeDefaultContact() {
    const checkQuery = 'SELECT COUNT(*) FROM contact_info WHERE is_active = true';
    const checkResult = await pool.query(checkQuery);
    
    if (parseInt(checkResult.rows[0].count) === 0) {
      const insertQuery = `
        INSERT INTO contact_info (
          contact_phone,
          contact_email,
          contact_address,
          map_lat,
          map_lng,
          office_hours,
          mass_timings,
          social_media,
          transportation_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      const values = [
        '+91 89037 60869',
        'devasahayammountshrine@gmail.com',
        'Devasahayam Mount, Aralvaimozhi, Kanyakumari District, Tamil Nadu 629301 / 629302, India',
        8.4855,
        77.5145,
        {
          weekdays: {
            monday_to_saturday: "5:00 AM - 9:00 PM",
            sunday: "5:00 AM - 10:00 PM"
          },
          phone_availability: "8:00 AM - 8:00 PM"
        },
        {
          daily_masses: ["6:00 AM", "9:00 AM", "6:00 PM"],
          special_occasions: {
            feast_day: "Special masses throughout the day",
            sundays: "Additional evening mass at 7:30 PM"
          }
        },
        {
          facebook: "https://facebook.com/devasahayamshrine",
          youtube: "https://youtube.com/@devasahayamshrine",
          instagram: "https://instagram.com/devasahayamshrine"
        },
        {
          by_air: {
            nearest_airport: "Trivandrum International Airport",
            distance: "approximately 50 km",
            transport: "Taxis and buses available from airport"
          },
          by_train: {
            nearest_station: "Nagercoil Junction",
            distance: "approximately 15 km",
            transport: "Local transportation readily available"
          },
          by_road: {
            connectivity: "Well-connected by state and private buses",
            private_transport: "Private vehicles and taxis can easily reach the shrine"
          }
        }
      ];

      try {
        await pool.query(insertQuery, values);
        console.log('Default contact information initialized');
      } catch (error) {
        console.error('Error initializing default contact:', error);
        throw error;
      }
    }
  }

  // Get active contact information
  static async getContactInfo() {
    const query = `
      SELECT 
        id,
        contact_phone,
        contact_email,
        contact_address,
        map_lat,
        map_lng,
        office_hours,
        mass_timings,
        social_media,
        transportation_info,
        created_at,
        updated_at
      FROM contact_info 
      WHERE is_active = true 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      throw error;
    }
  }

  // Update contact information (admin only)
  static async updateContactInfo(contactData) {
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
    } = contactData;

    const query = `
      UPDATE contact_info 
      SET 
        contact_phone = COALESCE($1, contact_phone),
        contact_email = COALESCE($2, contact_email),
        contact_address = COALESCE($3, contact_address),
        map_lat = COALESCE($4, map_lat),
        map_lng = COALESCE($5, map_lng),
        office_hours = COALESCE($6, office_hours),
        mass_timings = COALESCE($7, mass_timings),
        social_media = COALESCE($8, social_media),
        transportation_info = COALESCE($9, transportation_info),
        updated_at = CURRENT_TIMESTAMP
      WHERE is_active = true
      RETURNING *
    `;

    const values = [
      contact_phone,
      contact_email,
      contact_address,
      map_lat,
      map_lng,
      office_hours,
      mass_timings,
      social_media,
      transportation_info
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  }

  // Get contact history (admin only)
  static async getContactHistory() {
    const query = `
      SELECT 
        id,
        contact_phone,
        contact_email,
        contact_address,
        map_lat,
        map_lng,
        office_hours,
        mass_timings,
        social_media,
        transportation_info,
        is_active,
        created_at,
        updated_at
      FROM contact_info 
      ORDER BY updated_at DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching contact history:', error);
      throw error;
    }
  }
}

module.exports = ContactModel;