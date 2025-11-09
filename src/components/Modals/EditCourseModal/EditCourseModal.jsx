import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XIcon, GraduationCapIcon } from 'lucide-react'
import { Button } from '../../Button'
import { programsAPI } from '../../../services/api'
import { coursesAPI } from '../../../services/api'
import styles from './EditCourseModal.module.css'

function EditCourseModal({ course, onClose }) {
  const [programs, setPrograms] = useState([])
  const [formData, setFormData] = useState({
    programId: course?.program_id || '',
    courseCode: course?.course_code || '',
    courseName: course?.course_name || '',
    units: course?.units || '',
    semester: course?.semester || '1st',
    yearLevel: course?.year_level || 1,
  })

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await programsAPI.getAll()
        setPrograms(response.data || [])
      } catch (error) {
        console.error('Failed to load programs:', error)
        setPrograms([])
      }
    }
    fetchPrograms()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.courseCode.trim() || !formData.courseName.trim()) {
        toast.error('Please fill in course code and name')
        return
      }
      const payload = {
        program_id: formData.programId || null,
        course_code: formData.courseCode.trim(),
        course_name: formData.courseName.trim(),
        units: parseFloat(formData.units),
        semester: formData.semester,
        year_level: formData.yearLevel || null,
      }
      await coursesAPI.update(course.course_id, payload)
      toast.success('Course updated successfully!')
      onClose()
    } catch (err) {
      console.error('Update course error:', err)
      toast.error(err.message || 'Failed to update course')
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <GraduationCapIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Edit Course</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Program *</label>
            <select
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              className={styles.select}
              required
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name} ({program.program_code})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Course Code *</label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className={styles.input}
                placeholder="CS 101"
                required
              />
            </div>
            <div>
              <label className={styles.label}>Units *</label>
              <input
                type="number"
                step="0.1"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className={styles.input}
                placeholder="3.0"
                required
              />
            </div>
          </div>
          
          <div>
            <label className={styles.label}>Course Name *</label>
            <input
              type="text"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className={styles.input}
              placeholder="Introduction to Programming"
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
              <label className={styles.label}>Year Level</label>
              <select
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) })}
                className={styles.select}
              >
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCourseModal
