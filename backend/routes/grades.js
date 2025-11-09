const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { validate, gradeSchemas } = require('../middleware/validation');

const router = express.Router();
router.use(authenticateToken);
router.use(requireStaff);

// Helper function to calculate and update student GPA
const updateStudentGPA = async (studentId) => {
  try {
    // Get all grades for the student with course units
    const gradesQuery = `
      SELECT g.final_grade, g.remarks, c.units
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.enrollment_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.student_id = ? AND g.final_grade IS NOT NULL
    `;
    
    const gradesResult = await executeQuery(gradesQuery, [studentId]);
    
    if (!gradesResult.success || !gradesResult.data || gradesResult.data.length === 0) {
      console.log('No grades found for student, setting GPA to NULL');
      await executeQuery('UPDATE students SET gpa = NULL WHERE student_id = ?', [studentId]);
      return;
    }
    
    // Calculate weighted GPA (Philippine grading system)
    let totalGradePoints = 0;
    let totalUnits = 0;
    
    gradesResult.data.forEach(grade => {
      const finalGrade = parseFloat(grade.final_grade);
      const units = parseFloat(grade.units) || 3.0;
      
      // Only include passed courses in GPA
      if (grade.remarks === 'Passed' && finalGrade >= 75) {
        // Convert to GPA points (inverse mapping - higher grade = lower GPA)
        let gpaPoints = 0;
        if (finalGrade >= 97) gpaPoints = 1.00;
        else if (finalGrade >= 94) gpaPoints = 1.25;
        else if (finalGrade >= 91) gpaPoints = 1.50;
        else if (finalGrade >= 88) gpaPoints = 1.75;
        else if (finalGrade >= 85) gpaPoints = 2.00;
        else if (finalGrade >= 82) gpaPoints = 2.25;
        else if (finalGrade >= 79) gpaPoints = 2.50;
        else if (finalGrade >= 76) gpaPoints = 2.75;
        else if (finalGrade >= 75) gpaPoints = 3.00;
        
        totalGradePoints += (gpaPoints * units);
        totalUnits += units;
      }
    });
    
    // Calculate GPA
    const gpa = totalUnits > 0 ? parseFloat((totalGradePoints / totalUnits).toFixed(2)) : 0.00;
    
    // Update student GPA
    await executeQuery('UPDATE students SET gpa = ? WHERE student_id = ?', [gpa, studentId]);
    console.log(`Updated GPA for student ${studentId}: ${gpa}`);
  } catch (error) {
    console.error('Error updating student GPA:', error);
  }
};

// @route   GET /api/grades
// @desc    Get all grades
router.get('/', async (req, res) => {
  try {
    const { student_id, enrollment_id } = req.query;
    
    let query = `
      SELECT 
        g.*,
        e.academic_year,
        e.semester,
        s.student_number,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.course_code,
        c.course_name,
        c.units
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.enrollment_id
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE s.is_active = 1
    `;
    const params = [];

    if (student_id) {
      query += ' AND s.student_id = ?';
      params.push(student_id);
    }

    if (enrollment_id) {
      query += ' AND g.enrollment_id = ?';
      params.push(enrollment_id);
    }

    query += ' ORDER BY g.date_recorded DESC';

    const result = await executeQuery(query, params);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch grades'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/grades
// @desc    Create new grade
router.post('/', validate(gradeSchemas.create), async (req, res) => {
  try {
    const { enrollment_id, midterm_grade, final_grade, remarks } = req.body;

    // Check if grade already exists for this enrollment
    const existing = await executeQuery(
      'SELECT grade_id FROM grades WHERE enrollment_id = ?',
      [enrollment_id]
    );

    if (existing.success && existing.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists for this enrollment'
      });
    }

    const result = await executeQuery(
      'INSERT INTO grades (enrollment_id, midterm_grade, final_grade, remarks) VALUES (?, ?, ?, ?)',
      [enrollment_id, midterm_grade, final_grade, remarks]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create grade'
      });
    }

    // Update student GPA after creating grade
    const enrollmentQuery = await executeQuery(
      'SELECT student_id FROM enrollments WHERE enrollment_id = ?',
      [enrollment_id]
    );
    
    if (enrollmentQuery.success && enrollmentQuery.data.length > 0) {
      const studentId = enrollmentQuery.data[0].student_id;
      await updateStudentGPA(studentId);
    }

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: { grade_id: result.data.insertId }
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/grades/:id
// @desc    Get single grade by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        g.*,
        e.academic_year,
        e.semester,
        s.student_number,
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.course_code,
        c.course_name,
        c.units
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.enrollment_id
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE g.grade_id = ?
    `;

    const result = await executeQuery(query, [id]);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch grade'
      });
    }

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/grades/:id
// @desc    Update grade
router.put('/:id', validate(gradeSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const { midterm_grade, final_grade, remarks } = req.body;

    const result = await executeQuery(
      'UPDATE grades SET midterm_grade = ?, final_grade = ?, remarks = ? WHERE grade_id = ?',
      [midterm_grade, final_grade, remarks, id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update grade'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Update student GPA after updating grade
    const enrollmentQuery = await executeQuery(
      'SELECT e.student_id FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE g.grade_id = ?',
      [id]
    );
    
    if (enrollmentQuery.success && enrollmentQuery.data.length > 0) {
      const studentId = enrollmentQuery.data[0].student_id;
      await updateStudentGPA(studentId);
    }

    res.json({
      success: true,
      message: 'Grade updated successfully'
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/grades/:id
// @desc    Delete grade
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get student_id before deleting to update GPA
    const enrollmentQuery = await executeQuery(
      'SELECT e.student_id FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE g.grade_id = ?',
      [id]
    );

    const result = await executeQuery(
      'DELETE FROM grades WHERE grade_id = ?',
      [id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete grade'
      });
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Update student GPA after deleting grade
    if (enrollmentQuery.success && enrollmentQuery.data.length > 0) {
      const studentId = enrollmentQuery.data[0].student_id;
      await updateStudentGPA(studentId);
    }

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
