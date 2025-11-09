const { executeQuery } = require('../config/database');

async function checkStudentPhotos() {
  try {
    console.log('🔍 Checking student photos in database...');
    
    // Get students with their photo URLs
    const result = await executeQuery(`
      SELECT student_id, student_number, first_name, last_name, profile_picture_url 
      FROM students 
      WHERE is_active = 1 
      ORDER BY student_id DESC 
      LIMIT 10
    `);
    
    if (result.success) {
      console.log(`\n📊 Found ${result.data.length} students:`);
      result.data.forEach(student => {
        console.log(`   - ${student.student_number}: ${student.first_name} ${student.last_name}`);
        console.log(`     Photo URL: ${student.profile_picture_url || 'No photo'}`);
        if (student.profile_picture_url) {
          console.log(`     Full URL: http://localhost:5000${student.profile_picture_url}`);
        }
        console.log('');
      });
    } else {
      console.error('❌ Database query failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStudentPhotos();
