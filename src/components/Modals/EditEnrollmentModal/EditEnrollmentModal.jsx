import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XIcon, ClipboardListIcon } from 'lucide-react'
import { Button } from '../../Button'
import SearchableSelect from '../../SearchableSelect'
import { studentsAPI, coursesAPI, enrollmentsAPI } from '../../../services/api'
import styles from './EditEnrollmentModal.module.css'

function EditEnrollmentModal({ enrollment, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [enrollmentDetails, setEnrollmentDetails] = useState(null)
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    semester: '1st',
    academicYear: '2024-2025',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'Enrolled',
  })

  // Fetch enrollment details and lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true)
        const enrollmentId = enrollment?.enrollment_id
        
        // Fetch enrollment details, students, and courses in parallel
        const [enrollmentRes, studentsRes, coursesRes] = await Promise.all([
          enrollmentId ? enrollmentsAPI.getById(enrollmentId) : Promise.resolve(null),
          studentsAPI.getAll(),
          coursesAPI.getAll(),
        ])
        
        // Handle enrollment response
        if (enrollmentRes && enrollmentRes.success && enrollmentRes.data) {
          const details = enrollmentRes.data
          setEnrollmentDetails(details)
          setFormData({
            studentId: String(details.student_id || ''),
            courseId: String(details.course_id || ''),
            semester: details.semester || '1st',
            academicYear: details.academic_year || '2024-2025',
            enrollmentDate: details.date_enrolled ? details.date_enrolled.split('T')[0] : new Date().toISOString().split('T')[0],
            status: details.status || 'Enrolled',
          })
        } else if (enrollment) {
          // Fallback to enrollment prop if API fails
          setFormData({
            studentId: String(enrollment.student_id || enrollment.studentId || ''),
            courseId: String(enrollment.course_id || enrollment.course_id || ''),
            semester: enrollment.semester || '1st',
            academicYear: enrollment.academic_year || enrollment.academicYear || '2024-2025',
            enrollmentDate: enrollment.date_enrolled ? enrollment.date_enrolled.split('T')[0] : (enrollment.enrollmentDate || enrollment.enrollment_date || new Date().toISOString().split('T')[0]),
            status: enrollment.status || 'Enrolled',
          })
        }
        
        // Handle students response
        const studentsData = studentsRes?.data?.students || studentsRes?.data || []
        setStudents(Array.isArray(studentsData) ? studentsData : [])
        
        // Handle courses response
        setCourses(coursesRes?.data || [])
      } catch (error) {
        console.error('Failed to load enrollment data:', error)
        // Use enrollment prop as fallback
        if (enrollment) {
          setFormData({
            studentId: String(enrollment.student_id || enrollment.studentId || ''),
            courseId: String(enrollment.course_id || ''),
            semester: enrollment.semester || '1st',
            academicYear: enrollment.academic_year || enrollment.academicYear || '2024-2025',
            enrollmentDate: enrollment.date_enrolled ? enrollment.date_enrolled.split('T')[0] : (enrollment.enrollmentDate || enrollment.enrollment_date || new Date().toISOString().split('T')[0]),
            status: enrollment.status || 'Enrolled',
          })
        }
        toast.error('Failed to load enrollment details. Using available data.')
      } finally {
        setFetchingData(false)
      }
    }
    fetchData()
  }, [enrollment])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      if (!formData.studentId || !formData.courseId || !formData.academicYear) {
        toast.error('Please complete required fields')
        return
      }
      
      const enrollmentId = enrollment?.enrollment_id
      if (!enrollmentId) {
        toast.error('Enrollment ID is required')
        return
      }
      
      const payload = {
        student_id: parseInt(formData.studentId),
        course_id: parseInt(formData.courseId),
        academic_year: formData.academicYear,
        semester: formData.semester,
        date_enrolled: formData.enrollmentDate || null,
        status: formData.status,
      }
      
      await enrollmentsAPI.update(enrollmentId, payload)
      toast.success('Enrollment updated successfully!')
      if (onSuccess) await onSuccess()
      onClose()
    } catch (err) {
      console.error('Update enrollment error:', err)
      toast.error(err.message || 'Failed to update enrollment')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Loading Enrollment Data...</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <XIcon className={styles.closeIcon} />
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.loading}>Loading enrollment details...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <ClipboardListIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Edit Enrollment</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <SearchableSelect
              label="Student"
              options={students.map((s) => ({
                value: s.student_id,
                label: `${s.student_number} - ${s.first_name} ${s.middle_name ? s.middle_name + ' ' : ''}${s.last_name}`,
              }))}
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="Select Student"
              searchPlaceholder="Search student..."
              required
            />
          </div>
          
          <div>
            <SearchableSelect
              label="Course"
              options={courses.map((c) => ({
                value: c.course_id,
                label: `${c.course_code} - ${c.course_name}`,
              }))}
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              placeholder="Select Course"
              searchPlaceholder="Search course..."
              required
            />
          </div>
          
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className={styles.select}
                required
              >
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Academic Year *</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className={styles.input}
                placeholder="2024-2025"
                required
              />
            </div>
          </div>
          
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Enrollment Date *</label>
              <input
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div>
              <label className={styles.label}>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={styles.select}
                required
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Enrollment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEnrollmentModal
