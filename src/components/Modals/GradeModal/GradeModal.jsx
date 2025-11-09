import React from 'react'
import { XIcon, FileTextIcon, UserIcon, BookOpenIcon } from 'lucide-react'
import { Button } from '../../Button'
import styles from './GradeModal.module.css'

function GradeModal({ grade, onClose }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Grade Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.avatar}>
              <FileTextIcon className={styles.avatarIcon} />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.studentName}>{grade.studentName}</h3>
              <p className={styles.studentId}>Student ID: {grade.studentId}</p>
              <p className={styles.courseName}>{grade.courseName}</p>
              <div className={styles.statusBadge}>
                <span className={`${styles.statusDot} ${grade.remarks === 'Passed' ? styles.statusPassed : styles.statusFailed}`} />
                <span className={styles.statusText}>{grade.remarks}</span>
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
                  <span className={styles.infoValueMono}>{grade.studentId}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Full Name:</span>
                  <span className={styles.infoValue}>{grade.studentName}</span>
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
                  <span className={styles.infoValueMono}>{grade.course}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Course Name:</span>
                  <span className={styles.infoValue}>{grade.courseName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Units:</span>
                  <span className={styles.infoValue}>3</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Semester:</span>
                  <span className={styles.infoValue}>1st Semester</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <h4 className={styles.cardTitle}>Grade Breakdown</h4>
              <div className={styles.gradeBreakdown}>
                <div className={styles.gradeItem}>
                  <div className={styles.gradeHeader}>
                    <span className={styles.gradeLabel}>Midterm Grade</span>
                    <span className={styles.gradeValue}>{grade.midterm}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${grade.midterm}%` }}
                    />
                  </div>
                </div>
                <div className={styles.gradeItem}>
                  <div className={styles.gradeHeader}>
                    <span className={styles.gradeLabel}>Finals Grade</span>
                    <span className={styles.gradeValue}>{grade.finals}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${grade.finals}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.finalGradeCard}>
              <h4 className={styles.cardTitle}>Final Grade</h4>
              <div className={styles.finalGradeContent}>
                <p className={styles.finalGradeValue}>{grade.finalGrade}</p>
                <p className={styles.averageText}>
                  Average: {((parseFloat(grade.midterm) + parseFloat(grade.finals)) / 2).toFixed(2)}%
                </p>
                <div className={styles.finalStatusBadge}>
                  <span className={`${styles.statusDot} ${grade.remarks === 'Passed' ? styles.statusPassed : styles.statusFailed}`} />
                  {grade.remarks}
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

export default GradeModal
