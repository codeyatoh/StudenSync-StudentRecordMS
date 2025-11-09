const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// User validation schemas
const userSchemas = {
  create: Joi.object({
    username: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'Registrar', 'Staff').default('Staff')
  }),
  
  update: Joi.object({
    username: Joi.string().min(3).max(100),
    password: Joi.string().min(6),
    role: Joi.string().valid('Admin', 'Registrar', 'Staff')
  }),
  
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
};

// Student validation schemas
const studentSchemas = {
  create: Joi.object({
    student_number: Joi.string().max(20).required(),
    first_name: Joi.string().max(100).required(),
    middle_name: Joi.string().max(100).allow('', null),
    last_name: Joi.string().max(100).required(),
    suffix: Joi.string().max(10).allow('', null),
    gender: Joi.string().valid('Male', 'Female', 'Non-binary', 'Prefer not to say').required(),
    citizenship: Joi.string().max(50).allow('', null),
    place_of_birth: Joi.string().max(100).allow('', null),
    religion: Joi.string().max(50).allow('', null),
    civil_status: Joi.string().valid('Single', 'Married', 'Other').allow('', null),
    profile_picture_url: Joi.string().uri().allow('', null),
    
    program_id: Joi.number().integer().allow(null),
    major_id: Joi.number().integer().allow(null),
    year_level: Joi.number().integer().min(1).max(6).allow(null),
    academic_status: Joi.string().valid('Regular', 'Irregular', 'Probationary', 'On Leave of Absence').allow('', null),
    enrollment_status: Joi.string().valid('Enrolled', 'Not Enrolled', 'Graduated', 'Dropped', 'Transferred').allow('', null),
    date_of_admission: Joi.date().allow('', null),
    expected_graduation_date: Joi.date().allow('', null),
    scholarship_type: Joi.string().valid('None', 'Academic', 'Financial Aid', 'Varsity').allow('', null),
    
    blood_type: Joi.string().max(5).allow('', null),
    known_allergies: Joi.string().allow('', null),
    medical_conditions: Joi.string().allow('', null)
  }),
  
  update: Joi.object({
    first_name: Joi.string().max(100),
    middle_name: Joi.string().max(100).allow('', null),
    last_name: Joi.string().max(100),
    suffix: Joi.string().max(10).allow('', null),
    gender: Joi.string().valid('Male', 'Female', 'Non-binary', 'Prefer not to say'),
    citizenship: Joi.string().max(50).allow('', null),
    place_of_birth: Joi.string().max(100).allow('', null),
    religion: Joi.string().max(50).allow('', null),
    civil_status: Joi.string().valid('Single', 'Married', 'Other').allow('', null),
    profile_picture_url: Joi.string().uri().allow('', null),
    
    program_id: Joi.number().integer().allow(null),
    major_id: Joi.number().integer().allow(null),
    year_level: Joi.number().integer().min(1).max(6).allow(null),
    academic_status: Joi.string().valid('Regular', 'Irregular', 'Probationary', 'On Leave of Absence').allow('', null),
    enrollment_status: Joi.string().valid('Enrolled', 'Not Enrolled', 'Graduated', 'Dropped', 'Transferred').allow('', null),
    date_of_admission: Joi.date().allow('', null),
    expected_graduation_date: Joi.date().allow('', null),
    scholarship_type: Joi.string().valid('None', 'Academic', 'Financial Aid', 'Varsity').allow('', null),
    
    blood_type: Joi.string().max(5).allow('', null),
    known_allergies: Joi.string().allow('', null),
    medical_conditions: Joi.string().allow('', null)
  })
};

// Program validation schemas
const programSchemas = {
  create: Joi.object({
    program_name: Joi.string().max(150).required(),
    program_code: Joi.string().max(20).required(),
    degree_type: Joi.string().max(50).allow('', null)
  }),
  
  update: Joi.object({
    program_name: Joi.string().max(150),
    program_code: Joi.string().max(20),
    degree_type: Joi.string().max(50).allow('', null)
  })
};

// Course validation schemas
const courseSchemas = {
  create: Joi.object({
    program_id: Joi.number().integer().allow(null),
    course_code: Joi.string().max(20).required(),
    course_name: Joi.string().max(150).required(),
    units: Joi.number().precision(1).min(0).max(10).required(),
    semester: Joi.string().valid('1st', '2nd', 'Summer').allow('', null),
    year_level: Joi.number().integer().min(1).max(6).allow(null)
  }),
  
  update: Joi.object({
    program_id: Joi.number().integer().allow(null),
    course_code: Joi.string().max(20),
    course_name: Joi.string().max(150),
    units: Joi.number().precision(1).min(0).max(10),
    semester: Joi.string().valid('1st', '2nd', 'Summer').allow('', null),
    year_level: Joi.number().integer().min(1).max(6).allow(null)
  })
};

// Grade validation schemas
const gradeSchemas = {
  create: Joi.object({
    enrollment_id: Joi.number().integer().required(),
    midterm_grade: Joi.number().precision(2).min(0).max(100).allow(null),
    final_grade: Joi.number().precision(2).min(0).max(100).allow(null),
    remarks: Joi.string().valid('Passed', 'Failed', 'Incomplete', 'Dropped').allow(null)
  }),
  
  update: Joi.object({
    midterm_grade: Joi.number().precision(2).min(0).max(100).allow(null),
    final_grade: Joi.number().precision(2).min(0).max(100).allow(null),
    remarks: Joi.string().valid('Passed', 'Failed', 'Incomplete', 'Dropped').allow(null)
  })
};

module.exports = {
  validate,
  userSchemas,
  studentSchemas,
  programSchemas,
  courseSchemas,
  gradeSchemas
};
