const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);
router.use(requireStaff);

// @route   GET /api/majors
// @desc    Get all majors
router.get('/', async (req, res) => {
  try {
    const { program_id } = req.query;

    const columnsCheck = await executeQuery(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'majors'
    `, []);

    const columnNames = columnsCheck.success ? columnsCheck.data.map(col => col.COLUMN_NAME) : [];
    const hasCodeColumn = columnNames.includes('major_code');
    const hasDescColumn = columnNames.includes('description');
    const hasActiveColumn = columnNames.includes('is_active');

    const selectColumns = [
      'm.major_id',
      'm.major_name',
      'm.program_id',
      'p.program_name',
      'p.program_code'
    ];

    if (hasCodeColumn) selectColumns.push('m.major_code');
    if (hasDescColumn) selectColumns.push('m.description');
    if (hasActiveColumn) selectColumns.push('m.is_active');

    let query = `
      SELECT ${selectColumns.join(', ')}
      FROM majors m
      LEFT JOIN programs p ON m.program_id = p.program_id
    `;

    const params = [];
    if (program_id) {
      query += ' WHERE m.program_id = ?';
      params.push(program_id);
    }

    query += ' ORDER BY m.major_name';

    const result = await executeQuery(query, params);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch majors'
      });
    }

    const majorsWithDefaults = result.data.map(major => ({
      ...major,
      major_code: hasCodeColumn ? (major.major_code || '') : '',
      description: hasDescColumn ? (major.description || '') : '',
      is_active: hasActiveColumn ? major.is_active : 1
    }));

    res.json({
      success: true,
      data: majorsWithDefaults
    });
  } catch (error) {
    console.error('Get majors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/majors/:id
// @desc    Get single major by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT m.*, p.program_name, p.program_code
      FROM majors m
      LEFT JOIN programs p ON m.program_id = p.program_id
      WHERE m.major_id = ?
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
        message: 'Major not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });
  } catch (error) {
    console.error('Get major error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/majors
// @desc    Create new major
router.post('/', async (req, res) => {
  try {
    const {
      major_name,
      major_code,
      program_id,
      description,
      is_active = true
    } = req.body;

    // Validate required fields
    if (!major_name || !major_code) {
      return res.status(400).json({
        success: false,
        message: 'Major name and code are required'
      });
    }

    // Check if major code already exists
    const checkQuery = 'SELECT major_id FROM majors WHERE major_code = ?';
    const checkResult = await executeQuery(checkQuery, [major_code]);

    if (checkResult.success && checkResult.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Major code already exists'
      });
    }

    // Check existing columns to build a compatible INSERT
    const columnsCheck = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'majors'
    `, []);

    const columnNames = (columnsCheck.success ? columnsCheck.data.map(c => c.COLUMN_NAME) : []);
    const hasMajorCode = columnNames.includes('major_code');
    const hasDescription = columnNames.includes('description');
    const hasIsActive = columnNames.includes('is_active');
    const hasCreatedBy = columnNames.includes('created_by');

    const fields = ['major_name'];
    const values = [major_name];
    const placeholders = ['?'];

    if (hasMajorCode) { fields.push('major_code'); values.push(major_code); placeholders.push('?'); }
    if (columnNames.includes('program_id')) { fields.push('program_id'); values.push(program_id || null); placeholders.push('?'); }
    if (hasDescription) { fields.push('description'); values.push(description || null); placeholders.push('?'); }
    if (hasIsActive) { fields.push('is_active'); values.push(is_active); placeholders.push('?'); }
    if (hasCreatedBy) { fields.push('created_by'); values.push(req.user.user_id); placeholders.push('?'); }

    const insertQuery = `
      INSERT INTO majors (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;

    const result = await executeQuery(insertQuery, values);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create major'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Major created successfully',
      data: { major_id: (result.data && result.data.insertId) || result.insertId }
    });
  } catch (error) {
    console.error('Create major error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/majors/:id
// @desc    Update major
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      major_name,
      major_code,
      program_id,
      description,
      is_active
    } = req.body;

    // Check if major exists
    const checkQuery = 'SELECT major_id FROM majors WHERE major_id = ?';
    const checkResult = await executeQuery(checkQuery, [id]);

    if (!checkResult.success || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Major not found'
      });
    }

    // Check if major code already exists (excluding current major)
    if (major_code) {
      const codeCheckQuery = 'SELECT major_id FROM majors WHERE major_code = ? AND major_id != ?';
      const codeCheckResult = await executeQuery(codeCheckQuery, [major_code, id]);

      if (codeCheckResult.success && codeCheckResult.data.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Major code already exists'
        });
      }
    }

    // Check existing columns to build a compatible UPDATE
    const columnsCheck = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'majors'
    `, []);
    const columnNames = (columnsCheck.success ? columnsCheck.data.map(c => c.COLUMN_NAME) : []);

    // Build dynamic update query using only present columns
    const updateFields = [];
    const updateValues = [];

    if (major_name !== undefined) {
      updateFields.push('major_name = ?');
      updateValues.push(major_name);
    }
    if (major_code !== undefined && columnNames.includes('major_code')) {
      updateFields.push('major_code = ?');
      updateValues.push(major_code);
    }
    if (program_id !== undefined && columnNames.includes('program_id')) {
      updateFields.push('program_id = ?');
      updateValues.push(program_id || null);
    }
    if (description !== undefined && columnNames.includes('description')) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (is_active !== undefined && columnNames.includes('is_active')) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    if (columnNames.includes('last_updated_by')) {
      updateFields.push('last_updated_by = ?');
      updateValues.push(req.user.user_id);
    }
    updateValues.push(id);

    const updateQuery = `
      UPDATE majors 
      SET ${updateFields.join(', ')} 
      WHERE major_id = ?
    `;

    const result = await executeQuery(updateQuery, updateValues);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update major'
      });
    }

    res.json({
      success: true,
      message: 'Major updated successfully'
    });
  } catch (error) {
    console.error('Update major error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/majors/:id
// @desc    Delete major (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if major exists
    const checkQuery = 'SELECT major_id FROM majors WHERE major_id = ?';
    const checkResult = await executeQuery(checkQuery, [id]);

    if (!checkResult.success || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Major not found'
      });
    }

    // Check if major is being used by students
    const usageQuery = 'SELECT COUNT(*) as count FROM students WHERE major_id = ? AND is_active = 1';
    const usageResult = await executeQuery(usageQuery, [id]);

    if (usageResult.success && usageResult.data[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete major that is assigned to active students'
      });
    }

    // Determine if soft-delete is supported
    const columnsCheck = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'majors'
    `, []);
    const columnNames = (columnsCheck.success ? columnsCheck.data.map(c => c.COLUMN_NAME) : []);
    let result;

    if (columnNames.includes('is_active')) {
      // Soft delete - set is_active to false
      const deleteQuery = `
        UPDATE majors 
        SET is_active = false${columnNames.includes('last_updated_by') ? ', last_updated_by = ?' : ''}
        WHERE major_id = ?
      `;
      const params = columnNames.includes('last_updated_by') ? [req.user.user_id, id] : [id];
      result = await executeQuery(deleteQuery, params);
    } else {
      // Hard delete fallback if is_active column does not exist
      result = await executeQuery('DELETE FROM majors WHERE major_id = ?', [id]);
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete major'
      });
    }

    res.json({
      success: true,
      message: 'Major deleted successfully'
    });
  } catch (error) {
    console.error('Delete major error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
