import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XIcon, BrainCircuitIcon } from 'lucide-react'
import { Button } from '../../Button'
import { majorsAPI, programsAPI } from '../../../services/api'
import styles from './AddMajorModal.module.css'

function AddMajorModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [programs, setPrograms] = useState([])
  const [formData, setFormData] = useState({
    majorName: '',
    programId: ''
  })

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await programsAPI.getAll()
      setPrograms(response.data || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.majorName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const majorData = {
        major_name: formData.majorName.trim(),
        program_id: formData.programId || null
      }

      const res = await majorsAPI.create(majorData)
      if (res?.success === false) {
        throw new Error(res?.message || 'Failed to create major')
      }
      
      toast.success('Major created successfully!')
      if (onSuccess) {
        await onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Failed to create major:', error)
      toast.error(error.message || 'Failed to create major')
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
              <BrainCircuitIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Add New Major</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            {/* Basic Information (DB fields only) */}
            <div>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              <div className={styles.grid}>
                <div>
                  <label className={styles.label}>Major Name *</label>
                  <input
                    type="text"
                    value={formData.majorName}
                    onChange={(e) => setFormData({ ...formData, majorName: e.target.value })}
                    className={styles.input}
                    placeholder="e.g., Software Engineering"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Program Assignment */}
            <div>
              <h3 className={styles.sectionTitle}>Program Assignment</h3>
              <div className={styles.grid}>
                <div>
                  <label className={styles.label}>Program</label>
                  <select
                    value={formData.programId}
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Select Program (Optional)</option>
                    {programs.map((program) => (
                      <option key={program.program_id} value={program.program_id}>
                        {program.program_name} ({program.program_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className={loading ? styles.submitButton : ''}
            >
              {loading ? 'Creating...' : 'Create Major'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMajorModal
