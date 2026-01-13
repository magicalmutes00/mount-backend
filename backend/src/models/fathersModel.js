const db = require('../db/db');

class FathersModel {
  // Create fathers table with optimized indexes
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS fathers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        period VARCHAR(255),
        category VARCHAR(50) NOT NULL CHECK (category IN ('parish_priest', 'assistant_priest', 'son_of_soil', 'deacon')),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_fathers_category ON fathers(category);
      CREATE INDEX IF NOT EXISTS idx_fathers_active ON fathers(is_active);
      CREATE INDEX IF NOT EXISTS idx_fathers_display_order ON fathers(display_order);
      CREATE INDEX IF NOT EXISTS idx_fathers_created_at ON fathers(created_at);
      CREATE INDEX IF NOT EXISTS idx_fathers_category_active_order ON fathers(category, is_active, display_order);

      -- Add trigger to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_fathers_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_fathers_updated_at ON fathers;
      CREATE TRIGGER update_fathers_updated_at
          BEFORE UPDATE ON fathers
          FOR EACH ROW
          EXECUTE FUNCTION update_fathers_updated_at();
    `;

    try {
      await db.query(query);
      console.log('Fathers table and indexes created or already exist');
    } catch (error) {
      console.error('Error creating fathers table:', error);
      throw error;
    }
  }

  // Get all active fathers by category (public)
  static async getAllActiveByCategory() {
    try {
      const query = `
        SELECT id, name, period, category, display_order, created_at
        FROM fathers 
        WHERE is_active = true
        ORDER BY category, display_order ASC, created_at ASC
      `;
      
      const result = await db.query(query);
      
      // Group by category
      const grouped = {
        parish_priest: [],
        assistant_priest: [],
        son_of_soil: [],
        deacon: []
      };
      
      result.rows.forEach(father => {
        if (grouped[father.category]) {
          grouped[father.category].push(father);
        }
      });
      
      return grouped;
    } catch (error) {
      console.error('Error getting active fathers by category:', error);
      throw error;
    }
  }

  // Get all fathers (admin)
  static async getAll() {
    try {
      const query = `
        SELECT id, name, period, category, display_order, is_active, 
               created_at, updated_at
        FROM fathers 
        ORDER BY category, display_order ASC, created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all fathers:', error);
      throw error;
    }
  }

  // Get fathers by category (admin)
  static async getByCategory(category) {
    try {
      const query = `
        SELECT id, name, period, category, display_order, is_active, 
               created_at, updated_at
        FROM fathers 
        WHERE category = $1
        ORDER BY display_order ASC, created_at DESC
      `;
      
      const result = await db.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error('Error getting fathers by category:', error);
      throw error;
    }
  }

  // Get father by ID
  static async getById(id) {
    try {
      const query = `
        SELECT id, name, period, category, display_order, is_active, 
               created_at, updated_at
        FROM fathers 
        WHERE id = $1
      `;
      
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting father by ID:', error);
      throw error;
    }
  }

  // Create new father
  static async create(fatherData) {
    try {
      const {
        name,
        period,
        category,
        display_order = 0,
        is_active = true
      } = fatherData;

      const query = `
        INSERT INTO fathers (name, period, category, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [name, period, category, display_order, is_active];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating father:', error);
      throw error;
    }
  }

  // Update father
  static async update(id, fatherData) {
    try {
      const {
        name,
        period,
        category,
        display_order,
        is_active
      } = fatherData;

      const query = `
        UPDATE fathers 
        SET name = $2, period = $3, category = $4, display_order = $5, 
            is_active = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, name, period, category, display_order, is_active];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating father:', error);
      throw error;
    }
  }

  // Delete father
  static async delete(id) {
    try {
      const query = 'DELETE FROM fathers WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting father:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleActive(id) {
    try {
      const query = `
        UPDATE fathers 
        SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error toggling father active status:', error);
      throw error;
    }
  }

  // Update display order
  static async updateDisplayOrder(id, display_order) {
    try {
      const query = `
        UPDATE fathers 
        SET display_order = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [id, display_order]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating father display order:', error);
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
          COUNT(*) FILTER (WHERE is_active = false) as inactive,
          COUNT(*) FILTER (WHERE category = 'parish_priest') as parish_priests,
          COUNT(*) FILTER (WHERE category = 'assistant_priest') as assistant_priests,
          COUNT(*) FILTER (WHERE category = 'son_of_soil') as sons_of_soil,
          COUNT(*) FILTER (WHERE category = 'deacon') as deacons
        FROM fathers
      `;
      
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting fathers statistics:', error);
      throw error;
    }
  }

  // Initialize default data
  static async initializeDefaultData() {
    try {
      // Check if data already exists
      const checkQuery = 'SELECT COUNT(*) as count FROM fathers';
      const checkResult = await db.query(checkQuery);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        console.log('Fathers data already exists, skipping initialization');
        return;
      }

      // Insert default data
      const parishPriests = [
        { name: "Rev.Fr.V.Mary George", period: "19.05.1961 – 06.12.1971" },
        { name: "Rev.Fr.A.P.Stephen", period: "06.12.1971 – 08.10.1975" },
        { name: "Rev.Fr.S.Servacius", period: "08.10.1975 – 03.01.1976" },
        { name: "Rev.Fr.A.Joseph Raj", period: "03.01.1976 – 25.05.1978" },
        { name: "Rev.Fr.S.Joseph", period: "25.05.1978 – 30.05.1982" },
        { name: "Rev.Fr.V.Maria James", period: "30.05.1982 – 13.05.1987" },
        { name: "Rev.Fr.R.Lawrence", period: "13.05.1987 – 20.05.1989" },
        { name: "Rev.Fr.S.M.Charles Borromeo", period: "20.05.1989 – 08.06.1992" },
        { name: "Rev.Fr.George Ponniah", period: "08.06.1992 – 12.06.1998" },
        { name: "Rev.Fr.J.R.Partic Xavier", period: "12.06.1998 – 25.06.2001" },
        { name: "Rev.Fr.M.David Michael", period: "25.06.2001 – 18.08.2001" },
        { name: "Rev.Fr.R.Lawrence", period: "18.08.2001 – 16.05.2002" },
        { name: "Rev.Fr.Antonyhas Stalin", period: "16.05.2002 – 12.03.2004" },
        { name: "Rev.Fr.Yesudasan Thomas", period: "12.03.2004 – 21.05.2004" },
        { name: "Rev.Fr.George Ponniah", period: "21.05.2004 – 26.06.2005" },
        { name: "Rev.Fr.M.Devasahayam", period: "26.06.2005 – 23.05.2010" },
        { name: "Rev.Fr.Perpetual Antony", period: "23.05.2010 – 24.06.2015" },
        { name: "Rev.Fr.A.Stephen", period: "24.06.2015 – 19.08.2020" },
        { name: "Rev.Fr.A.Michael George Bright", period: "19.08.2020 – 24.05.2025" },
        { name: "Rev.Fr.S.Leon Henson", period: "25.05.2025 – Now" }
      ];

      const assistantPriests = [
        { name: "Rev.Fr.Francis De Sales", period: "07.12.1989 – 09.03.1990" },
        { name: "Rev.Fr.A.Gabriel", period: "11.05.1999 – 25.05.2001" },
        { name: "Rev.Fr.Yesudasan Thomas", period: "17.08.2003 – 12.03.2004" },
        { name: "Rev.Fr.Gnanaraj", period: "June 2012 – May 2013" },
        { name: "Rev.Fr.Antony Dhas", period: "June 2013 – May 2014" },
        { name: "Rev.Fr.Britto Raj", period: "June 2014 – May 2015" },
        { name: "Rev.Fr.Benhar", period: "04.10.2014 – 04.02.2015" },
        { name: "Rev.Fr.Benjamin", period: "05.02.2015 – 10.06.2015" },
        { name: "Rev.Fr.John Sibi", period: "10.06.2015 – 05.12.2015" },
        { name: "Rev.Fr.Ravi Godson Kennady", period: "05.12.2015 – 10.10.2017" },
        { name: "Rev.Fr.A.Michael George Bright", period: "12.10.2017 – 30.03.2018" },
        { name: "Rev.Fr.Gnana Sekaran", period: "03.05.2018 – 18.05.2019" },
        { name: "Rev.Fr.Maria Joseph Sibu", period: "09.05.2019 – 19.08.2020" }
      ];

      const sonsOfSoil = [
        { name: "Rev.Fr.Kunju Micheal" },
        { name: "Rev.Fr.Jesudhasan" },
        { name: "Rev.Fr.Arul Nirmal" },
        { name: "Rev.Fr.Sahaya Felix" },
        { name: "Rev.Fr.S.Anbin Devasahayam" }
      ];

      const deacons = [
        { name: "Dn.Saju", period: "10.09.2017 – 01.04.2018" },
        { name: "Dn.Sahaya Sunil", period: "09.09.2018 – 01.04.2019" },
        { name: "Dn.Jesu Pravin", period: "01.09.2024 – 01.04.2025" }
      ];

      // Insert parish priests
      for (let i = 0; i < parishPriests.length; i++) {
        await this.create({
          ...parishPriests[i],
          category: 'parish_priest',
          display_order: i + 1
        });
      }

      // Insert assistant priests
      for (let i = 0; i < assistantPriests.length; i++) {
        await this.create({
          ...assistantPriests[i],
          category: 'assistant_priest',
          display_order: i + 1
        });
      }

      // Insert sons of soil
      for (let i = 0; i < sonsOfSoil.length; i++) {
        await this.create({
          ...sonsOfSoil[i],
          category: 'son_of_soil',
          display_order: i + 1
        });
      }

      // Insert deacons
      for (let i = 0; i < deacons.length; i++) {
        await this.create({
          ...deacons[i],
          category: 'deacon',
          display_order: i + 1
        });
      }

      console.log('Default fathers data initialized successfully');
    } catch (error) {
      console.error('Error initializing default fathers data:', error);
      throw error;
    }
  }
}

module.exports = FathersModel;