import React from 'react'
import styles from './Button.module.css'

function Button({ children, variant = 'primary', onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.btn} ${styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
