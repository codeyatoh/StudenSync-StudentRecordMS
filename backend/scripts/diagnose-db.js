const { executeQuery, testConnection } = require('../config/database');
require('dotenv').config();

async function diagnoseDatabase() {
  console.log('🔍 Starting Database Diagnosis...\n');
  
  try {
    // Test connection
    console.log('1. Testing database connection...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database. Please check your database configuration.');
      return;
    }
    console.log('✅ Database connection successful\n');
    
    // Check if database exists
    console.log('2. Checking database...');
    const dbCheck = await executeQuery('SELECT DATABASE() as db_name');
    if (dbCheck.success && dbCheck.data && dbCheck.data.length > 0) {
      console.log(`✅ Current database: ${dbCheck.data[0].db_name || 'N/A'}\n`);
    }
    
    // Check if tables exist
    console.log('3. Checking required tables...');
    const requiredTables = ['users', 'programs', 'majors', 'students', 'addresses', 'contact_info', 'guardians'];
    
    for (const tableName of requiredTables) {
      const tableCheck = await executeQuery(`SHOW TABLES LIKE '${tableName}'`);
      if (tableCheck.success && tableCheck.data && tableCheck.data.length > 0) {
        console.log(`✅ Table '${tableName}' exists`);
        
        // Get table structure
        const structure = await executeQuery(`DESCRIBE ${tableName}`);
        if (structure.success) {
          console.log(`   Columns: ${structure.data.length}`);
        }
      } else {
        console.log(`❌ Table '${tableName}' DOES NOT EXIST`);
      }
    }
    console.log('');
    
    // Check if student ID 2 exists
    console.log('4. Checking student with ID 2...');
    const studentCheck = await executeQuery('SELECT * FROM students WHERE student_id = ?', [2]);
    if (studentCheck.success) {
      if (studentCheck.data && studentCheck.data.length > 0) {
        console.log('✅ Student ID 2 exists');
        const student = studentCheck.data[0];
        console.log(`   Student Number: ${student.student_number}`);
        console.log(`   Name: ${student.first_name} ${student.last_name}`);
        console.log(`   Program ID: ${student.program_id || 'NULL'}`);
        console.log(`   Major ID: ${student.major_id || 'NULL'}`);
        
        // Check related data
        console.log('\n5. Checking related data for student ID 2...');
        
        // Check addresses
        const addressesCheck = await executeQuery('SELECT * FROM addresses WHERE student_id = ?', [2]);
        if (addressesCheck.success) {
          console.log(`   Addresses: ${addressesCheck.data ? addressesCheck.data.length : 0} found`);
          if (addressesCheck.data && addressesCheck.data.length > 0) {
            addressesCheck.data.forEach(addr => {
              console.log(`     - ${addr.type}: ${addr.street || 'N/A'}, ${addr.city || 'N/A'}`);
            });
          }
        } else {
          console.log(`   ❌ Error fetching addresses: ${addressesCheck.error}`);
        }
        
        // Check contact info
        const contactCheck = await executeQuery('SELECT * FROM contact_info WHERE student_id = ?', [2]);
        if (contactCheck.success) {
          console.log(`   Contact Info: ${contactCheck.data && contactCheck.data.length > 0 ? 'Found' : 'None'}`);
          if (contactCheck.data && contactCheck.data.length > 0) {
            const contact = contactCheck.data[0];
            console.log(`     - School Email: ${contact.school_email || 'N/A'}`);
            console.log(`     - Phone: ${contact.phone_number || 'N/A'}`);
          }
        } else {
          console.log(`   ❌ Error fetching contact info: ${contactCheck.error}`);
        }
        
        // Check guardians
        const guardiansCheck = await executeQuery('SELECT * FROM guardians WHERE student_id = ?', [2]);
        if (guardiansCheck.success) {
          console.log(`   Guardians: ${guardiansCheck.data ? guardiansCheck.data.length : 0} found`);
        } else {
          console.log(`   ❌ Error fetching guardians: ${guardiansCheck.error}`);
        }
        
        // Test the exact query used in the route
        console.log('\n6. Testing the exact route query...');
        const routeQuery = await executeQuery('SELECT * FROM students WHERE student_id = ?', [2]);
        if (routeQuery.success) {
          console.log('✅ Route query successful');
          console.log(`   Rows returned: ${routeQuery.data ? routeQuery.data.length : 0}`);
          
          if (routeQuery.data && routeQuery.data.length > 0) {
            const studentData = routeQuery.data[0];
            console.log('   Student data keys:', Object.keys(studentData));
            
            // Try to serialize
            try {
              JSON.stringify(studentData);
              console.log('✅ Student data is JSON serializable');
            } catch (serializeError) {
              console.log(`❌ Student data serialization failed: ${serializeError.message}`);
            }
          }
        } else {
          console.log(`❌ Route query failed: ${routeQuery.error}`);
          console.log(`   Error Code: ${routeQuery.errorCode}`);
          console.log(`   SQL State: ${routeQuery.sqlState}`);
        }
        
      } else {
        console.log('❌ Student ID 2 does NOT exist in database');
        console.log('   Total students in database:');
        const countCheck = await executeQuery('SELECT COUNT(*) as count FROM students');
        if (countCheck.success && countCheck.data) {
          console.log(`   ${countCheck.data[0].count || 0} students found`);
        }
      }
    } else {
      console.log(`❌ Error checking student: ${studentCheck.error}`);
      console.log(`   Error Code: ${studentCheck.errorCode}`);
      console.log(`   SQL State: ${studentCheck.sqlState}`);
    }
    
    // Test foreign key relationships
    console.log('\n7. Testing foreign key relationships...');
    if (studentCheck.success && studentCheck.data && studentCheck.data.length > 0) {
      const student = studentCheck.data[0];
      
      if (student.program_id) {
        const programCheck = await executeQuery('SELECT * FROM programs WHERE program_id = ?', [student.program_id]);
        if (programCheck.success && programCheck.data && programCheck.data.length > 0) {
          console.log(`✅ Program ID ${student.program_id} exists: ${programCheck.data[0].program_name}`);
        } else {
          console.log(`⚠️  Program ID ${student.program_id} NOT FOUND (foreign key issue)`);
        }
      }
      
      if (student.major_id) {
        const majorCheck = await executeQuery('SELECT * FROM majors WHERE major_id = ?', [student.major_id]);
        if (majorCheck.success && majorCheck.data && majorCheck.data.length > 0) {
          console.log(`✅ Major ID ${student.major_id} exists: ${majorCheck.data[0].major_name}`);
        } else {
          console.log(`⚠️  Major ID ${student.major_id} NOT FOUND (foreign key issue)`);
        }
      }
    }
    
    console.log('\n✅ Database diagnosis completed!');
    
  } catch (error) {
    console.error('\n❌ Diagnosis error:', error);
    console.error('Error stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

diagnoseDatabase();

