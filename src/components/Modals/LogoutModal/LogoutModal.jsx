import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { XIcon, LogOutIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../Button/Button'
import { authAPI } from '../../../services/api'
import styles from './LogoutModal.module.css'

function LogoutModal({ onClose }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const handleLogout = async () => {
    try {
      setLoading(true)
      
      // Call logout API to invalidate token on server
      try {
        await authAPI.logout()
      } catch (error) {
        // Even if API call fails, still clear local storage
        console.error('Logout API error:', error)
      }
      
      // Clear all authentication data from localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // Note: API service token will be cleared when localStorage is cleared
      
      // Close modal
      onClose()
      
      // Show success message
      toast.success('Logged out successfully')
      
      // Navigate to login page
      navigate('/login', { replace: true })
      
      // Force page reload to clear all state
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      
      // Clear local storage even if API fails
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // Close modal and navigate
    onClose()
      navigate('/login', { replace: true })
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <div className={styles.modalIconWrapper}>
              <LogOutIcon className={styles.modalIcon} />
            </div>
            <h2 className={styles.modalTitle}>Confirm Logout</h2>
          </div>
          <button onClick={onClose} className={styles.modalCloseButton}>
            <XIcon className={styles.modalCloseIcon} />
          </button>
        </div>
        <p className={styles.modalMessage}>
          Are you sure you want to logout? You will need to sign in again to access the system.
        </p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <button onClick={handleLogout} className={styles.modalLogoutButton} disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal
