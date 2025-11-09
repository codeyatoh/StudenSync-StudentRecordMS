const { executeQuery } = require('../config/database');

async function addUserArchiveColumn() {
  try {
    // Check if column exists
    const check = await executeQuery(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active'`
    );

    if (check.success && check.data.length > 0) {
      console.log('is_active column already exists on users table.');
      return;
    }

    console.log('Adding is_active column to users table...');
    const alter = await executeQuery(
      `ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER role`
    );

    if (!alter.success) {
      throw new Error('Failed to add is_active column to users');
    }

    console.log('is_active column added successfully.');
  } catch (error) {
    console.error('Error adding is_active to users:', error.message || error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  addUserArchiveColumn().then(() => process.exit());
}

module.exports = { addUserArchiveColumn };


