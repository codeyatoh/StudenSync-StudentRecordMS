import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XIcon, ClipboardListIcon } from 'lucide-react'
import { Button } from '../../Button'
import SearchableSelect from '../../SearchableSelect'
import { studentsAPI, coursesAPI, enrollmentsAPI } from '../../../services/api'
import styles from './AddEnrollmentModal.module.css'

function AddEnrollmentModal({ onClose, onSuccess }) {
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

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          studentsAPI.getAll(),
          coursesAPI.getAll(),
        ])
        // Handle students response - it has nested data.students
        const studentsData = studentsRes.data?.students || studentsRes.data || []
        setStudents(studentsData)
        setCourses(coursesRes.data || [])
      } catch (error) {
        console.error('Failed to load students/courses:', error)
        setStudents([])
        setCourses([])
      }
    }
    fetchLists()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.studentId || !formData.courseId || !formData.academicYear) {
        toast.error('Please complete required fields')
        return
      }
      const payload = {
        student_id: parseInt(formData.studentId),
        course_id: parseInt(formData.courseId),
        academic_year: formData.academicYear,
        semester: formData.semester,
        // Don't send date_enrolled - backend will use NOW() for accurate timestamp
        status: formData.status,
      }
      const res = await enrollmentsAPI.create(payload)
      if (res?.success === false) throw new Error(res?.message || 'Failed to add enrollment')
      toast.success('Enrollment added successfully!')
      if (onSuccess) await onSuccess()
      onClose()
    } catch (err) {
      console.error('Create enrollment error:', err)
      toast.error(err.message || 'Failed to add enrollment')
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <ClipboardListIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>New Enrollment</h2>
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
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Enrollment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEnrollmentModal
