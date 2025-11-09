import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { XIcon, BookOpenIcon } from 'lucide-react'
import { Button } from '../../Button'
import { programsAPI } from '../../../services/api'
import styles from './AddProgramModal.module.css'

function AddProgramModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    program_name: '',
    program_code: '',
    degree_type: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await programsAPI.create(formData)
      if (response?.success === false) {
        throw new Error(response?.message || 'Failed to create program')
      }
      toast.success('Program created successfully!')
      if (onSuccess) {
        await onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Error creating program:', error)
      setError(error.message || 'Failed to create program')
      toast.error('Failed to create program')
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
              <BookOpenIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Add New Program</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div>
            <label className={styles.label}>Program Code *</label>
            <input
              type="text"
              value={formData.program_code}
              onChange={(e) => setFormData({ ...formData, program_code: e.target.value })}
              className={styles.input}
              placeholder="BSCS"
              required
            />
          </div>
          
          <div>
            <label className={styles.label}>Program Name *</label>
            <input
              type="text"
              value={formData.program_name}
              onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
              className={styles.input}
              placeholder="Bachelor of Science in Computer Science"
              required
            />
          </div>
          
          <div>
            <label className={styles.label}>Degree Type *</label>
            <select
              value={formData.degree_type}
              onChange={(e) => setFormData({ ...formData, degree_type: e.target.value })}
              className={styles.select}
              required
            >
              <option value="">Select Degree Type</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctoral Degree">Doctoral Degree</option>
              <option value="Certificate">Certificate</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Program'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProgramModal
