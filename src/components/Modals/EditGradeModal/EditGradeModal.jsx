import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XIcon, FileTextIcon } from 'lucide-react'
import { Button } from '../../Button'
import SearchableSelect from '../../SearchableSelect'
import { gradesAPI, enrollmentsAPI } from '../../../services/api'
import styles from './EditGradeModal.module.css'

function EditGradeModal({ grade, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [formData, setFormData] = useState({
    enrollmentId: '',
    midtermGrade: '',
    finalGrade: '',
    remarks: 'Passed',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true)
        const gradeId = grade?.grade_id
        
        // Fetch grade details and enrollments in parallel
        const [gradeRes, enrollmentsRes] = await Promise.all([
          gradeId ? gradesAPI.getById(gradeId) : Promise.resolve(null),
          enrollmentsAPI.getAll(),
        ])
        
        // Handle grade response
        if (gradeRes && gradeRes.success && gradeRes.data) {
          const details = gradeRes.data
          setFormData({
            enrollmentId: String(details.enrollment_id || ''),
            midtermGrade: String(details.midterm_grade || ''),
            finalGrade: String(details.final_grade || ''),
            remarks: details.remarks || 'Passed',
          })
        } else if (grade) {
          // Fallback to grade prop if API fails
          setFormData({
            enrollmentId: String(grade.enrollment_id || ''),
            midtermGrade: String(grade.midterm_grade || ''),
            finalGrade: String(grade.final_grade || ''),
            remarks: grade.remarks || 'Passed',
          })
        }
        
        // Handle enrollments response
        setEnrollments(enrollmentsRes?.data || [])
      } catch (error) {
        console.error('Failed to load grade data:', error)
        // Use grade prop as fallback
        if (grade) {
          setFormData({
            enrollmentId: String(grade.enrollment_id || ''),
            midtermGrade: String(grade.midterm_grade || ''),
            finalGrade: String(grade.final_grade || ''),
            remarks: grade.remarks || 'Passed',
          })
        }
        toast.error('Failed to load grade details. Using available data.')
      } finally {
        setFetchingData(false)
      }
    }
    fetchData()
  }, [grade])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.enrollmentId || !formData.midtermGrade || !formData.finalGrade) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const gradeId = grade?.grade_id
      if (!gradeId) {
        toast.error('Grade ID is required')
        return
  }

      const payload = {
        midterm_grade: parseFloat(formData.midtermGrade),
        final_grade: parseFloat(formData.finalGrade),
        remarks: formData.remarks
      }

      const response = await gradesAPI.update(gradeId, payload)
      
      if (response && response.success) {
        toast.success(response.message || 'Grade updated successfully!')
        if (onSuccess) await onSuccess()
    onClose()
      } else {
        toast.error(response?.message || 'Failed to update grade')
      }
    } catch (error) {
      console.error('Failed to update grade:', error)
      toast.error(error.message || 'Failed to update grade. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Loading Grade Data...</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <XIcon className={styles.closeIcon} />
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.loading}>Loading grade details...</div>
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
              <FileTextIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Edit Student Grade</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <SearchableSelect
              label="Enrollment"
              options={enrollments.map((enr) => ({
                value: enr.enrollment_id,
                label: `${enr.student_number || enr.student_id} - ${enr.course_code || enr.course_id} (${enr.academic_year}, ${enr.semester})`,
              }))}
              value={formData.enrollmentId}
              onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
              placeholder="Select Enrollment"
              searchPlaceholder="Search enrollment..."
              required
              disabled
            />
            <p className={styles.helpText}>Enrollment cannot be changed after grade is created</p>
          </div>
          
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Midterm Grade *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.midtermGrade}
                onChange={(e) => setFormData({ ...formData, midtermGrade: e.target.value })}
                className={styles.input}
                placeholder="85.00"
                required
              />
            </div>
            <div>
              <label className={styles.label}>Final Grade *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.finalGrade}
                onChange={(e) => setFormData({ ...formData, finalGrade: e.target.value })}
                className={styles.input}
                placeholder="90.00"
                required
              />
            </div>
          </div>
          
          <div>
            <label className={styles.label}>Remarks *</label>
            <select
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className={styles.select}
              required
            >
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Grade'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditGradeModal
