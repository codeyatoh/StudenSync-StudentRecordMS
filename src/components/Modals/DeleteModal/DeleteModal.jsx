import React from 'react'
import { XIcon, AlertTriangleIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './DeleteModal.module.css'

function DeleteModal({ title, message, itemName, onClose, onConfirm, confirmText = 'Delete', variant = 'delete', disabled = false }) {
  const buttonClassName = variant === 'restore' ? styles.restoreButton : styles.deleteButton;
  
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <AlertTriangleIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
          {itemName && (
            <div className={styles.itemName}>
              <strong>{itemName}</strong>
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <button onClick={onConfirm} className={buttonClassName} disabled={disabled}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
