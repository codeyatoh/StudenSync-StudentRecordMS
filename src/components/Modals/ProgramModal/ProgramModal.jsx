import React from 'react'
import { XIcon, BookOpenIcon, GraduationCapIcon, ClockIcon, HashIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './ProgramModal.module.css'

function ProgramModal({ program, onClose }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Program Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.avatar}>
              <BookOpenIcon className={styles.avatarIcon} />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.programName}>{program?.name || 'Bachelor of Science in Computer Science'}</h3>
              <p className={styles.programCode}>Program Code: {program?.code || 'BSCS'}</p>
              <p className={styles.degreeType}>{program?.degreeType || "Bachelor's Degree"}</p>
            </div>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <BookOpenIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Program Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Program ID:</span>
                  <span className={styles.infoValueMono}>{program?.program_id || '1'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Program Name:</span>
                  <span className={styles.infoValue}>{program?.program_name || 'Bachelor of Science in Computer Science'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Program Code:</span>
                  <span className={styles.infoValue}>{program?.program_code || 'BSCS'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Degree Type:</span>
                  <span className={styles.infoValue}>{program?.degree_type || "Bachelor's Degree"}</span>
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

export default ProgramModal
