const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get total students count
    const studentsResult = await executeQuery(
      'SELECT COUNT(*) as total FROM students WHERE is_active = 1 AND enrollment_status != "Dropped"'
    );
    
    // Get active courses count
    const coursesResult = await executeQuery(
      'SELECT COUNT(*) as total FROM courses'
    );
    
    // Get programs count
    const programsResult = await executeQuery(
      'SELECT COUNT(*) as total FROM programs'
    );
    
    // Get majors count
    const majorsResult = await executeQuery(
      'SELECT COUNT(*) as total FROM majors WHERE is_active = 1'
    );
    
    // Get total enrollments count (only active)
    const enrollmentsResult = await executeQuery(
      'SELECT COUNT(*) as total FROM enrollments WHERE (is_active = 1 OR is_active IS NULL)'
    );
    
    // Get recent enrollments for percentage calculation (only active)
    const recentEnrollmentsResult = await executeQuery(
      'SELECT COUNT(*) as total FROM enrollments WHERE date_enrolled >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND (is_active = 1 OR is_active IS NULL)'
    );
    
    // Get recent students for percentage calculation
    const recentStudentsResult = await executeQuery(
      'SELECT COUNT(*) as total FROM students WHERE last_updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND is_active = 1'
    );
    
    // Check if all queries were successful and log specific failures
    if (!studentsResult.success) {
      console.error('Students query failed:', studentsResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch students statistics',
        error: studentsResult.error
      });
    }
    
    if (!coursesResult.success) {
      console.error('Courses query failed:', coursesResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courses statistics',
        error: coursesResult.error
      });
    }
    
    if (!programsResult.success) {
      console.error('Programs query failed:', programsResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch programs statistics',
        error: programsResult.error
      });
    }
    
    if (!majorsResult.success) {
      console.error('Majors query failed:', majorsResult.error);
      // Don't fail the entire dashboard if majors table doesn't exist yet
      console.warn('Majors table may not exist, continuing without majors statistics');
    }
    
    if (!enrollmentsResult.success) {
      console.error('Enrollments query failed:', enrollmentsResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments statistics',
        error: enrollmentsResult.error
      });
    }
    
    const totalStudents = studentsResult.data[0]?.total || 0;
    const totalCourses = coursesResult.data[0]?.total || 0;
    const totalPrograms = programsResult.data[0]?.total || 0;
    const totalMajors = majorsResult.success ? (majorsResult.data[0]?.total || 0) : 0;
    const totalEnrollments = enrollmentsResult.data[0]?.total || 0;
    const recentEnrollments = recentEnrollmentsResult.success ? recentEnrollmentsResult.data[0]?.total || 0 : 0;
    const recentStudents = recentStudentsResult.success ? recentStudentsResult.data[0]?.total || 0 : 0;
    
    // Calculate percentage changes (simplified calculation)
    const studentChange = totalStudents > 0 ? Math.round((recentStudents / totalStudents) * 100) : 0;
    const enrollmentChange = totalEnrollments > 0 ? Math.round((recentEnrollments / totalEnrollments) * 100) : 0;
    
    const stats = [
      {
        label: 'Total Students',
        value: totalStudents.toLocaleString(),
        change: `+${studentChange}%`,
        icon: 'UsersIcon',
        color: 'Blue'
      },
      {
        label: 'Programs',
        value: totalPrograms.toString(),
        change: '+1%',
        icon: 'GraduationCapIcon',
        color: 'Purple'
      }
    ];

    // Only add Majors if the query was successful
    if (majorsResult.success) {
      stats.push({
        label: 'Majors',
        value: totalMajors.toString(),
        change: '+2%',
        icon: 'BrainCircuitIcon',
        color: 'Indigo'
      });
    }

    // Add remaining stats
    stats.push(
      {
        label: 'Active Courses',
        value: totalCourses.toString(),
        change: '+3%',
        icon: 'BookOpenIcon',
        color: 'Green'
      },
      {
        label: 'Enrollments',
        value: totalEnrollments.toLocaleString(),
        change: `+${enrollmentChange}%`,
        icon: 'TrendingUpIcon',
        color: 'Orange'
      }
    );
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    // Get recent enrollments with student names
    const enrollmentsResult = await executeQuery(`
      SELECT 
        'enrollment' as type,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.course_name,
        e.date_enrolled as activity_date
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.date_enrolled IS NOT NULL AND (e.is_active = 1 OR e.is_active IS NULL)
      ORDER BY e.date_enrolled DESC
      LIMIT 10
    `);
    
    // Get recent grade recordings
    const gradesResult = await executeQuery(`
      SELECT 
        'grade' as type,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.course_name,
        g.date_recorded as activity_date
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.enrollment_id
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE g.date_recorded IS NOT NULL
      ORDER BY g.date_recorded DESC
      LIMIT 10
    `);
    
    let allActivities = [];
    
    // Format enrollments
    if (enrollmentsResult.success && enrollmentsResult.data) {
      const enrollmentActivities = enrollmentsResult.data.map(activity => ({
        type: activity.type,
        text: `${activity.student_name} enrolled in ${activity.course_name}`,
        timestamp: activity.activity_date
      }));
      allActivities.push(...enrollmentActivities);
    }
    
    // Format grades
    if (gradesResult.success && gradesResult.data) {
      const gradeActivities = gradesResult.data.map(activity => ({
      type: activity.type,
        text: `Grade recorded for ${activity.student_name} in ${activity.course_name}`,
        timestamp: activity.activity_date
    }));
      allActivities.push(...gradeActivities);
    }
    
    // Sort all activities by timestamp (most recent first) and limit to 10
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const finalActivities = allActivities.slice(0, 10);
    
    res.json({
      success: true,
      data: finalActivities
    });
    
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
});

module.exports = router;
