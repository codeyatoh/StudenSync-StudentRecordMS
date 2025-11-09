import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { XIcon, UserCogIcon } from 'lucide-react'
import { Button } from '../../Button'
import { usersAPI } from '../../../services/api'
import styles from './EditUserModal.module.css'

function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    role: user?.role || 'Staff',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      const payload = {
        username: formData.username,
        role: formData.role,
      }
      if (formData.password) {
        payload.password = formData.password
      }
      await usersAPI.update(user.user_id, payload)
      toast.success('User updated successfully')
      if (onSuccess) {
        await onSuccess()
      }
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to update user')
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
            <h2 className={styles.title}>Edit User</h2>
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
          
          {/* Only DB-backed fields remain: username, role, and optional password */}
          
          <div className={styles.passwordSection}>
            <h4 className={styles.sectionTitle}>Change Password (Optional)</h4>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal
