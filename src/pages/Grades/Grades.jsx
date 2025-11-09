import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
} from 'lucide-react'
import { Button, AddGradeModal, EditGradeModal, GradeModal, DeleteModal } from '../../components'
import { gradesAPI } from '../../services/api'
import styles from './Grades.module.css'

function Grades() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await gradesAPI.getAll()
      
      if (response && response.success) {
        setGrades(response.data || [])
      } else {
        toast.error('Failed to load grades')
        setGrades([])
      }
    } catch (err) {
      console.error('Failed to fetch grades:', err)
      toast.error(err.message || 'Failed to load grades')
      setError(err.message || 'Failed to load grades')
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  const refreshGrades = async () => {
    await fetchGrades()
  }

  const handleViewGrade = (grade) => {
    setSelectedGrade(grade)
    setShowViewModal(true)
  }

  const handleEditGrade = (grade) => {
    setSelectedGrade(grade)
    setShowEditModal(true)
  }

  const handleDeleteGrade = (grade) => {
    setSelectedGrade(grade)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedGrade) return
    
    try {
      await gradesAPI.delete(selectedGrade.grade_id)
      toast.success(`Grade for ${selectedGrade.student_name} deleted successfully!`)
      await refreshGrades()
    } catch (err) {
      console.error('Failed to delete grade:', err)
      toast.error(err.message || 'Failed to delete grade')
    } finally {
    setShowDeleteModal(false)
    setSelectedGrade(null)
    }
  }

  const filteredGrades = grades.filter(
    (grade) =>
      (grade.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grade.student_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grade.course_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grade.course_name || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Grades</h1>
          <p className={styles.subtitle}>
            Manage student grades and academic performance
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <PlusIcon className={styles.addIcon} />
          Add Grade
        </Button>
      </div>
      
      <div className={styles.card}>
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grades by student name, ID, or course..."
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>Student ID</th>
                <th className={styles.tableHeader}>Student Name</th>
                <th className={styles.tableHeader}>Course</th>
                <th className={styles.tableHeader}>Midterm</th>
                <th className={styles.tableHeader}>Finals</th>
                <th className={styles.tableHeader}>Final Grade</th>
                <th className={styles.tableHeader}>Remarks</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((grade) => (
                <tr key={grade.grade_id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                    {grade.student_number}
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellBold}`}>
                    {grade.student_name}
                  </td>
                  <td className={styles.tableCell}>
                    <div>
                      <p className={styles.courseCode}>
                        {grade.course_code}
                      </p>
                      <p className={styles.courseName}>
                        {grade.course_name}
                      </p>
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                    {grade.midterm_grade || '-'}
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                    {grade.final_grade || '-'}
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellMono} ${styles.finalGrade}`}>
                    {grade.final_grade || '-'}
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.statusBadge}>
                      <span className={styles.statusDot} />
                      {grade.remarks || '-'}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleViewGrade(grade)}
                        className={styles.actionButton}
                        title="View Details"
                      >
                        <EyeIcon className={styles.actionIcon} />
                      </button>
                      <button
                        onClick={() => handleEditGrade(grade)}
                        className={styles.actionButton}
                        title="Edit Grade"
                      >
                        <EditIcon className={styles.actionIcon} />
                      </button>
                      <button
                        onClick={() => handleDeleteGrade(grade)}
                        className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                        title="Delete Grade"
                      >
                        <Trash2Icon className={styles.actionIconDelete} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Loading grades...</p>
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>No grades found</p>
            </div>
          ) : null}
        </div>
      </div>
      
      {showAddModal && (
        <AddGradeModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshGrades}
        />
      )}
      {showEditModal && selectedGrade && (
        <EditGradeModal
          grade={selectedGrade}
          onClose={() => {
            setShowEditModal(false)
            setSelectedGrade(null)
          }}
          onSuccess={refreshGrades}
        />
      )}
      {showViewModal && selectedGrade && (
        <GradeModal
          grade={selectedGrade}
          onClose={() => {
            setShowViewModal(false)
            setSelectedGrade(null)
          }}
        />
      )}
      {showDeleteModal && selectedGrade && (
        <DeleteModal
          title="Delete Grade"
          message="Are you sure you want to delete this grade? This action cannot be undone."
          itemName={`${selectedGrade.studentName} - ${selectedGrade.courseName}`}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedGrade(null)
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default Grades
