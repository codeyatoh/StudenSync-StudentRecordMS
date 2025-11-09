import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
} from 'lucide-react'
import { Button, AddCourseModal, EditCourseModal, CourseModal, DeleteModal } from '../../components'
import { coursesAPI } from '../../services/api'
import styles from './Courses.module.css'

function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await coursesAPI.getAll()
      setCourses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      setError('Failed to fetch courses')
      setCourses([])
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const refreshCourses = () => {
    fetchCourses()
  }

  const handleViewCourse = (course) => {
    setSelectedCourse(course)
    setShowViewModal(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setShowEditModal(true)
  }

  const handleDeleteCourse = (course) => {
    setSelectedCourse(course)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await coursesAPI.delete(selectedCourse.course_id)
      toast.success(`Course "${selectedCourse?.course_name}" deleted successfully`)
      refreshCourses() // Refresh the list
    } catch (error) {
      console.error('Failed to delete course:', error)
      toast.error('Failed to delete course')
    } finally {
      setShowDeleteModal(false)
      setSelectedCourse(null)
    }
  }

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(
    (course) =>
      course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.program_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Courses</h1>
          <p className={styles.subtitle}>Manage course offerings</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <PlusIcon className={styles.addIcon} />
          Add Course
        </Button>
      </div>
      
      <div className={styles.card}>
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by name, code, or program..."
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Loading courses...</p>
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
                    <th className={styles.tableHeader}>Course Code</th>
                    <th className={styles.tableHeader}>Course Name</th>
                    <th className={styles.tableHeader}>Units</th>
                    <th className={styles.tableHeader}>Program</th>
                    <th className={styles.tableHeader}>Year Level</th>
                    <th className={styles.tableHeader}>Semester</th>
                    <th className={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.course_id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {course.course_code}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellBold}`}>
                        {course.course_name}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {course.units}
                      </td>
                      <td className={styles.tableCell}>
                        {course.program_name || 'N/A'}
                      </td>
                      <td className={styles.tableCell}>
                        {course.year_level || 'N/A'}
                      </td>
                      <td className={styles.tableCell}>
                        {course.semester || 'N/A'}
                      </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleViewCourse(course)}
                        className={styles.actionButton}
                        title="View Details"
                      >
                        <EyeIcon className={styles.actionIcon} />
                      </button>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className={styles.actionButton}
                        title="Edit Course"
                      >
                        <EditIcon className={styles.actionIcon} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                        title="Delete Course"
                      >
                        <Trash2Icon className={styles.actionIconDelete} />
                      </button>
                    </div>
                  </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCourses.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No courses found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <AddCourseModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshCourses}
        />
      )}
      {showEditModal && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCourse(null)
          }}
          onSuccess={refreshCourses}
        />
      )}
      {showViewModal && selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => {
            setShowViewModal(false)
            setSelectedCourse(null)
          }}
        />
      )}
      {showDeleteModal && selectedCourse && (
        <DeleteModal
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          itemName={selectedCourse.course_name}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedCourse(null)
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default Courses
