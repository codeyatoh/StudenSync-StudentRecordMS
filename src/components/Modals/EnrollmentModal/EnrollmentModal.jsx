import React from 'react'
import { XIcon, ClipboardListIcon, UserIcon, BookOpenIcon, CalendarIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './EnrollmentModal.module.css'

function EnrollmentModal({ enrollment, onClose }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Enrollment Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.avatar}>
              <ClipboardListIcon className={styles.avatarIcon} />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.enrollmentTitle}>
                {enrollment?.student_number} - {enrollment?.student_name}
              </h3>
              <p className={styles.courseInfo}>
                {enrollment?.course_code} - {enrollment?.course_name}
              </p>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                <span className={styles.statusText}>{enrollment?.status || 'Enrolled'}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <UserIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Student Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Student ID:</span>
                  <span className={styles.infoValue}>{enrollment?.student_id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Student Name:</span>
                  <span className={styles.infoValue}>{enrollment?.student_name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Program:</span>
                  <span className={styles.infoValue}>BS Computer Science</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Year Level:</span>
                  <span className={styles.infoValue}>3rd Year</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <BookOpenIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Course Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Course Code:</span>
                  <span className={styles.infoValue}>{enrollment?.course_code}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Course Name:</span>
                  <span className={styles.infoValue}>{enrollment?.course_name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Units:</span>
                  <span className={styles.infoValueMono}>3.0</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Course Type:</span>
                  <span className={styles.infoValue}>Lecture</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <CalendarIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Enrollment Details</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Academic Year:</span>
                  <span className={styles.infoValue}>{enrollment?.academic_year}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Semester:</span>
                  <span className={styles.infoValue}>{enrollment?.semester}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Enrollment Date:</span>
                  <span className={styles.infoValue}>{enrollment?.date_enrolled || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status:</span>
                  <span className={styles.infoValueSuccess}>{enrollment?.status}</span>
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

export default EnrollmentModal
