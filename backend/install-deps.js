const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing required dependencies for admin authentication...');

try {
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found!');
    process.exit(1);
  }

  // Install dependencies
  console.log('Installing bcryptjs...');
  execSync('npm install bcryptjs@^2.4.3', { stdio: 'inherit' });
  
  console.log('Installing jsonwebtoken...');
  execSync('npm install jsonwebtoken@^9.0.2', { stdio: 'inherit' });
  
  console.log('✅ Dependencies installed successfully!');
  console.log('You can now restart the server with: npm run dev');
  
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  console.log('\nPlease try installing manually:');
  console.log('cd backend');
  console.log('npm install bcryptjs@^2.4.3 jsonwebtoken@^9.0.2');
}