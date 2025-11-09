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
  FilterIcon,
  XIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, AddStudentModal, EditStudentModal, StudentModal, DeleteModal } from '../../components'
import { studentsAPI, programsAPI, majorsAPI } from '../../services/api'
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
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    programId: '',
    majorId: '',
    yearLevel: '',
    enrollmentStatus: ''
  })
  const [programs, setPrograms] = useState([])
  const [majors, setMajors] = useState([])
  const [totalCount, setTotalCount] = useState(0)

  // Fetch programs and majors for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [programsResponse, majorsResponse] = await Promise.all([
          programsAPI.getAll(),
          majorsAPI.getAll()
        ])
        setPrograms(programsResponse?.data || [])
        setMajors(majorsResponse?.data || [])
      } catch (error) {
        console.error('Failed to fetch filter data:', error)
      }
    }
    fetchFilterData()
  }, [])

  // Fetch students with filters
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Build query parameters
        const params = {}
        if (searchQuery.trim()) {
          params.search = searchQuery.trim()
        }
        if (filters.programId) {
          params.program_id = parseInt(filters.programId)
        }
        if (filters.majorId) {
          params.major_id = parseInt(filters.majorId)
        }
        if (filters.yearLevel) {
          params.year_level = parseInt(filters.yearLevel)
        }
        if (filters.enrollmentStatus) {
          params.enrollment_status = filters.enrollmentStatus
        }
        // Increase limit to get more results
        params.limit = 1000

        const response = await studentsAPI.getAll(params)

        let studentsList = []
        if (response?.data?.students) {
          studentsList = response.data.students
          setTotalCount(response.data.pagination?.total || studentsList.length)
        } else if (Array.isArray(response?.data)) {
          studentsList = response.data
          setTotalCount(studentsList.length)
        } else if (Array.isArray(response)) {
          studentsList = response
          setTotalCount(studentsList.length)
        } else if (Array.isArray(response?.students)) {
          studentsList = response.students
          setTotalCount(studentsList.length)
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Unexpected students response structure:', response)
          }
          setTotalCount(0)
        }

        setStudents(Array.isArray(studentsList) ? studentsList : [])
      } catch (error) {
        console.error('Failed to fetch students:', error)
        console.error('Error details:', error)
        setError(error.message || 'Failed to load students')
        setStudents([])
        setTotalCount(0)
        toast.error('Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [searchQuery, filters])

  const refreshStudents = async () => {
    try {
      const params = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      if (filters.programId) {
        params.program_id = parseInt(filters.programId)
      }
      if (filters.majorId) {
        params.major_id = parseInt(filters.majorId)
      }
      if (filters.yearLevel) {
        params.year_level = parseInt(filters.yearLevel)
      }
      if (filters.enrollmentStatus) {
        params.enrollment_status = filters.enrollmentStatus
      }
      params.limit = 1000

      const response = await studentsAPI.getAll(params)

      let studentsList = []
      if (response?.data?.students) {
        studentsList = response.data.students
        setTotalCount(response.data.pagination?.total || studentsList.length)
      } else if (Array.isArray(response?.data)) {
        studentsList = response.data
        setTotalCount(studentsList.length)
      } else if (Array.isArray(response)) {
        studentsList = response
        setTotalCount(studentsList.length)
      } else if (Array.isArray(response?.students)) {
        studentsList = response.students
        setTotalCount(studentsList.length)
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

  // Filter change handlers
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      programId: '',
      majorId: '',
      yearLevel: '',
      enrollmentStatus: ''
    })
    setSearchQuery('')
  }

  const hasActiveFilters = () => {
    return filters.programId || filters.majorId || filters.yearLevel || filters.enrollmentStatus || searchQuery.trim()
  }

  // Get majors filtered by selected program
  const filteredMajors = useMemo(() => {
    if (!filters.programId) {
      return majors
    }
    return majors.filter(major => major.program_id === parseInt(filters.programId))
  }, [majors, filters.programId])

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
          <div className={styles.searchInputWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, ID, or program..."
              className={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.filterButton} ${showFilters ? styles.filterButtonActive : ''} ${hasActiveFilters() ? styles.filterButtonHasFilters : ''}`}
            title="Toggle filters"
          >
            <FilterIcon className={styles.filterIcon} />
            Filters
            {hasActiveFilters() && <span className={styles.filterBadge}></span>}
          </button>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filtersHeader}>
              <h3 className={styles.filtersTitle}>Filter Students</h3>
              {hasActiveFilters() && (
                <button onClick={clearFilters} className={styles.clearFiltersButton}>
                  <XIcon className={styles.clearIcon} />
                  Clear All
                </button>
              )}
            </div>
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Program</label>
                <select
                  value={filters.programId}
                  onChange={(e) => {
                    handleFilterChange('programId', e.target.value)
                    // Clear major when program changes
                    handleFilterChange('majorId', '')
                  }}
                  className={styles.filterSelect}
                >
                  <option value="">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.program_id} value={program.program_id}>
                      {program.program_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Major</label>
                <select
                  value={filters.majorId}
                  onChange={(e) => handleFilterChange('majorId', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Majors</option>
                  {filteredMajors.map((major) => (
                    <option key={major.major_id} value={major.major_id}>
                      {major.major_name}
                    </option>
                  ))}
                </select>
                {filters.programId && filteredMajors.length === 0 && (
                  <span className={styles.filterHint}>No majors available for this program</span>
                )}
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Year Level</label>
                <select
                  value={filters.yearLevel}
                  onChange={(e) => handleFilterChange('yearLevel', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Year Levels</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Enrollment Status</label>
                <select
                  value={filters.enrollmentStatus}
                  onChange={(e) => handleFilterChange('enrollmentStatus', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Statuses</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Not Enrolled">Not Enrolled</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Dropped">Dropped</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
            {hasActiveFilters() && (
              <div className={styles.activeFiltersInfo}>
                Showing {students.length} of {totalCount} students
              </div>
            )}
          </div>
        )}
        
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
                  {students.map((student) => (
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
              {students.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>
                    {hasActiveFilters() 
                      ? `No students match your filters. Try adjusting your search or filter criteria.` 
                      : 'No students found. Add your first student to get started.'}
                  </p>
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
