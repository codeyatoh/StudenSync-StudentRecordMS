const fs = require('fs');
const path = require('path');

// Check if uploads directory exists and create it if not
const uploadsDir = path.join(__dirname, '../uploads');
const studentsDir = path.join(uploadsDir, 'students');

console.log('🔍 Checking uploads directory structure...');

// Check main uploads directory
if (!fs.existsSync(uploadsDir)) {
  console.log('❌ Uploads directory does not exist. Creating...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory exists');
}

// Check students subdirectory
if (!fs.existsSync(studentsDir)) {
  console.log('❌ Students uploads directory does not exist. Creating...');
  fs.mkdirSync(studentsDir, { recursive: true });
  console.log('✅ Created students uploads directory');
} else {
  console.log('✅ Students uploads directory exists');
}

// List files in students directory
try {
  const files = fs.readdirSync(studentsDir);
  console.log(`📁 Found ${files.length} files in students directory:`);
  files.forEach(file => {
    const filePath = path.join(studentsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
} catch (error) {
  console.log('❌ Error reading students directory:', error.message);
}

console.log('\n🎯 Upload URL test:');
console.log('   Static files should be accessible at: http://localhost:5000/uploads/students/[filename]');
console.log('   Make sure your server is running to test photo URLs');
