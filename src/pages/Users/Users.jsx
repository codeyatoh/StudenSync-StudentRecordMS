import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
} from 'lucide-react'
import { Button, AddUserModal, EditUserModal, UserModal, DeleteModal } from '../../components'
import { usersAPI } from '../../services/api'
import styles from './Users.module.css'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await usersAPI.getAll()
        setUsers(response.data || [])
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setError(error.message || 'Failed to load users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const refreshUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to refresh users:', error)
      setError(error.message || 'Failed to refresh users')
    }
  }

  const confirmDelete = async () => {
    try {
      await usersAPI.delete(selectedUser.user_id)
      toast.success(`User "${selectedUser.username}" has been archived successfully`)
      await refreshUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error.message || 'Failed to archive user')
    } finally {
      setShowDeleteModal(false)
      setSelectedUser(null)
    }
  }

  const filteredUsers = (Array.isArray(users) ? users : []).filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>
            Manage system users and permissions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <PlusIcon className={styles.addIcon} />
          Add User
        </Button>
      </div>
      
      <div className={styles.card}>
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by username or role..."
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Loading users...</p>
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
                    <th className={styles.tableHeader}>User ID</th>
                    <th className={styles.tableHeader}>Username</th>
                    <th className={styles.tableHeader}>Role</th>
                    <th className={styles.tableHeader}>Created At</th>
                    <th className={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {user.user_id}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellMono}`}>
                        {user.username}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellBold}`}>
                        {user.role}
                      </td>
                      <td className={styles.tableCell}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => handleViewUser(user)}
                            className={styles.actionButton}
                            title="View Details"
                          >
                            <EyeIcon className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className={styles.actionButton}
                            title="Edit User"
                          >
                            <EditIcon className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                            title="Delete User"
                          >
                            <Trash2Icon className={styles.actionIconDelete} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No users found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <AddUserModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshUsers}
        />
      )}
      {showEditModal && selectedUser && (
        <EditUserModal 
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSuccess={refreshUsers}
        />
      )}
      {showViewModal && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowViewModal(false)
            setSelectedUser(null)
          }}
        />
      )}
      {showDeleteModal && selectedUser && (
        <DeleteModal
          title="Archive User"
          message="Are you sure you want to archive this user? You can restore it later from Archived Users."
          itemName={selectedUser.username}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedUser(null)
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default Users
