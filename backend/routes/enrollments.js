const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);
router.use(requireStaff);

// @route   GET /api/enrollments/archived
// @desc    Get all archived enrollments (MUST BE BEFORE /:id route)
router.get('/archived', async (req, res) => {
  try {
    const { student_id, academic_year, semester } = req.query;
    
    let query = `
      SELECT 
        e.*,
        s.student_number,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.course_code,
        c.course_name,
        c.units
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE (e.is_active = 0 OR e.is_active IS NULL)
    `;
    const params = [];

    if (student_id) {
      query += ' AND e.student_id = ?';
      params.push(student_id);
    }

    if (academic_year) {
      query += ' AND e.academic_year = ?';
      params.push(academic_year);
    }

    if (semester) {
      query += ' AND e.semester = ?';
      params.push(semester);
    }

    query += ' ORDER BY e.date_enrolled DESC';

    const result = await executeQuery(query, params);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch archived enrollments'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get archived enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/enrollments
// @desc    Get all enrollments
router.get('/', async (req, res) => {
  try {
    const { student_id, academic_year, semester } = req.query;
    
    let query = `
      SELECT 
        e.*,
        s.student_number,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.course_code,
        c.course_name,
        c.units
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE s.is_active = 1 AND (e.is_active = 1 OR e.is_active IS NULL)
    `;
    const params = [];

    if (student_id) {
      query += ' AND e.student_id = ?';
      params.push(student_id);
    }

    if (academic_year) {
      query += ' AND e.academic_year = ?';
      params.push(academic_year);
    }

    if (semester) {
      query += ' AND e.semester = ?';
      params.push(semester);
    }

    query += ' ORDER BY e.date_enrolled DESC';

    const result = await executeQuery(query, params);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/enrollments/:id
// @desc    Get single enrollment by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment ID'
      });
    }

    const query = `
      SELECT 
        e.*,
        s.student_number,
        s.first_name,
        s.middle_name,
        s.last_name,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.course_code,
        c.course_name,
        c.units
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.enrollment_id = ?
    `;

    const result = await executeQuery(query, [id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollment'
      });
    }

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/enrollments
// @desc    Create new enrollment
router.post('/', async (req, res) => {
  try {
    const { student_id, course_id, academic_year, semester, date_enrolled, status } = req.body;

    if (!student_id || !course_id || !academic_year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if enrollment already exists (only for active enrollments)
    const existing = await executeQuery(
      'SELECT enrollment_id FROM enrollments WHERE student_id = ? AND course_id = ? AND academic_year = ? AND semester = ? AND (is_active = 1 OR is_active IS NULL)',
      [student_id, course_id, academic_year, semester]
    );

    if (existing.success && existing.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course for the specified period'
      });
    }

    // Always use MySQL NOW() for accurate timestamp (server timezone)
    // This ensures the enrollment date is set to the exact moment of creation
    const result = await executeQuery(
      'INSERT INTO enrollments (student_id, course_id, academic_year, semester, date_enrolled, status, is_active) VALUES (?, ?, ?, ?, NOW(), ?, 1)',
      [student_id, course_id, academic_year, semester, status || 'Enrolled']
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create enrollment'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: { enrollment_id: result.data.insertId }
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/enrollments/:id
// @desc    Update enrollment
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment ID'
      });
    }

    const { student_id, course_id, academic_year, semester, date_enrolled, status } = req.body;

    // Check if enrollment exists
    const checkResult = await executeQuery(
      'SELECT enrollment_id FROM enrollments WHERE enrollment_id = ?',
      [id]
    );

    if (!checkResult.success || !checkResult.data || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (student_id !== undefined) {
      updateFields.push('student_id = ?');
      updateValues.push(student_id);
    }
    if (course_id !== undefined) {
      updateFields.push('course_id = ?');
      updateValues.push(course_id);
    }
    if (academic_year !== undefined) {
      updateFields.push('academic_year = ?');
      updateValues.push(academic_year);
    }
    if (semester !== undefined) {
      updateFields.push('semester = ?');
      updateValues.push(semester);
    }
    if (date_enrolled !== undefined) {
      updateFields.push('date_enrolled = ?');
      updateValues.push(date_enrolled);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    const updateQuery = `UPDATE enrollments SET ${updateFields.join(', ')} WHERE enrollment_id = ?`;
    const result = await executeQuery(updateQuery, updateValues);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update enrollment'
      });
    }

    res.json({
      success: true,
      message: 'Enrollment updated successfully'
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/enrollments/:id
// @desc    Archive enrollment (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment ID'
      });
    }

    // Check if enrollment exists and is active
    const checkResult = await executeQuery(
      'SELECT enrollment_id FROM enrollments WHERE enrollment_id = ? AND (is_active = 1 OR is_active IS NULL)',
      [id]
    );

    if (!checkResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!checkResult.data || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found or already archived'
      });
    }

    // Archive the enrollment (set is_active = 0)
    const result = await executeQuery(
      'UPDATE enrollments SET is_active = 0 WHERE enrollment_id = ?',
      [id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to archive enrollment'
      });
    }

    res.json({
      success: true,
      message: 'Enrollment archived successfully'
    });
  } catch (error) {
    console.error('Archive enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/enrollments/:id/restore
// @desc    Restore archived enrollment
router.put('/:id/restore', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment ID'
      });
    }

    // Check if enrollment exists and is archived
    const checkResult = await executeQuery(
      'SELECT enrollment_id FROM enrollments WHERE enrollment_id = ? AND (is_active = 0 OR is_active IS NULL)',
      [id]
    );

    if (!checkResult.success || !checkResult.data || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Archived enrollment not found'
      });
    }

    // Restore the enrollment (set is_active = 1)
    const result = await executeQuery(
      'UPDATE enrollments SET is_active = 1 WHERE enrollment_id = ?',
      [id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to restore enrollment'
      });
    }

    res.json({
      success: true,
      message: 'Enrollment restored successfully'
    });
  } catch (error) {
    console.error('Restore enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
