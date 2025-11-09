const mysql = require('mysql2/promise');
const { format } = require('mysql2');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sis_data',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Provide specific error guidance
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 MySQL server is not running. Please start MySQL service.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Access denied. Please check your username and password in .env file.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist. Run: npm run init-db to create it.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 Cannot resolve database host. Please check DB_HOST in .env file.');
    }
    
    return false;
  }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  let connection = null;
  try {
    // Validate inputs
    if (!query || typeof query !== 'string') {
      console.error('Invalid query provided:', query);
      return { success: false, error: 'Invalid query parameter' };
    }
    
    if (!Array.isArray(params)) {
      console.error('Invalid params provided, expected array:', params);
      params = [];
    }
    
    console.log('Executing query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    console.log('Query params:', params);
    
    // Get a connection from the pool to ensure it's active
    connection = await pool.getConnection();
    
    // Validate and sanitize parameters to prevent SQL injection
    if (params && params.length > 0) {
      // Validate each parameter
      for (let i = 0; i < params.length; i++) {
        const param = params[i];
        if (param === undefined || param === null) {
          continue; // Allow null/undefined
        }
        
        // If parameter is a string, check for dangerous SQL patterns
        if (typeof param === 'string') {
          const dangerousPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT|--|;|\/\*|\*\/)\b)/gi,
            /(OR\s+1\s*=\s*1|OR\s+'1'\s*=\s*'1')/gi,
            /(';?\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER))/gi
          ];
          
          for (const pattern of dangerousPatterns) {
            if (pattern.test(param)) {
              connection.release();
              console.error('Potential SQL injection detected in parameter:', param);
              throw new Error('Invalid input detected: potentially dangerous SQL pattern');
            }
          }
        }
      }
      
      // Format query with parameters (prevents SQL injection)
      // mysql2.format() properly escapes parameters
      const formattedQuery = format(query, params);
      
      // Execute the safely formatted query
      const result = await connection.query(formattedQuery);
      
      // Release connection back to pool
      connection.release();
      connection = null;
      
      return processQueryResult(result);
    } else {
      // No parameters - execute query directly (still validate query structure)
      if (query.toLowerCase().includes(';') && query.split(';').length > 2) {
        connection.release();
        throw new Error('Multiple statements detected - not allowed');
      }
      
      const result = await connection.query(query);
      
      // Release connection back to pool
      connection.release();
      connection = null;
      
      return processQueryResult(result);
    }
    
    function processQueryResult(result) {
    // result is an array: [rows, fields] from mysql2
    // Validate result structure
    if (!result) {
      console.error('Query returned null/undefined result');
      return { success: false, error: 'Query returned null result' };
    }
    
    if (!Array.isArray(result)) {
      console.error('Unexpected query result format (not array):', typeof result, result);
      return { success: false, error: 'Unexpected query result format' };
    }
    
    // mysql2 result is always [rows, fields], so result.length should be 2
    if (result.length < 2) {
      console.error('Unexpected query result structure, expected [rows, fields]:', result);
      return { success: false, error: 'Unexpected query result structure' };
    }
    
    const [rows, fields] = result;
    
      // Handle different query types:
      // SELECT queries return arrays of rows
      // UPDATE/INSERT/DELETE queries return ResultSetHeader objects
      // For UPDATE/INSERT/DELETE, rows is an object with affectedRows, insertId, etc.
      
      if (Array.isArray(rows)) {
        // SELECT query - rows is an array
        console.log('Query successful (SELECT), returned', rows.length, 'rows');
        return { success: true, data: rows };
      } else if (rows && typeof rows === 'object') {
        // UPDATE/INSERT/DELETE query - rows is ResultSetHeader object
        console.log('Query successful (UPDATE/INSERT/DELETE), affected rows:', rows.affectedRows || 0);
        // Return rows as data for UPDATE queries (contains affectedRows, insertId, etc.)
        return { success: true, data: rows };
      } else {
        // Unexpected format
        console.error('Unexpected rows format:', typeof rows, rows);
        return { success: false, error: 'Query returned unexpected result format' };
      }
    }
  } catch (error) {
    // Make sure to release connection if we got one
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
    
    console.error('=== Database Query Error ===');
    console.error('Query:', query);
    console.error('Params:', params);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error SQL state:', error.sqlState);
    console.error('Error SQL message:', error.sqlMessage);
    console.error('Error stack:', error.stack);
    console.error('===================');
    
    // Return detailed error for debugging
    const errorMessage = error.sqlMessage || error.message || String(error);
    return { 
      success: false, 
      error: errorMessage,
      errorCode: error.code,
      sqlState: error.sqlState
    };
  }
};

// Get connection for transactions
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    throw new Error(`Failed to get database connection: ${error.message}`);
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getConnection
};
