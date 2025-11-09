const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const initializeDatabase = async () => {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('📡 Connected to MySQL server');

    // Read and execute SQL schema file
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'srms_schema.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    console.log('📄 Reading database schema file...');
    
    // Split SQL content by statements and execute them
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('🔧 Creating database and tables...');
    
    // Execute the entire SQL file at once using query instead of execute
    try {
      await connection.query(sqlContent);
      console.log('✅ Database schema executed successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    }

    console.log('✅ Database and tables created successfully!');
    console.log('👤 Admin user should be created by the SQL file');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change this password immediately!');

    // Verify tables were created
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME || 'sis_data']);

    console.log('✅ Database schema created successfully!');
    console.log('📊 Tables created:');
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });

    console.log('🎉 Database initialization completed successfully!');
    console.log('🚀 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Please check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Please make sure MySQL server is running');
    } else if (error.code === 'ENOENT') {
      console.log('💡 SQL schema file not found. Please ensure backend/sql/srms_schema.sql exists');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initializeDatabase();
