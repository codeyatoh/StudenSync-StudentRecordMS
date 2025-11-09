const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { validate, userSchemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(userSchemas.login), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const result = await executeQuery(
      'SELECT user_id, username, password_hash, role FROM users WHERE username = ?',
      [username]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (result.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.data[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (Admin only)
// @access  Private (Admin)
router.post('/register', authenticateToken, validate(userSchemas.create), async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create new users'
      });
    }

    const { username, password, role = 'Staff' } = req.body;

    // Check if username already exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (!existingUser.success) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (existingUser.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
        id: result.data.insertId,
        username,
        role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT user_id, username, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.data[0];
    res.json({
      success: true,
      data: {
        id: user.user_id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user
    const userResult = await executeQuery(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.data[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updateResult = await executeQuery(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, req.user.user_id]
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a production system, you would invalidate the token in a token blacklist
    // For now, we'll just verify the token exists and return success
    // The frontend will clear the token from localStorage
    
    // Log the logout event
    console.log(`User ${req.user.username} (ID: ${req.user.user_id}) logged out`);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
