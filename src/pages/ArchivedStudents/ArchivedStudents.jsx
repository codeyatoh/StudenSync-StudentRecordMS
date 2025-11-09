import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  SearchIcon,
  EyeIcon,
  RotateCcwIcon,
  UserIcon,
  ArchiveIcon,
} from 'lucide-react'
import { Button, StudentModal, DeleteModal } from '../../components'
import { studentsAPI } from '../../services/api'
import styles from './ArchivedStudents.module.css'

function ArchivedStudents() {
  const [archivedStudents, setArchivedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetchArchivedStudents()
  }, [])

  const fetchArchivedStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await studentsAPI.getArchived()
      setArchivedStudents(response.data?.students || [])
    } catch (error) {
      console.error('Failed to fetch archived students:', error)
      setError(error.message || 'Failed to load archived students')
      setArchivedStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }

  const handleRestoreStudent = (student) => {
    setSelectedStudent(student)
    setShowRestoreModal(true)
  }

  const confirmRestore = async () => {
    if (!selectedStudent) return
    
    try {
      setRestoring(true)
      const response = await studentsAPI.restore(selectedStudent.student_id)
        
      if (response && response.success) {
        toast.success(response.message || `Student "${selectedStudent.first_name} ${selectedStudent.last_name}" has been restored successfully!`)
          // Refresh the archived students list
          await fetchArchivedStudents()
        } else {
        toast.error(response?.message || 'Failed to restore student')
        }
      } catch (error) {
        console.error('Failed to restore student:', error)
      toast.error(error.message || 'Failed to restore student. Please try again.')
    } finally {
      setRestoring(false)
      setShowRestoreModal(false)
      setSelectedStudent(null)
    }
  }

  const filteredStudents = (Array.isArray(archivedStudents) ? archivedStudents : []).filter(
    (student) =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.program_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <ArchiveIcon className={styles.titleIcon} />
            Archived Students
          </h1>
          <p className={styles.subtitle}>View and restore archived student records</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search archived students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading archived students...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p className={styles.errorText}>{error}</p>
            <Button onClick={fetchArchivedStudents} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeader}>Photo</th>
                    <th className={styles.tableHeader}>Student Number</th>
                    <th className={styles.tableHeader}>Name</th>
                    <th className={styles.tableHeader}>Program</th>
                    <th className={styles.tableHeader}>Year Level</th>
                    <th className={styles.tableHeader}>Archived Date</th>
                    <th className={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.photoCell}>
                          {student.profile_picture_url ? (
                            <img
                              src={`http://localhost:5001${student.profile_picture_url}`}
                              alt={`${student.first_name} ${student.last_name}`}
                              className={styles.studentPhoto}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextElementSibling.style.display = 'flex'
                              }}
                            />
                          ) : (
                            <div className={styles.photoPlaceholder}>
                              <UserIcon className={styles.photoIcon} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.studentNumber}>{student.student_number}</span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.nameCell}>
                          <span className={styles.studentName}>
                            {student.first_name} {student.middle_name} {student.last_name} {student.suffix}
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.program}>
                          {student.program_name || 'No Program'}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.yearLevel}>
                          {student.year_level ? `${student.year_level} Year` : 'N/A'}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.archivedDate}>
                          {student.archived_at ? new Date(student.archived_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => handleViewStudent(student)}
                            className={styles.actionButton}
                            title="View Details"
                          >
                            <EyeIcon className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleRestoreStudent(student)}
                            className={`${styles.actionButton} ${styles.restoreButton}`}
                            title="Restore Student"
                          >
                            <RotateCcwIcon className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <ArchiveIcon className={styles.emptyIcon} />
                  <p className={styles.emptyStateText}>No archived students found</p>
                  <p className={styles.emptyStateSubtext}>
                    {searchQuery ? 'Try adjusting your search terms' : 'Students that are archived will appear here'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showViewModal && selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => {
            setShowViewModal(false)
            setSelectedStudent(null)
          }}
        />
      )}
      {showRestoreModal && selectedStudent && (
        <DeleteModal
          title="Restore Student"
          message={`Are you sure you want to restore "${selectedStudent.first_name} ${selectedStudent.last_name}"? This will make the student record active again.`}
          itemName={`${selectedStudent.student_number} - ${selectedStudent.first_name} ${selectedStudent.last_name}`}
          confirmText="Restore"
          variant="restore"
          disabled={restoring}
          onClose={() => {
            setShowRestoreModal(false)
            setSelectedStudent(null)
          }}
          onConfirm={confirmRestore}
        />
      )}
    </div>
  )
}

export default ArchivedStudents
