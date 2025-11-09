import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { XIcon, UserCogIcon } from 'lucide-react'
import { Button } from '../../Button'
import { usersAPI } from '../../../services/api'
import styles from './AddUserModal.module.css'

function AddUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    role: 'Staff',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (!formData.username.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role
      }

      const response = await usersAPI.create(payload)
      
      if (response && response.success) {
        toast.success(response.message || 'User created successfully!')
        if (onSuccess) {
          await onSuccess()
        }
    onClose()
      } else {
        toast.error(response?.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error(error.message || 'Failed to create user. Please try again.')
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
              <UserCogIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Add New User</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={styles.input}
                placeholder="john.doe"
                required
              />
            </div>
            <div>
              <label className={styles.label}>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={styles.select}
                required
              >
                <option value="Admin">Admin</option>
                <option value="Registrar">Registrar</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>
          
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className={styles.label}>Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUserModal
