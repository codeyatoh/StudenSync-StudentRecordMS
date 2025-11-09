const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sis_data',
  multipleStatements: true
};

async function updateMajorsTable() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Check current table structure
    console.log('\n📋 Checking current majors table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'majors'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);
    
    console.log('Current columns:', columns.map(col => col.COLUMN_NAME).join(', '));

    // Add missing columns if they don't exist
    console.log('\n🔧 Adding missing columns...');
    
    const hasCodeColumn = columns.some(col => col.COLUMN_NAME === 'major_code');
    const hasDescColumn = columns.some(col => col.COLUMN_NAME === 'description');
    const hasActiveColumn = columns.some(col => col.COLUMN_NAME === 'is_active');

    if (!hasCodeColumn) {
      await connection.execute(`
        ALTER TABLE majors 
        ADD COLUMN major_code VARCHAR(10) UNIQUE AFTER major_name
      `);
      console.log('✅ Added major_code column');
    } else {
      console.log('ℹ️  major_code column already exists');
    }

    if (!hasDescColumn) {
      await connection.execute(`
        ALTER TABLE majors 
        ADD COLUMN description TEXT AFTER ${hasCodeColumn ? 'major_code' : 'major_name'}
      `);
      console.log('✅ Added description column');
    } else {
      console.log('ℹ️  description column already exists');
    }

    if (!hasActiveColumn) {
      await connection.execute(`
        ALTER TABLE majors 
        ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER ${hasDescColumn ? 'description' : (hasCodeColumn ? 'major_code' : 'major_name')}
      `);
      console.log('✅ Added is_active column');
    } else {
      console.log('ℹ️  is_active column already exists');
    }

    // Update existing records
    console.log('\n📝 Updating existing records...');
    
    const updateQuery = `
      UPDATE majors SET 
        major_code = CASE 
          WHEN major_name = 'Digital Systems' THEN 'DS'
          WHEN major_name = 'Embedded Systems' THEN 'ES'
          WHEN major_name = 'Cybersecurity' THEN 'CS'
          WHEN major_name = 'Data Science' THEN 'DSC'
          WHEN major_name = 'Software Engineering' THEN 'SE'
          WHEN major_name = 'Network Administration' THEN 'NA'
          WHEN major_name = 'Web Development' THEN 'WD'
          ELSE UPPER(LEFT(REPLACE(major_name, ' ', ''), 2))
        END,
        description = CASE 
          WHEN major_name = 'Digital Systems' THEN 'Focus on digital circuit design, microprocessors, and embedded systems development.'
          WHEN major_name = 'Embedded Systems' THEN 'Specialization in embedded software development, IoT devices, and real-time systems.'
          WHEN major_name = 'Cybersecurity' THEN 'Comprehensive study of information security, ethical hacking, and network protection.'
          WHEN major_name = 'Data Science' THEN 'Advanced analytics, machine learning, and big data processing techniques.'
          WHEN major_name = 'Software Engineering' THEN 'Full-stack development, software architecture, and project management methodologies.'
          WHEN major_name = 'Network Administration' THEN 'Network infrastructure management, server administration, and system security.'
          WHEN major_name = 'Web Development' THEN 'Modern web technologies, responsive design, and full-stack web application development.'
          ELSE CONCAT('Specialization in ', major_name, ' field of study.')
        END,
        is_active = 1
      WHERE (major_code IS NULL OR major_code = '' OR is_active IS NULL OR is_active = 0)
    `;

    const [updateResult] = await connection.execute(updateQuery);
    console.log(`✅ Updated ${updateResult.affectedRows} records`);

    // Verify the updates
    console.log('\n📊 Verifying updates...');
    const [majors] = await connection.execute(`
      SELECT major_id, major_name, major_code, 
             LEFT(description, 50) as description_preview, 
             is_active, program_id 
      FROM majors 
      ORDER BY major_name
    `);

    console.log('\nUpdated majors:');
    console.table(majors);

    console.log('\n🎉 Majors table update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating majors table:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the update
updateMajorsTable();
