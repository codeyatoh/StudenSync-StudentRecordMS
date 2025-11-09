import React from 'react'
import { XIcon, BrainCircuitIcon, BookOpenIcon, InfoIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './ViewMajorModal.module.css'

function ViewMajorModal({ major, onClose }) {
  // View is constrained to DB-backed fields only

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <BrainCircuitIcon className={styles.icon} />
            </div>
            <div>
              <h2 className={styles.title}>{major.major_name}</h2>
              <p className={styles.subtitle}>Major Details</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.infoGrid}>
            {/* Basic Information (DB fields only) */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <InfoIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Basic Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Major Name:</span>
                  <span className={styles.infoValue}>{major.major_name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Major ID:</span>
                  <span className={styles.infoValueMono}>{major.major_id}</span>
                </div>
              </div>
            </div>

            {/* Program Information */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <BookOpenIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Program Assignment</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Program:</span>
                  <span className={styles.infoValue}>
                    {major.program_name || 'Not assigned to any program'}
                  </span>
                </div>
              </div>
            </div>
            {/* Only DB-backed fields shown */}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ViewMajorModal
