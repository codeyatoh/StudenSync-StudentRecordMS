const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAdmin() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sis_data'
    });

    console.log('🔍 Checking admin user...');
    
    // Check if admin user exists
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user not found. Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await connection.execute(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'Admin']
      );
      
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user found:');
      console.log(`   Username: ${users[0].username}`);
      console.log(`   Role: ${users[0].role}`);
      console.log(`   Created: ${users[0].created_at}`);
      
      // Test password
      const isValidPassword = await bcrypt.compare('admin123', users[0].password_hash);
      console.log(`   Password Test: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
      
      if (!isValidPassword) {
        console.log('🔧 Updating admin password...');
        const newHashedPassword = await bcrypt.hash('admin123', 12);
        await connection.execute(
          'UPDATE users SET password_hash = ? WHERE username = ?',
          [newHashedPassword, 'admin']
        );
        console.log('✅ Admin password updated!');
      }
    }
    
    console.log('\n🎯 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAdmin();
