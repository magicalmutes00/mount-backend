const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'shrine_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function updateDatabase() {
  console.log('🗄️ Updating Management Team Database Schema...\n');
  
  try {
    // Check if featured column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'management_team' 
      AND column_name = 'is_featured'
    `;
    
    const columnResult = await pool.query(checkColumnQuery);
    
    if (columnResult.rows.length > 0) {
      console.log('📋 Found is_featured column, removing it...');
      
      // Remove the featured column
      const dropColumnQuery = 'ALTER TABLE management_team DROP COLUMN IF EXISTS is_featured';
      await pool.query(dropColumnQuery);
      console.log('✅ Removed is_featured column');
      
      // Remove featured index if it exists
      const dropIndexQuery = 'DROP INDEX IF EXISTS idx_management_featured';
      await pool.query(dropIndexQuery);
      console.log('✅ Removed featured index');
      
      // Remove featured-related indexes
      const dropFeaturedIndexes = 'DROP INDEX IF EXISTS idx_management_active_featured';
      await pool.query(dropFeaturedIndexes);
      console.log('✅ Removed featured-related indexes');
      
    } else {
      console.log('✅ is_featured column not found, database already updated');
    }
    
    // Show current table structure
    console.log('\n📊 Current management_team table structure:');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'management_team'
      ORDER BY ordinal_position
    `;
    
    const structure = await pool.query(structureQuery);
    structure.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });
    
    // Show current data
    console.log('\n📋 Current management team members:');
    const dataQuery = 'SELECT id, name, position, is_active, image_url IS NOT NULL as has_image FROM management_team ORDER BY display_order, id';
    const data = await pool.query(dataQuery);
    
    data.rows.forEach((row, index) => {
      const imageIcon = row.has_image ? '🖼️' : '📷';
      console.log(`   ${index + 1}. ${imageIcon} ${row.name} (${row.position}) - ${row.is_active ? 'Active' : 'Inactive'}`);
    });
    
    console.log('\n✅ Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Database update error:', error);
  } finally {
    await pool.end();
  }
}

// Run the update
updateDatabase().catch(console.error);