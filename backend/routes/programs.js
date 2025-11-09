const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { validate, programSchemas } = require('../middleware/validation');

const router = express.Router();
router.use(authenticateToken);
router.use(requireStaff);

// @route   GET /api/programs
// @desc    Get all active programs
// @access  Private (Staff+)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        COUNT(s.student_id) as student_count
      FROM programs p
      LEFT JOIN students s ON p.program_id = s.program_id AND s.is_active = 1
      WHERE p.is_active = 1
      GROUP BY p.program_id
      ORDER BY p.program_name ASC
    `;

    const result = await executeQuery(query);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch programs'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/programs/:id
// @desc    Get single program by ID
// @access  Private (Staff+)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        COUNT(s.student_id) as student_count
      FROM programs p
      LEFT JOIN students s ON p.program_id = s.program_id AND s.is_active = 1
      WHERE p.program_id = ? AND p.is_active = 1
      GROUP BY p.program_id
    `;

    const result = await executeQuery(query, [id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/programs
// @desc    Create new program
// @access  Private (Staff+)
router.post('/', validate(programSchemas.create), async (req, res) => {
  try {
    const { program_name, program_code, degree_type } = req.body;

    // Check if program code already exists (including archived ones)
    const existingProgram = await executeQuery(
      'SELECT program_id FROM programs WHERE program_code = ?',
      [program_code]
    );

    if (!existingProgram.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (existingProgram.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Program code already exists'
      });
    }

    const result = await executeQuery(
      'INSERT INTO programs (program_name, program_code, degree_type, is_active, last_updated_by) VALUES (?, ?, ?, 1, ?)',
      [program_name, program_code, degree_type, req.user?.user_id || null]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create program'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: {
        program_id: result.data.insertId,
        program_name,
        program_code,
        degree_type
      }
    });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/programs/:id
// @desc    Update program
// @access  Private (Staff+)
router.put('/:id', validate(programSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if program exists and is active
    const existingProgram = await executeQuery(
      'SELECT program_id FROM programs WHERE program_id = ? AND is_active = 1',
      [id]
    );

    if (!existingProgram.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (existingProgram.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['program_name', 'program_code', 'degree_type'];

    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        updateValues.push(req.body[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Add last_updated_by and last_updated_at
    updateFields.push('last_updated_by = ?', 'last_updated_at = NOW()');
    updateValues.push(req.user?.user_id || null, id);

    const updateQuery = `
      UPDATE programs 
      SET ${updateFields.join(', ')} 
      WHERE program_id = ?
    `;

    const result = await executeQuery(updateQuery, updateValues);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update program'
      });
    }

    res.json({
      success: true,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/programs/:id
// @desc    Archive program (soft delete)
// @access  Private (Staff+)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists and is active
    const existingProgram = await executeQuery(
      'SELECT program_id, program_name FROM programs WHERE program_id = ? AND is_active = 1',
      [id]
    );

    if (!existingProgram.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (existingProgram.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found or already archived'
      });
    }

    const program = existingProgram.data[0];

    // Check if program has active students
    const studentsCheck = await executeQuery(
      'SELECT COUNT(*) as count FROM students WHERE program_id = ? AND is_active = 1',
      [id]
    );

    if (!studentsCheck.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (studentsCheck.data[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot archive program with enrolled students'
      });
    }

    // Archive the program (soft delete)
    const result = await executeQuery(
      'UPDATE programs SET is_active = 0, last_updated_by = ?, last_updated_at = NOW() WHERE program_id = ?',
      [req.user?.user_id || null, id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to archive program'
      });
    }

    res.json({
      success: true,
      message: `Program "${program.program_name}" has been archived successfully`
    });
  } catch (error) {
    console.error('Archive program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/programs/archived
// @desc    Get all archived programs
// @access  Private (Staff+)
router.get('/archived', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        COUNT(s.student_id) as student_count
      FROM programs p
      LEFT JOIN students s ON p.program_id = s.program_id AND s.is_active = 1
      WHERE p.is_active = 0
      GROUP BY p.program_id
      ORDER BY p.last_updated_at DESC
    `;

    const result = await executeQuery(query);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch archived programs'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get archived programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/programs/:id/restore
// @desc    Restore archived program
// @access  Private (Staff+)
router.put('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists and is archived
    const existingProgram = await executeQuery(
      'SELECT program_id, program_name FROM programs WHERE program_id = ? AND is_active = 0',
      [id]
    );

    if (!existingProgram.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (existingProgram.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Archived program not found'
      });
    }

    const program = existingProgram.data[0];

    // Restore the program
    const result = await executeQuery(
      'UPDATE programs SET is_active = 1, last_updated_by = ?, last_updated_at = NOW() WHERE program_id = ?',
      [req.user?.user_id || null, id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to restore program'
      });
    }

    res.json({
      success: true,
      message: `Program "${program.program_name}" has been restored successfully`
    });
  } catch (error) {
    console.error('Restore program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
