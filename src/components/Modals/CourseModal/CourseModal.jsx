import React from 'react'
import { XIcon, GraduationCapIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './CourseModal.module.css'

function CourseModal({ course, onClose }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Course Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.avatar}>
              <GraduationCapIcon className={styles.avatarIcon} />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.courseName}>{course?.course_name}</h3>
              <p className={styles.courseCode}>Code: {course?.course_code}</p>
              {course?.program_name && (
                <p className={styles.courseProgram}>{course.program_name}</p>
              )}
            </div>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h4 className={styles.cardTitle}>Course Information</h4>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Course ID:</span>
                  <span className={styles.infoValueMono}>{course?.course_id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Program ID:</span>
                  <span className={styles.infoValueMono}>{course?.program_id || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Course Code:</span>
                  <span className={styles.infoValue}>{course?.course_code}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Course Name:</span>
                  <span className={styles.infoValue}>{course?.course_name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Units:</span>
                  <span className={styles.infoValueMono}>{course?.units}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Semester:</span>
                  <span className={styles.infoValue}>{course?.semester}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Year Level:</span>
                  <span className={styles.infoValue}>{course?.year_level}</span>
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

export default CourseModal
