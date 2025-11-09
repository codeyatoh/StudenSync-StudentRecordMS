import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../../utils/auth'
import { authAPI } from '../../services/api'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const lastValidationRef = React.useRef(0)
  const retryCountRef = React.useRef(0)

  useEffect(() => {
    let isMounted = true
    let timeoutId = null

    // Don't validate if already on login page
    if (location.pathname === '/login') {
      setIsValidating(false)
      setIsValid(false)
      return
    }

    // Check if we recently validated (within last 5 seconds)
    const now = Date.now()
    const timeSinceLastValidation = now - lastValidationRef.current
    
    if (timeSinceLastValidation < 5000 && isValid) {
      // Recently validated and still valid, skip
      setIsValidating(false)
      return
    }

    const validateAuth = async () => {
      // Small delay to ensure token is stored (especially after login)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if component is still mounted
      if (!isMounted) return
      
      // Check if token exists in localStorage
      if (!isAuthenticated()) {
        if (isMounted) {
          setIsValidating(false)
          setIsValid(false)
        }
        return
      }

      // Validate token with backend
      try {
        const response = await authAPI.getCurrentUser()
        if (!isMounted) return
        
        if (response && response.success) {
          lastValidationRef.current = Date.now()
          retryCountRef.current = 0
          setIsValid(true)
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          setIsValid(false)
        }
      } catch (error) {
        // Don't log errors if it's a session expiration - it's expected
        // Token validation failed - check if it's a 401 or network error
        if (!isMounted) return
        
        if (error.message && error.message.includes('Session expired')) {
          // Already handled by API service
          setIsValid(false)
        } else if (error.message && error.message.includes('Too many requests')) {
          // Rate limit - keep current state, don't redirect
          console.warn('Rate limit hit during auth validation, keeping current session')
          if (isMounted) {
            lastValidationRef.current = Date.now()
            setIsValid(true) // Keep user logged in
            setIsValidating(false)
          }
          return
        } else {
          // Other errors - clear storage
          console.error('Token validation failed:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          setIsValid(false)
        }
      } finally {
        if (isMounted) {
          setIsValidating(false)
        }
      }
    }

    validateAuth()

    // Cleanup function
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [location.pathname])

  if (isValidating) {
    // Show loading state while validating
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Validating authentication...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isValid) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute

