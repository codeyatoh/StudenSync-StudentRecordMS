import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
  GraduationCapIcon,
} from 'lucide-react'
import { Button, AddProgramModal, EditProgramModal, ViewProgramModal, DeleteModal } from '../../components'
import { programsAPI } from '../../services/api'
import styles from './Programs.module.css'

function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch programs on component mount
  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await programsAPI.getAll()
      setPrograms(response.data || [])
    } catch (error) {
      console.error('Failed to fetch programs:', error)
      setError('Failed to fetch programs')
      setPrograms([])
      toast.error('Failed to fetch programs')
    } finally {
      setLoading(false)
    }
  }

  const refreshPrograms = () => {
    fetchPrograms()
  }

  const handleDeleteProgram = (program) => {
    setSelectedProgram(program)
    setShowDeleteModal(true)
  }

  const handleViewProgram = (program) => {
    setSelectedProgram(program)
    setShowViewModal(true)
  }

  const handleEditProgram = (program) => {
    setSelectedProgram(program)
    setShowEditModal(true)
  }

  const confirmDelete = async () => {
    try {
      await programsAPI.delete(selectedProgram.program_id)
      await refreshPrograms()
      setShowDeleteModal(false)
      setSelectedProgram(null)
      toast.success(`Program "${selectedProgram.program_name}" has been archived successfully`)
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Failed to archive program')
    }
  }

  const filteredPrograms = programs.filter(
    (program) =>
      program.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.program_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.degree_type?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Programs</h1>
          <p className={styles.subtitle}>Manage academic programs</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <PlusIcon className={styles.addIcon} />
          Add Program
        </Button>
      </div>
      
      <div className={styles.card}>
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs by name, code, or department..."
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Loading programs...</p>
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
                    <th className={styles.tableHeader}>Program Code</th>
                    <th className={styles.tableHeader}>Program Name</th>
                    <th className={styles.tableHeader}>Degree Type</th>
                    <th className={styles.tableHeader}>Student Count</th>
                    <th className={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((program) => (
                    <tr key={program.program_id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {program.program_code}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellBold}`}>
                        {program.program_name}
                      </td>
                      <td className={styles.tableCell}>
                        {program.degree_type || 'N/A'}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {program.student_count || 0}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => handleViewProgram(program)}
                            className={styles.actionButton}
                            title="View Details"
                          >
                            <EyeIcon className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleEditProgram(program)}
                            className={styles.actionButton}
                            title="Edit Program"
                          >
                            <EditIcon className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(program)}
                            className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                            title="Delete Program"
                          >
                            <Trash2Icon className={styles.actionIconDelete} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPrograms.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No programs found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <AddProgramModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={refreshPrograms}
        />
      )}
      {showViewModal && selectedProgram && (
        <ViewProgramModal
          program={selectedProgram}
          onClose={() => {
            setShowViewModal(false)
            setSelectedProgram(null)
          }}
        />
      )}
      {showEditModal && selectedProgram && (
        <EditProgramModal
          program={selectedProgram}
          onClose={() => {
            setShowEditModal(false)
            setSelectedProgram(null)
          }}
          onSuccess={refreshPrograms}
        />
      )}
      {showDeleteModal && selectedProgram && (
        <DeleteModal
          title="Delete Program"
          message="Are you sure you want to delete this program? This action cannot be undone."
          itemName={selectedProgram.program_name}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedProgram(null)
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default Programs
