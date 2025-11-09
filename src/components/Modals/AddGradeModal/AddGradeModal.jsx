import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XIcon, FileTextIcon } from 'lucide-react'
import { Button } from '../../Button'
import SearchableSelect from '../../SearchableSelect'
import { convertGradeToGPA } from '../../../utils/gpaCalculator'
import { enrollmentsAPI, gradesAPI } from '../../../services/api'
import styles from './AddGradeModal.module.css'

function AddGradeModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [formData, setFormData] = useState({
    enrollmentId: '',
    midtermGrade: '',
    finalGrade: '',
    remarks: 'Passed',
  })

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await enrollmentsAPI.getAll()
        setEnrollments(res.data || [])
      } catch (error) {
        console.error('Failed to load enrollments:', error)
        setEnrollments([])
      }
    }
    fetchEnrollments()
  }, [])

  const calculateFinalGrade = (midterm, finals) => {
    if (!midterm || !finals) return ''
    const mid = parseFloat(midterm)
    const fin = parseFloat(finals)
    if (isNaN(mid) || isNaN(fin)) return ''
    const average = (mid + fin) / 2
    return convertGradeToGPA(average).toFixed(2)
  }

  const finalGrade = calculateFinalGrade(formData.midtermGrade, formData.finalGrade)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.enrollmentId || !formData.midtermGrade || !formData.finalGrade) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        enrollment_id: parseInt(formData.enrollmentId),
        midterm_grade: parseFloat(formData.midtermGrade),
        final_grade: parseFloat(formData.finalGrade),
        remarks: formData.remarks
      }

      const response = await gradesAPI.create(payload)
      
      if (response && response.success) {
        toast.success(response.message || 'Grade added successfully!')
        if (onSuccess) await onSuccess()
    onClose()
      } else {
        toast.error(response?.message || 'Failed to add grade')
      }
    } catch (error) {
      console.error('Failed to add grade:', error)
      toast.error(error.message || 'Failed to add grade. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <FileTextIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Add Student Grade</h2>
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
            />
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
          
          {finalGrade && (
            <div className={styles.gradePreview}>
              <div className={styles.gradeInfo}>
                <div>
                  <p className={styles.gradeLabel}>Final Grade</p>
                  <p className={styles.gradeFinal}>{finalGrade}</p>
                </div>
                <div>
                  <p className={styles.gradeLabel}>Status</p>
                  <span className={`${styles.statusBadge} ${parseFloat(finalGrade) <= 3.0 ? styles.statusPassed : styles.statusFailed}`}>
                    <span className={styles.statusDot} />
                    {parseFloat(finalGrade) <= 3.0 ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
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
              {loading ? 'Adding...' : 'Add Grade'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddGradeModal
