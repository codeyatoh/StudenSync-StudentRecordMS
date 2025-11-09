import React, { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
  UserIcon,
  ArchiveIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, AddStudentModal, EditStudentModal, StudentModal, DeleteModal } from '../../components'
import { studentsAPI } from '../../services/api'
import styles from './Students.module.css'

function Students() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await studentsAPI.getAll()

        let studentsList = []
        if (response?.data?.students) {
          studentsList = response.data.students
        } else if (Array.isArray(response?.data)) {
          studentsList = response.data
        } else if (Array.isArray(response)) {
          studentsList = response
        } else if (Array.isArray(response?.students)) {
          studentsList = response.students
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Unexpected students response structure:', response)
          }
        }

        setStudents(Array.isArray(studentsList) ? studentsList : [])
      } catch (error) {
        console.error('Failed to fetch students:', error)
        console.error('Error details:', error)
        setError(error.message || 'Failed to load students')
        setStudents([])
        toast.error('Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const refreshStudents = async () => {
    try {
      const response = await studentsAPI.getAll()

      let studentsList = []
      if (response?.data?.students) {
        studentsList = response.data.students
      } else if (Array.isArray(response?.data)) {
        studentsList = response.data
      } else if (Array.isArray(response)) {
        studentsList = response
      } else if (Array.isArray(response?.students)) {
        studentsList = response.students
      }

      setStudents(Array.isArray(studentsList) ? studentsList : [])
    } catch (error) {
      console.error('Failed to refresh students:', error)
      setError(error.message || 'Failed to refresh students')
      toast.error('Failed to refresh students')
    }
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await studentsAPI.delete(selectedStudent.student_id)
      
      // Show success message from server response
      if (response.success) {
        toast.success(response.message || `Student "${selectedStudent.first_name} ${selectedStudent.last_name}" has been archived successfully`)
      } else {
        toast.error(response.message || 'Failed to archive student')
      }
      
      // Refresh the student list to remove archived student
      await refreshStudents()
      setShowDeleteModal(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Failed to archive student:', error)
      toast.error(error.message || 'Failed to archive student. Please try again.')
      setShowDeleteModal(false)
      setSelectedStudent(null)
    }
  }

  const filteredStudents = useMemo(() => {
    const studentsArray = Array.isArray(students) ? students : []

    if (!searchQuery.trim()) {
      return studentsArray
    }
    
    const searchTerm = searchQuery.toLowerCase()
    const filtered = studentsArray.filter((student) => {
      const nameMatch = student.first_name && student.last_name && 
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm)
      const idMatch = student.student_number?.toLowerCase().includes(searchTerm)
      const programMatch = student.program_name?.toLowerCase().includes(searchTerm)
      
      return nameMatch || idMatch || programMatch
    })
    
    return filtered
  }, [students, searchQuery])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>Manage student records and information</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            onClick={() => navigate('/students/archived')}
            className={styles.archivedButton}
          >
            <ArchiveIcon className={styles.archivedIcon} />
            View Archived
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className={styles.addButton}
          >
            <PlusIcon className={styles.addIcon} />
            Add Student
          </Button>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, ID, or program..."
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Loading students...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Error: {error}</p>
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeaderRow}>
                    <th className={styles.tableHeader}>Photo</th>
                    <th className={styles.tableHeader}>Student ID</th>
                    <th className={styles.tableHeader}>Name</th>
                    <th className={styles.tableHeader}>Program</th>
                    <th className={styles.tableHeader}>Year Level</th>
                    <th className={styles.tableHeader}>GPA</th>
                    <th className={styles.tableHeader}>Status</th>
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
                                if (process.env.NODE_ENV === 'development') {
                                  console.warn('Student photo failed to load:', student.profile_picture_url)
                                }
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div 
                            className={styles.noPhoto}
                            style={{ display: student.profile_picture_url ? 'none' : 'flex' }}
                          >
                            <UserIcon className={styles.noPhotoIcon} />
                          </div>
                        </div>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {student.student_number}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellBold}`}>
                        {`${student.first_name} ${student.last_name}`}
                      </td>
                      <td className={styles.tableCell}>
                        {student.program_name}
                      </td>
                      <td className={styles.tableCell}>
                        {student.year_level ? `${student.year_level}${student.year_level === 1 ? 'st' : student.year_level === 2 ? 'nd' : student.year_level === 3 ? 'rd' : 'th'} Year` : 'N/A'}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {student.gpa || 'N/A'}
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.statusBadge}>
                          <span className={styles.statusDot} />
                          {student.enrollment_status}
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
                            onClick={() => handleEditStudent(student)}
                            className={styles.actionButton}
                            title="Edit Student"
                          >
                            <EditIcon className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                            title="Delete Student"
                          >
                            <Trash2Icon className={styles.actionIconDelete} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>
                    {students.length === 0 
                      ? 'No students found. Total students in state: 0' 
                      : `No students match your search. Total students: ${students.length}`}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                      Debug: Students state has {students.length} items. 
                      Filtered students: {filteredStudents.length} items.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <AddStudentModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshStudents}
        />
      )}
      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => {
            setShowEditModal(false)
            setSelectedStudent(null)
          }}
          onSuccess={refreshStudents}
        />
      )}
      {showViewModal && selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => {
            setShowViewModal(false)
            setSelectedStudent(null)
          }}
        />
      )}
      {showDeleteModal && selectedStudent && (
        <DeleteModal
          title="Archive Student"
          message="Are you sure you want to archive this student? The student will be moved to archived records and can be restored later."
          itemName={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedStudent(null)
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default Students
