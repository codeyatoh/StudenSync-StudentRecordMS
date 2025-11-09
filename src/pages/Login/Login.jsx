import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { authAPI } from '../../services/api'
import { isAuthenticated } from '../../utils/auth'
import styles from './Login.module.css'
import logo from '../../assets/images/SRMS-Logo.png'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  // Clear error when user starts typing
  useEffect(() => {
    if (username || password) {
      setError('')
    }
  }, [username, password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (loading) return
    
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login({ username, password })
      
      if (response && response.success) {
        // Store token and user info
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        toast.success(`Welcome back, ${response.data.user.username}!`)
        
        // Small delay to ensure token is stored before navigation
        setTimeout(() => {
          // Navigate to dashboard
          navigate('/dashboard', { replace: true })
        }, 100)
      } else {
        const errorMsg = response?.message || 'Login failed. Please check your credentials.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      // Handle rate limit errors specifically
      if (error.message && error.message.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment before trying again.')
        toast.error('Too many login attempts. Please wait a moment.')
      } else {
        const errorMsg = error.message || 'Login failed. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img
            src={logo}
            alt="SRMS Logo"
            className={styles.logo}
          />
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Student Record Management System</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <UserIcon className={styles.inputIcon} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className={styles.input}
                required
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <LockIcon className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
              >
                {showPassword ? (
                  <EyeOffIcon className={styles.eyeIcon} />
                ) : (
                  <EyeIcon className={styles.eyeIcon} />
                )}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Signing In...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
      <footer className={styles.footer}>
        © 2025 ANRJ Tech Solutions. All Rights Reserved.
      </footer>
    </div>
  )
}

export default Login
