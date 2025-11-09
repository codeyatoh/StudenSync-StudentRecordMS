const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { executeQuery, getConnection } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireStaff);

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildFilters = ({ search, programId, yearLevel, enrollmentStatus, activeOnly }) => {
  const filters = [];
  const params = [];

  if (activeOnly === true) {
    filters.push('COALESCE(s.is_active, 1) = 1');
  }

  if (activeOnly === false) {
    filters.push('COALESCE(s.is_active, 0) = 0');
  }

  if (search) {
    const term = `%${search.trim()}%`;
    filters.push(`(
      s.student_number LIKE ?
      OR s.first_name LIKE ?
      OR s.last_name LIKE ?
      OR CONCAT(s.first_name, ' ', s.last_name) LIKE ?
    )`);
    params.push(term, term, term, term);
  }

  if (Number.isInteger(programId)) {
    filters.push('s.program_id = ?');
    params.push(programId);
  }

  if (Number.isInteger(yearLevel)) {
    filters.push('s.year_level = ?');
    params.push(yearLevel);
  }

  if (enrollmentStatus) {
    filters.push('s.enrollment_status = ?');
    params.push(enrollmentStatus);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  return { whereClause, params };
};

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/students');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});




// @route   GET /api/students/archived
// @desc    Get all archived students
// @access  Private (Staff+)
router.get('/archived', async (req, res) => {
  try {
    const pageNum = toPositiveInt(req.query.page, 1);
    const limitNum = Math.min(toPositiveInt(req.query.limit, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    const { whereClause, params } = buildFilters({
      search: req.query.search,
      programId: undefined,
      yearLevel: undefined,
      enrollmentStatus: undefined,
      activeOnly: false
    });

    const dataQuery = `
      SELECT 
        s.student_id,
        s.student_number,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.suffix,
        s.gender,
        s.year_level,
        s.enrollment_status,
        s.gpa,
        s.profile_picture_url,
        s.last_updated_at AS archived_at,
        p.program_name,
        p.program_code,
        m.major_name
      FROM students s
      LEFT JOIN programs p ON s.program_id = p.program_id
      LEFT JOIN majors m ON s.major_id = m.major_id
      ${whereClause || 'WHERE COALESCE(s.is_active, 0) = 0'}
      ORDER BY s.last_updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM students s
      ${whereClause || 'WHERE COALESCE(s.is_active, 0) = 0'}
    `;

    const [studentsResult, countResult] = await Promise.all([
      executeQuery(dataQuery, [...params, limitNum, offset]),
      executeQuery(countQuery, params)
    ]);

    if (!studentsResult.success || !countResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch archived students'
      });
    }

    const total = countResult.data?.[0]?.total || 0;

    res.json({
      success: true,
      data: {
        students: studentsResult.data,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get archived students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students
// @desc    Get all students with pagination and search
// @access  Private (Staff+)
router.get('/', async (req, res) => {
  try {
    const pageNum = toPositiveInt(req.query.page, 1);
    const limitNum = Math.min(toPositiveInt(req.query.limit, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    const programId = Number.isFinite(parseInt(req.query.program_id, 10)) ? parseInt(req.query.program_id, 10) : undefined;
    const yearLevel = Number.isFinite(parseInt(req.query.year_level, 10)) ? parseInt(req.query.year_level, 10) : undefined;

    const { whereClause, params } = buildFilters({
      search: req.query.search,
      programId,
      yearLevel,
      enrollmentStatus: req.query.enrollment_status,
      activeOnly: true
    });

    const dataQuery = `
      SELECT 
        s.student_id,
        s.student_number,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.suffix,
        s.gender,
        s.year_level,
        s.enrollment_status,
        s.gpa,
        s.profile_picture_url,
        s.program_id,
        s.major_id,
        p.program_name,
        p.program_code,
        m.major_name
      FROM students s
      LEFT JOIN programs p ON s.program_id = p.program_id
      LEFT JOIN majors m ON s.major_id = m.major_id
      ${whereClause || 'WHERE COALESCE(s.is_active, 1) = 1'}
      ORDER BY s.student_number ASC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM students s
      ${whereClause || 'WHERE COALESCE(s.is_active, 1) = 1'}
    `;

    const [studentsResult, countResult] = await Promise.all([
      executeQuery(dataQuery, [...params, limitNum, offset]),
      executeQuery(countQuery, params)
    ]);

    if (!studentsResult.success || !countResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch students'
      });
    }

    const total = countResult.data?.[0]?.total || 0;

    res.json({
      success: true,
      data: {
        students: studentsResult.data,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// @route   GET /api/students/:id
// @desc    Get single student by ID with all related data
// @access  Private (Staff+)
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Validate ID
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid student ID' 
      });
    }

    // Fetch student from database
    const studentResult = await executeQuery(
          'SELECT * FROM students WHERE student_id = ?',
      [id]
        );
        
    // Check if query succeeded
    if (!studentResult || !studentResult.success) {
      console.error('Database query failed:', studentResult?.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student data',
        error: process.env.NODE_ENV === 'development' ? (studentResult?.error || 'Unknown database error') : undefined
      });
    }

    // Check if student exists
    if (!studentResult.data || studentResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = studentResult.data[0];
    
    // Fetch related data
    let addresses = [];
    let contact_info = null;
    let guardians = [];

    // Fetch addresses
    try {
      const addressesResult = await executeQuery(
        'SELECT * FROM addresses WHERE student_id = ?',
        [id]
      );
      if (addressesResult && addressesResult.success && addressesResult.data) {
        addresses = addressesResult.data;
      }
    } catch (error) {
      console.error('Error fetching addresses:', error.message);
      // Continue without addresses
    }

    // Fetch contact info
    try {
      const contactResult = await executeQuery(
        'SELECT * FROM contact_info WHERE student_id = ?',
        [id]
      );
      if (contactResult && contactResult.success && contactResult.data && contactResult.data.length > 0) {
        contact_info = contactResult.data[0];
      }
    } catch (error) {
      console.error('Error fetching contact info:', error.message);
      // Continue without contact info
    }

    // Fetch guardians
    try {
      const guardiansResult = await executeQuery(
        'SELECT * FROM guardians WHERE student_id = ?',
        [id]
      );
      if (guardiansResult && guardiansResult.success && guardiansResult.data) {
        guardians = guardiansResult.data;
      }
    } catch (error) {
      console.error('Error fetching guardians:', error.message);
      // Continue without guardians
    }

    // Fetch program and major names if needed
    if (student.program_id) {
      try {
        const programResult = await executeQuery(
          'SELECT program_name, program_code FROM programs WHERE program_id = ?',
          [student.program_id]
        );
        if (programResult && programResult.success && programResult.data && programResult.data.length > 0) {
          student.program_name = programResult.data[0].program_name;
          student.program_code = programResult.data[0].program_code;
    }
  } catch (error) {
        console.error('Error fetching program:', error.message);
      }
    }
    
    if (student.major_id) {
      try {
        const majorResult = await executeQuery(
          'SELECT major_name FROM majors WHERE major_id = ?',
          [student.major_id]
        );
        if (majorResult && majorResult.success && majorResult.data && majorResult.data.length > 0) {
          student.major_name = majorResult.data[0].major_name;
        }
      } catch (error) {
        console.error('Error fetching major:', error.message);
      }
    }
    
    // Clean student object to ensure it's JSON serializable
    const cleanStudent = JSON.parse(JSON.stringify(student));
    
    // Combine all data
    const studentData = {
      ...cleanStudent,
      addresses: addresses || [],
      contact_info: contact_info || null,
      guardians: guardians || []
    };
    
    // Return successful response
    return res.status(200).json({
      success: true,
      data: studentData
    });
    
  } catch (error) {
    console.error('Error fetching student:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
        success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Staff+)
router.post('/', upload.single('profile_picture'), async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      // Personal Information
      student_number,
      first_name,
      middle_name,
      last_name,
      suffix,
      gender,
      citizenship,
      place_of_birth,
      religion,
      civil_status,
      
      // Academic Information
      program_id,
      major_id,
      year_level,
      academic_status,
      enrollment_status,
      date_of_admission,
      expected_graduation_date,
      scholarship_type,
      
      // Medical Information
      blood_type,
      known_allergies,
      medical_conditions,
      
      // Address Information (individual fields from FormData)
      current_street,
      current_city,
      current_province,
      current_zip_code,
      permanent_street,
      permanent_city,
      permanent_province,
      permanent_zip_code,
      
      // Contact Information (individual fields from FormData)
      school_email,
      alternate_email,
      mobile_phone,
      home_phone,
      
      // Guardian Information (individual fields from FormData)
      guardian_full_name,
      guardian_relationship,
      guardian_phone,
      guardian_email,
      guardian_address
    } = req.body;

    // Check if student number already exists
    const [existingStudent] = await connection.execute(
      'SELECT student_id FROM students WHERE student_number = ?',
      [student_number]
    );

    if (existingStudent.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Student number already exists'
      });
    }

    // Handle uploaded photo
    let profile_picture_url = null;
    if (req.file) {
      // Generate relative URL for the uploaded file
      profile_picture_url = `/uploads/students/${req.file.filename}`;
    }

    // Handle foreign key values - convert empty strings to null
    const cleanProgramId = program_id && program_id.trim() !== '' ? program_id : null;
    const cleanMajorId = major_id && major_id.trim() !== '' ? major_id : null;

    // Insert student
    const [studentResult] = await connection.execute(`
      INSERT INTO students (
        student_number, first_name, middle_name, last_name, suffix, gender,
        citizenship, place_of_birth, religion, civil_status, profile_picture_url,
        program_id, major_id, year_level, academic_status, enrollment_status,
        date_of_admission, expected_graduation_date, scholarship_type,
        blood_type, known_allergies, medical_conditions, last_updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_number, first_name, middle_name, last_name, suffix, gender,
      citizenship, place_of_birth, religion, civil_status, profile_picture_url,
      cleanProgramId, cleanMajorId, year_level, academic_status, enrollment_status,
      date_of_admission, expected_graduation_date, scholarship_type,
      blood_type, known_allergies, medical_conditions, req.user?.user_id || null
    ]);

    const studentId = studentResult.insertId;

    // Insert addresses
    // Current address
    if (current_street || current_city || current_province || current_zip_code) {
      await connection.execute(`
        INSERT INTO addresses (student_id, type, street, city, province, zip_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [studentId, 'current', current_street, current_city, current_province, current_zip_code]);
    }
    
    // Permanent address
    if (permanent_street || permanent_city || permanent_province || permanent_zip_code) {
      await connection.execute(`
        INSERT INTO addresses (student_id, type, street, city, province, zip_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [studentId, 'permanent', permanent_street, permanent_city, permanent_province, permanent_zip_code]);
    }

    // Insert contact info
    if (school_email || alternate_email || mobile_phone || home_phone) {
      // Use mobile_phone as primary phone_number, fallback to home_phone
      const phone_number = mobile_phone || home_phone;
      
      await connection.execute(`
        INSERT INTO contact_info (student_id, school_email, alternate_email, phone_number)
        VALUES (?, ?, ?, ?)
      `, [studentId, school_email, alternate_email, phone_number]);
    }

    // Insert guardian
    if (guardian_full_name || guardian_relationship || guardian_phone || guardian_email || guardian_address) {
      await connection.execute(`
        INSERT INTO guardians (student_id, guardian_full_name, guardian_relationship, guardian_phone_number, guardian_email, guardian_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [studentId, guardian_full_name, guardian_relationship, guardian_phone, guardian_email, guardian_address]);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        student_id: studentId,
        student_number
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create student error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Student number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Staff+)
router.put('/:id', upload.single('profile_picture'), async (req, res) => {
  const connection = await getConnection();
  
  try {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }
    
    
    // Check if student exists
    const [existingStudent] = await connection.execute(
      'SELECT student_id FROM students WHERE student_id = ? AND is_active = 1',
      [studentId]
    );

    if (existingStudent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await connection.beginTransaction();

    // Handle uploaded photo
    if (req.file) {
      // Generate relative URL for the uploaded file
      req.body.profile_picture_url = `/uploads/students/${req.file.filename}`;
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = [
      'first_name', 'middle_name', 'last_name', 'suffix', 'gender',
      'citizenship', 'place_of_birth', 'religion', 'civil_status', 'profile_picture_url',
      'program_id', 'major_id', 'year_level', 'academic_status', 'enrollment_status',
      'date_of_admission', 'expected_graduation_date', 'scholarship_type',
      'blood_type', 'known_allergies', 'medical_conditions'
    ];

    // Parse numeric fields
    const numericFields = ['program_id', 'major_id', 'year_level'];
    
    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        let value = req.body[field];
        
        // Handle empty strings - convert to null for optional fields
        if (value === '' || value === 'null' || value === 'undefined') {
          if (field === 'profile_picture_url') {
            // Don't update profile picture if empty string is sent
            continue;
          }
          value = null;
        }
        
        // Handle numeric fields
        if (numericFields.includes(field)) {
          value = value ? parseInt(value, 10) : null;
          if (isNaN(value)) value = null;
        }
        
        // Handle date fields - ensure they're in correct format or null
        if (field === 'date_of_admission' || field === 'expected_graduation_date') {
          if (!value || value === '') {
            value = null;
          }
        }
        
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length > 0) {
      // Only add last_updated_by if user is authenticated
      if (req.user && req.user.user_id) {
        updateFields.push('last_updated_by = ?');
        updateValues.push(req.user.user_id);
      }
      updateValues.push(studentId);

      const updateQuery = `
        UPDATE students 
        SET ${updateFields.join(', ')} 
        WHERE student_id = ?
      `;

      await connection.execute(updateQuery, updateValues);
    }

    // Handle related data updates
    const {
      // Address Information (individual fields from FormData)
      current_street,
      current_city,
      current_province,
      current_zip_code,
      permanent_street,
      permanent_city,
      permanent_province,
      permanent_zip_code,
      
      // Contact Information (individual fields from FormData)
      school_email,
      alternate_email,
      mobile_phone,
      home_phone,
      
      // Guardian Information (individual fields from FormData)
      guardian_full_name,
      guardian_relationship,
      guardian_phone,
      guardian_email,
      guardian_address
    } = req.body;

    // Update or insert addresses
    if (current_street || current_city || current_province || current_zip_code) {
      // Check if current address exists
      const [existingCurrentAddress] = await connection.execute(
        'SELECT * FROM addresses WHERE student_id = ? AND type = "current"',
        [studentId]
      );
      
      if (existingCurrentAddress.length > 0) {
        // Update existing current address
        await connection.execute(`
          UPDATE addresses 
          SET street = ?, city = ?, province = ?, zip_code = ?
          WHERE student_id = ? AND type = "current"
        `, [current_street || null, current_city || null, current_province || null, current_zip_code || null, studentId]);
      } else {
        // Insert new current address
        await connection.execute(`
          INSERT INTO addresses (student_id, type, street, city, province, zip_code)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [studentId, 'current', current_street || null, current_city || null, current_province || null, current_zip_code || null]);
      }
    }
    
    if (permanent_street || permanent_city || permanent_province || permanent_zip_code) {
      // Check if permanent address exists
      const [existingPermanentAddress] = await connection.execute(
        'SELECT * FROM addresses WHERE student_id = ? AND type = "permanent"',
        [studentId]
      );
      
      if (existingPermanentAddress.length > 0) {
        // Update existing permanent address
        await connection.execute(`
          UPDATE addresses 
          SET street = ?, city = ?, province = ?, zip_code = ?
          WHERE student_id = ? AND type = "permanent"
        `, [permanent_street || null, permanent_city || null, permanent_province || null, permanent_zip_code || null, studentId]);
      } else {
        // Insert new permanent address
        await connection.execute(`
          INSERT INTO addresses (student_id, type, street, city, province, zip_code)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [studentId, 'permanent', permanent_street || null, permanent_city || null, permanent_province || null, permanent_zip_code || null]);
      }
    }

    // Update or insert contact info
    if (school_email || alternate_email || mobile_phone || home_phone) {
      const phone_number = mobile_phone || home_phone || null;
      
      // Check if contact info exists
      const [existingContact] = await connection.execute(
        'SELECT * FROM contact_info WHERE student_id = ?',
        [studentId]
      );
      
      if (existingContact.length > 0) {
        // Update existing contact info
        await connection.execute(`
          UPDATE contact_info 
          SET school_email = ?, alternate_email = ?, phone_number = ?
          WHERE student_id = ?
        `, [school_email || null, alternate_email || null, phone_number, studentId]);
      } else {
        // Insert new contact info
        await connection.execute(`
          INSERT INTO contact_info (student_id, school_email, alternate_email, phone_number)
          VALUES (?, ?, ?, ?)
        `, [studentId, school_email || null, alternate_email || null, phone_number]);
      }
    }

    // Update or insert guardian
    if (guardian_full_name || guardian_relationship || guardian_phone || guardian_email || guardian_address) {
      // Check if guardian exists
      const [existingGuardian] = await connection.execute(
        'SELECT * FROM guardians WHERE student_id = ?',
        [studentId]
      );
      
      if (existingGuardian.length > 0) {
        // Update existing guardian
        await connection.execute(`
          UPDATE guardians 
          SET guardian_full_name = ?, guardian_relationship = ?, guardian_phone_number = ?, guardian_email = ?, guardian_address = ?
          WHERE student_id = ?
        `, [guardian_full_name || null, guardian_relationship || null, guardian_phone || null, guardian_email || null, guardian_address || null, studentId]);
      } else {
        // Insert new guardian
        await connection.execute(`
          INSERT INTO guardians (student_id, guardian_full_name, guardian_relationship, guardian_phone_number, guardian_email, guardian_address)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [studentId, guardian_full_name || null, guardian_relationship || null, guardian_phone || null, guardian_email || null, guardian_address || null]);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Student updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update student error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    connection.release();
  }
});

// @route   DELETE /api/students/:id
// @desc    Archive student (soft delete)
// @access  Private (Staff+)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if student exists and is active
    const checkResult = await executeQuery(
      'SELECT student_id, first_name, last_name FROM students WHERE student_id = ? AND (is_active = 1 OR is_active IS NULL)',
      [id]
    );

    if (!checkResult.success) {
      console.error('Database error checking student:', checkResult.error);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? checkResult.error : undefined
      });
    }

    if (!checkResult.data || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or already archived'
      });
    }

    const student = checkResult.data[0];

    // Archive the student (set is_active = 0 and add archived timestamp)
    const archiveResult = await executeQuery(
      'UPDATE students SET is_active = 0, last_updated_by = ?, last_updated_at = NOW() WHERE student_id = ?',
      [req.user?.user_id || null, id]
    );

    if (!archiveResult.success) {
      console.error('Database error archiving student:', archiveResult.error);
      console.error('Archive result:', archiveResult);
      return res.status(500).json({
        success: false,
        message: 'Failed to archive student',
        error: process.env.NODE_ENV === 'development' ? archiveResult.error : undefined
      });
    }

    // Check if update actually affected a row
    const affectedRows = archiveResult.data?.affectedRows || 0;
    if (affectedRows === 0) {
      console.warn('Archive update affected 0 rows - student might already be archived');
      return res.status(404).json({
        success: false,
        message: 'Student not found or already archived'
      });
    }

    res.json({
      success: true,
      message: `Student ${student.first_name} ${student.last_name} has been archived successfully`,
      data: {
        student_id: id,
        archived_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/students/:id/restore
// @desc    Restore archived student
// @access  Private (Staff+)
router.put('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if student exists and is archived
    const checkResult = await executeQuery(
      'SELECT student_id, first_name, last_name FROM students WHERE student_id = ? AND (is_active = 0 OR is_active IS NULL)',
      [id]
    );

    if (!checkResult.success) {
      console.error('Database error checking archived student:', checkResult.error);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? checkResult.error : undefined
      });
    }

    if (!checkResult.data || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Archived student not found'
      });
    }

    const student = checkResult.data[0];

    // Restore the student (set is_active = 1)
    const restoreResult = await executeQuery(
      'UPDATE students SET is_active = 1, last_updated_by = ?, last_updated_at = NOW() WHERE student_id = ?',
      [req.user?.user_id || null, id]
    );

    if (!restoreResult.success) {
      console.error('Database error restoring student:', restoreResult.error);
      console.error('Restore result:', restoreResult);
      return res.status(500).json({
        success: false,
        message: 'Failed to restore student',
        error: process.env.NODE_ENV === 'development' ? restoreResult.error : undefined
      });
    }

    // Check if update actually affected a row
    const affectedRows = restoreResult.data?.affectedRows || 0;
    if (affectedRows === 0) {
      console.warn('Restore update affected 0 rows - student might already be active');
      return res.status(404).json({
        success: false,
        message: 'Archived student not found or already restored'
      });
    }

    res.json({
      success: true,
      message: `Student ${student.first_name} ${student.last_name} has been restored successfully`,
      data: {
        student_id: id,
        restored_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Restore student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
