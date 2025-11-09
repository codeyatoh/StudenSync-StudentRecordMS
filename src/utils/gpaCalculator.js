/**
 * GPA Calculator Utilities for Philippine Grading System
 */

// Philippine Grading System to GPA Conversion
export function convertGradeToGPA(finalGrade) {
  const grade = parseFloat(finalGrade);
  
  if (grade >= 97) return 1.00;      // Excellent (97-100)
  if (grade >= 94) return 1.25;      // Very Good (94-96)
  if (grade >= 91) return 1.50;      // Very Good (91-93)
  if (grade >= 88) return 1.75;      // Good (88-90)
  if (grade >= 85) return 2.00;      // Good (85-87)
  if (grade >= 82) return 2.25;      // Satisfactory (82-84)
  if (grade >= 79) return 2.50;      // Satisfactory (79-81)
  if (grade >= 76) return 2.75;      // Fair (76-78)
  if (grade >= 75) return 3.00;      // Passing (75)
  return 5.00;                       // Failed (Below 75)
}

// Calculate weighted GPA from student's grades
export function calculateWeightedGPA(studentGrades) {
  let totalGradePoints = 0;
  let totalUnits = 0;
  
  studentGrades.forEach(gradeRecord => {
    // Only include passed courses in GPA calculation
    if (gradeRecord.remarks === 'Passed' && gradeRecord.final_grade) {
      const gpaPoints = convertGradeToGPA(gradeRecord.final_grade);
      const courseUnits = parseFloat(gradeRecord.course_units || 3.0);
      
      totalGradePoints += (gpaPoints * courseUnits);
      totalUnits += courseUnits;
    }
  });
  
  return totalUnits > 0 ? parseFloat((totalGradePoints / totalUnits).toFixed(2)) : 0.00;
}

// Get GPA description
export function getGPADescription(gpa) {
  const gpaValue = parseFloat(gpa);
  
  if (gpaValue >= 1.00 && gpaValue <= 1.24) return 'Excellent';
  if (gpaValue >= 1.25 && gpaValue <= 1.74) return 'Very Good';
  if (gpaValue >= 1.75 && gpaValue <= 2.24) return 'Good';
  if (gpaValue >= 2.25 && gpaValue <= 2.74) return 'Satisfactory';
  if (gpaValue >= 2.75 && gpaValue <= 3.00) return 'Fair';
  if (gpaValue === 5.00) return 'Failed';
  return 'No Grade';
}

// Calculate semester GPA
export function calculateSemesterGPA(semesterGrades) {
  return calculateWeightedGPA(semesterGrades);
}

// Calculate cumulative GPA (all semesters)
export function calculateCumulativeGPA(allGrades) {
  return calculateWeightedGPA(allGrades);
}

// Get academic standing based on GPA
export function getAcademicStanding(gpa) {
  const gpaValue = parseFloat(gpa);
  
  if (gpaValue >= 1.00 && gpaValue <= 1.75) return 'Dean\'s List';
  if (gpaValue >= 1.76 && gpaValue <= 2.50) return 'Good Standing';
  if (gpaValue >= 2.51 && gpaValue <= 3.00) return 'Regular Standing';
  if (gpaValue > 3.00) return 'Probationary';
  return 'No Standing';
}

// Example usage:
/*
const studentGrades = [
  { final_grade: 88.5, course_units: 3.0, remarks: 'Passed' },
  { final_grade: 92.0, course_units: 2.0, remarks: 'Passed' },
  { final_grade: 85.5, course_units: 3.0, remarks: 'Passed' },
];

const gpa = calculateWeightedGPA(studentGrades);
console.log(`GPA: ${gpa} (${getGPADescription(gpa)})`);
console.log(`Academic Standing: ${getAcademicStanding(gpa)}`);
*/
