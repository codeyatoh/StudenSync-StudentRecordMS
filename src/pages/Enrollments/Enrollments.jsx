import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
} from 'lucide-react'
import { Button, AddEnrollmentModal, EditEnrollmentModal, EnrollmentModal, DeleteModal } from '../../components'
import { enrollmentsAPI } from '../../services/api'
import styles from './Enrollments.module.css'

function Enrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await enrollmentsAPI.getAll()
      setEnrollments(res.data || [])
    } catch (err) {
      console.error('Failed to fetch enrollments:', err)
      setError('Failed to fetch enrollments')
      setEnrollments([])
      toast.error('Failed to fetch enrollments')
    } finally {
      setLoading(false)
    }
  }

  const refreshEnrollments = () => fetchEnrollments()

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowViewModal(true)
  }

  const handleEditEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowEditModal(true)
  }

  const handleDeleteEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await enrollmentsAPI.delete(selectedEnrollment.enrollment_id)
      toast.success('Enrollment archived successfully')
      await refreshEnrollments()
    } catch (err) {
      console.error('Failed to archive enrollment:', err)
      toast.error(err.message || 'Failed to archive enrollment')
    } finally {
      setShowDeleteModal(false)
      setSelectedEnrollment(null)
    }
  }

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      (enrollment.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enrollment.student_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enrollment.course_name || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Enrollments</h1>
          <p className={styles.subtitle}>
            Manage student course enrollments
          </p>
        </div>
        <Button
          variant="primary"
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className={styles.addIcon} />
          New Enrollment
        </Button>
      </div>
      
      <div className={styles.card}>
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enrollments by student name, ID, or course..."
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}><p className={styles.emptyStateText}>Loading enrollments...</p></div>
          ) : error ? (
            <div className={styles.emptyState}><p className={styles.emptyStateText}>Error: {error}</p></div>
          ) : filteredEnrollments.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>No enrollments found</p>
            </div>
          ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>Enrollment ID</th>
                <th className={styles.tableHeader}>Student</th>
                <th className={styles.tableHeader}>Course</th>
                <th className={styles.tableHeader}>Semester</th>
                <th className={styles.tableHeader}>Academic Year</th>
                <th className={styles.tableHeader}>Enrollment Date</th>
                <th className={styles.tableHeader}>Status</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.enrollment_id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                    {enrollment.enrollment_id}
                  </td>
                  <td className={styles.tableCell}>
                    <div>
                      <p className={styles.studentName}>
                        {enrollment.student_name}
                      </p>
                      <p className={styles.studentId}>
                        {enrollment.student_number}
                      </p>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    {enrollment.course_code} - {enrollment.course_name}
                  </td>
                  <td className={styles.tableCell}>
                    {enrollment.semester}
                  </td>
                  <td className={styles.tableCell}>
                    {enrollment.academic_year}
                  </td>
                  <td className={styles.tableCell}>
                    {enrollment.date_enrolled || '—'}
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.statusBadge}>
                      <span className={styles.statusDot} />
                      {enrollment.status}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleViewEnrollment(enrollment)}
                        className={styles.actionButton}
                        title="View Details"
                      >
                        <EyeIcon className={styles.actionIcon} />
                      </button>
                      <button
                        onClick={() => handleEditEnrollment(enrollment)}
                        className={styles.actionButton}
                        title="Edit Enrollment"
                      >
                        <EditIcon className={styles.actionIcon} />
                      </button>
                      <button
                        onClick={() => handleDeleteEnrollment(enrollment)}
                        className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                        title="Delete Enrollment"
                      >
                        <Trash2Icon className={styles.actionIconDelete} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <AddEnrollmentModal onClose={() => setShowAddModal(false)} onSuccess={refreshEnrollments} />
      )}
      {showEditModal && selectedEnrollment && (
        <EditEnrollmentModal
          enrollment={selectedEnrollment}
          onClose={() => {
            setShowEditModal(false)
            setSelectedEnrollment(null)
          }}
          onSuccess={refreshEnrollments}
        />
      )}
      {showViewModal && selectedEnrollment && (
        <EnrollmentModal
          enrollment={selectedEnrollment}
          onClose={() => {
            setShowViewModal(false)
            setSelectedEnrollment(null)
          }}
        />
      )}
      {showDeleteModal && selectedEnrollment && (
        <DeleteModal
          title="Archive Enrollment"
          message="Are you sure you want to archive this enrollment? You can restore it later from the archived tab."
          itemName={`${selectedEnrollment.student_number} - ${selectedEnrollment.course_code}`}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedEnrollment(null)
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default Enrollments
