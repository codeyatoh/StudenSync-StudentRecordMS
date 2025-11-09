import React from 'react'
import { XIcon, BookOpenIcon, UsersIcon, CalendarIcon, TagIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './ViewProgramModal.module.css'

function ViewProgramModal({ program, onClose }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <BookOpenIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Program Details</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <TagIcon className={styles.detailIconSvg} />
              </div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Program Code</label>
                <p className={styles.detailValue}>{program?.program_code || 'N/A'}</p>
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <BookOpenIcon className={styles.detailIconSvg} />
              </div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Program Name</label>
                <p className={styles.detailValue}>{program?.program_name || 'N/A'}</p>
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <CalendarIcon className={styles.detailIconSvg} />
              </div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Degree Type</label>
                <p className={styles.detailValue}>{program?.degree_type || 'N/A'}</p>
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <UsersIcon className={styles.detailIconSvg} />
              </div>
              <div className={styles.detailContent}>
                <label className={styles.detailLabel}>Enrolled Students</label>
                <p className={styles.detailValue}>{program?.student_count || 0} students</p>
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

export default ViewProgramModal
