const { executeQuery } = require('../config/database');

async function checkMajorsTable() {
  try {
    console.log('🔍 Checking majors table structure...');
    
    // Check table structure
    const structureResult = await executeQuery(`
      DESCRIBE majors
    `);
    
    if (structureResult.success) {
      console.log('\n📋 Current majors table structure:');
      console.table(structureResult.data);
    } else {
      console.error('❌ Failed to get table structure:', structureResult.error);
    }

    // Check current data
    const dataResult = await executeQuery(`
      SELECT * FROM majors LIMIT 5
    `);
    
    if (dataResult.success) {
      console.log('\n📊 Sample majors data:');
      console.table(dataResult.data);
    } else {
      console.error('❌ Failed to get majors data:', dataResult.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMajorsTable();
