const { executeQuery } = require('../config/database');
require('dotenv').config();

async function addEnrollmentArchiveColumn() {
  try {
    console.log('🔧 Adding is_active column to enrollments table...');
    
    // Check if column already exists
    const checkColumn = await executeQuery(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'enrollments' 
       AND COLUMN_NAME = 'is_active'`
    );
    
    if (checkColumn.success && checkColumn.data && checkColumn.data.length > 0) {
      console.log('✅ Column is_active already exists in enrollments table');
      return;
    }
    
    // Add is_active column using direct connection
    const { getConnection } = require('../config/database');
    const connection = await getConnection();
    
    try {
      await connection.query(
        `ALTER TABLE enrollments 
         ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER status`
      );
      console.log('✅ Successfully added is_active column to enrollments table');
      
      // Set all existing enrollments as active
      await connection.query(
        'UPDATE enrollments SET is_active = 1 WHERE is_active IS NULL'
      );
      console.log('✅ Set all existing enrollments as active');
      
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Column is_active already exists in enrollments table');
      } else {
        console.error('❌ Failed to add is_active column:', error.message);
        throw error;
      }
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Error adding column:', error);
  } finally {
    process.exit(0);
  }
}

addEnrollmentArchiveColumn();

