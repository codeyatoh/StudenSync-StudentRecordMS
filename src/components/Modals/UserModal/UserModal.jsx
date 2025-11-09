import React from 'react'
import { XIcon, UserCogIcon, ShieldIcon, CalendarIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './UserModal.module.css'

function UserModal({ user, onClose }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>User Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.avatar}>
              <UserCogIcon className={styles.avatarIcon} />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.userName}>{user?.username || 'admin'}</h3>
              <p className={styles.userRole}>{user?.role || 'Administrator'}</p>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                <span className={styles.statusText}>Active</span>
              </div>
            </div>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <UserCogIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Account Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Username:</span>
                  <span className={styles.infoValue}>{user?.username || 'admin'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>User ID:</span>
              <span className={styles.infoValueMono}>{user?.user_id ?? user?.id ?? 'USR-001'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Account Status:</span>
                  <span className={styles.infoValueSuccess}>Active</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <ShieldIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Role & Permissions</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Role:</span>
                  <span className={styles.infoValue}>{user?.role || 'Administrator'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Access Level:</span>
                  <span className={styles.infoValue}>Full Access</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Permissions:</span>
                  <span className={styles.infoValue}>All Modules</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <CalendarIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Account Activity</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Created:</span>
                  <span className={styles.infoValue}>January 15, 2024</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Last Login:</span>
                  <span className={styles.infoValue}>Today, 2:30 PM</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Login Count:</span>
                  <span className={styles.infoValueMono}>247</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserModal
