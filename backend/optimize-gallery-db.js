const GalleryModel = require('./src/models/galleryModel');
const LivestreamModel = require('./src/models/livestreamModel');
const ContactModel = require('./src/models/contactModel');

async function optimizeDatabase() {
  try {
    console.log('Starting database optimization...');
    
    // Create optimized gallery table with indexes
    await GalleryModel.createTable();
    console.log('✓ Gallery table optimized');
    
    // Create livestream table if it doesn't exist
    await LivestreamModel.createTable();
    console.log('✓ Livestream table verified');
    
    // Create contact table and initialize default data
    await ContactModel.createTable();
    await ContactModel.initializeDefaultContact();
    console.log('✓ Contact table optimized');
    
    console.log('Database optimization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error optimizing database:', error);
    process.exit(1);
  }
}

optimizeDatabase();