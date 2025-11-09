const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { validate, courseSchemas } = require('../middleware/validation');

const router = express.Router();
router.use(authenticateToken);
router.use(requireStaff);

// @route   GET /api/courses
// @desc    Get all courses
router.get('/', async (req, res) => {
  try {
    const { program_id, semester, year_level } = req.query;

    let query = `
      SELECT c.*, p.program_name, p.program_code
      FROM courses c
      LEFT JOIN programs p ON c.program_id = p.program_id
      WHERE 1=1
    `;
    const params = [];

    if (program_id) {
      query += ' AND c.program_id = ?';
      params.push(program_id);
    }

    if (semester) {
      query += ' AND c.semester = ?';
      params.push(semester);
    }

    if (year_level) {
      query += ' AND c.year_level = ?';
      params.push(year_level);
    }

    query += ' ORDER BY c.course_code';
    const result = await executeQuery(query, params);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courses'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
router.post('/', validate(courseSchemas.create), async (req, res) => {
  try {
    const { program_id, course_code, course_name, units, semester, year_level } = req.body;

    const result = await executeQuery(
      'INSERT INTO courses (program_id, course_code, course_name, units, semester, year_level) VALUES (?, ?, ?, ?, ?, ?)',
      [program_id, course_code, course_name, units, semester, year_level]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create course'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course_id: result.data.insertId }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course (only DB-backed fields)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { program_id, course_code, course_name, units, semester, year_level } = req.body;

    // Ensure course exists
    const exists = await executeQuery('SELECT course_id FROM courses WHERE course_id = ?', [id]);
    if (!exists.success || exists.data.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Build dynamic update based on provided fields
    const updateFields = [];
    const updateValues = [];
    if (program_id !== undefined) { updateFields.push('program_id = ?'); updateValues.push(program_id || null); }
    if (course_code !== undefined) { updateFields.push('course_code = ?'); updateValues.push(course_code); }
    if (course_name !== undefined) { updateFields.push('course_name = ?'); updateValues.push(course_name); }
    if (units !== undefined) { updateFields.push('units = ?'); updateValues.push(units); }
    if (semester !== undefined) { updateFields.push('semester = ?'); updateValues.push(semester); }
    if (year_level !== undefined) { updateFields.push('year_level = ?'); updateValues.push(year_level || null); }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateValues.push(id);
    const updateQuery = `UPDATE courses SET ${updateFields.join(', ')} WHERE course_id = ?`;
    const result = await executeQuery(updateQuery, updateValues);

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to update course' });
    }

    res.json({ success: true, message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course (hard delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure course exists
    const exists = await executeQuery('SELECT course_id FROM courses WHERE course_id = ?', [id]);
    if (!exists.success || exists.data.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const result = await executeQuery('DELETE FROM courses WHERE course_id = ?', [id]);
    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to delete course' });
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
