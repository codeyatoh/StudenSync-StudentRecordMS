import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, SearchIcon, EyeIcon, EditIcon, TrashIcon, BrainCircuitIcon } from 'lucide-react'
import { Button } from '../../components/Button'
import { AddMajorModal } from '../../components/Modals/AddMajorModal'
import { EditMajorModal } from '../../components/Modals/EditMajorModal'
import { ViewMajorModal } from '../../components/Modals/ViewMajorModal'
import { DeleteModal } from '../../components/Modals/DeleteModal'
import { majorsAPI } from '../../services/api'
import styles from './Majors.module.css'

function Majors() {
  const [majors, setMajors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMajors()
  }, [])

  const fetchMajors = async () => {
    try {
      setLoading(true)
      const response = await majorsAPI.getAll()
      setMajors(response.data || [])
    } catch (error) {
      console.error('Error fetching majors:', error)
      setError('Failed to fetch majors')
      setMajors([])
      toast.error('Failed to fetch majors')
    } finally {
      setLoading(false)
    }
  }

  const handleViewMajor = (major) => {
    setSelectedMajor(major)
    setShowViewModal(true)
  }

  const handleEditMajor = (major) => {
    setSelectedMajor(major)
    setShowEditModal(true)
  }

  const handleDeleteMajor = (major) => {
    setSelectedMajor(major)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await majorsAPI.delete(selectedMajor.major_id)
      await fetchMajors()
      setShowDeleteModal(false)
      setSelectedMajor(null)
      toast.success(`Major "${selectedMajor.major_name}" has been deleted`)
    } catch (error) {
      console.error('Error deleting major:', error)
      toast.error('Failed to delete major')
    }
  }

  const refreshMajors = () => {
    fetchMajors()
  }

  const filteredMajors = majors.filter(major =>
    major.major_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    major.program_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading majors...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.iconWrapper}>
            <BrainCircuitIcon className={styles.icon} />
          </div>
          <div>
            <h1 className={styles.title}>Majors</h1>
            <p className={styles.subtitle}>Manage academic majors and specializations</p>
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <PlusIcon className={styles.buttonIcon} />
          Add Major
        </Button>
      </div>

      <div className={styles.card}>
          <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search majors by name, code, or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Loading majors...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Error: {error}</p>
            </div>
          ) : (
          <table className={styles.table}>
            <thead>
                <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>Major Name</th>
                <th className={styles.tableHeader}>Program</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMajors.length > 0 ? (
                filteredMajors.map((major) => (
                  <tr key={major.major_id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.majorName}>
                        {major.major_name}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {major.program_name || 'No Program'}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleViewMajor(major)}
                          className={styles.actionButton}
                          title="View Details"
                        >
                          <EyeIcon className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => handleEditMajor(major)}
                          className={styles.actionButton}
                          title="Edit Major"
                        >
                          <EditIcon className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => handleDeleteMajor(major)}
                          className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                          title="Delete Major"
                        >
                          <TrashIcon className={styles.actionIconDelete} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="3" className={styles.emptyState}>
                    {searchQuery ? 'No majors found matching your search.' : 'No majors available. Add your first major to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMajorModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshMajors}
        />
      )}
      {showEditModal && selectedMajor && (
        <EditMajorModal
          major={selectedMajor}
          onClose={() => {
            setShowEditModal(false)
            setSelectedMajor(null)
          }}
          onSuccess={refreshMajors}
        />
      )}
      {showViewModal && selectedMajor && (
        <ViewMajorModal
          major={selectedMajor}
          onClose={() => {
            setShowViewModal(false)
            setSelectedMajor(null)
          }}
        />
      )}
      {showDeleteModal && selectedMajor && (
        <DeleteModal
          title="Delete Major"
          message={`Are you sure you want to delete "${selectedMajor.major_name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false)
            setSelectedMajor(null)
          }}
        />
      )}
    </div>
  )
}

export default Majors
