const express = require('express');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT user_id, username, role, created_at FROM users WHERE (is_active = 1 OR is_active IS NULL) ORDER BY created_at DESC'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'SELECT user_id, username, role, created_at FROM users WHERE user_id = ? AND (is_active = 1 OR is_active IS NULL)',
      [id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }

    if (result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', requireAdmin, validate(userSchemas.create), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if username already exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.success && existingUser.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await executeQuery(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user_id: result.data.insertId,
        username,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', requireAdmin, validate(userSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE user_id = ? AND (is_active = 1 OR is_active IS NULL)',
      [id]
    );

    if (!existingUser.success || existingUser.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }

    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    const result = await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Archive user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot archive your own account'
      });
    }

    // Ensure user exists and is active
    const check = await executeQuery(
      'SELECT user_id, username FROM users WHERE user_id = ? AND (is_active = 1 OR is_active IS NULL)',
      [id]
    );

    if (!check.success) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!check.data || check.data.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found or already archived' });
    }

    // Soft delete
    const result = await executeQuery(
      'UPDATE users SET is_active = 0 WHERE user_id = ?',
      [id]
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to archive user' });
    }

    res.json({ success: true, message: 'User archived successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/archived
// @desc    Get archived users
// @access  Private (Admin only)
router.get('/archived/list', requireAdmin, async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT user_id, username, role, created_at FROM users WHERE is_active = 0 ORDER BY created_at DESC'
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to fetch archived users' });
    }

    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Get archived users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/restore
// @desc    Restore archived user
// @access  Private (Admin only)
router.put('/:id/restore', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const check = await executeQuery(
      'SELECT user_id FROM users WHERE user_id = ? AND is_active = 0',
      [id]
    );

    if (!check.success) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!check.data || check.data.length === 0) {
      return res.status(404).json({ success: false, message: 'Archived user not found' });
    }

    const result = await executeQuery(
      'UPDATE users SET is_active = 1 WHERE user_id = ?',
      [id]
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to restore user' });
    }

    res.json({ success: true, message: 'User restored successfully' });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
