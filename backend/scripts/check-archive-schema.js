const { executeQuery } = require('../config/database');

async function checkArchiveSchema() {
  try {
    console.log('🔍 Checking students table schema for archive functionality...');
    
    // Check table structure
    const schemaResult = await executeQuery('DESCRIBE students');
    
    if (schemaResult.success) {
      console.log('\n📊 Students table columns:');
      schemaResult.data.forEach(column => {
        console.log(`   - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}) ${column.Default ? `Default: ${column.Default}` : ''}`);
      });
      
      // Check if is_active column exists
      const isActiveColumn = schemaResult.data.find(col => col.Field === 'is_active');
      if (isActiveColumn) {
        console.log('\n✅ Archive functionality ready - is_active column exists');
        console.log(`   Type: ${isActiveColumn.Type}, Default: ${isActiveColumn.Default}`);
      } else {
        console.log('\n❌ Archive column missing - need to add is_active column');
      }
    }
    
    // Check current archive status
    const archiveCheck = await executeQuery(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as archived_students
      FROM students
    `);
    
    if (archiveCheck.success) {
      const stats = archiveCheck.data[0];
      console.log('\n📈 Current archive statistics:');
      console.log(`   Total Students: ${stats.total_students}`);
      console.log(`   Active Students: ${stats.active_students}`);
      console.log(`   Archived Students: ${stats.archived_students}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkArchiveSchema();
