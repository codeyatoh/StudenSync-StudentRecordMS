import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboardIcon,
  UsersIcon,
  BookOpenIcon,
  GraduationCapIcon,
  FileTextIcon,
  ClipboardListIcon,
  UserCogIcon,
  LogOutIcon,
  BrainCircuitIcon,
} from 'lucide-react'
import { LogoutModal } from '../Modals/LogoutModal'
import styles from './Sidebar.module.css'
import logo from '../../assets/images/SRMS-Logo.png'

const menuItems = [
  { icon: LayoutDashboardIcon, label: 'Dashboard', path: '/dashboard' },
  { icon: UsersIcon, label: 'Students', path: '/students' },
  { icon: BookOpenIcon, label: 'Programs', path: '/programs' },
  { icon: BrainCircuitIcon, label: 'Majors', path: '/majors' },
  { icon: GraduationCapIcon, label: 'Courses', path: '/courses' },
  { icon: ClipboardListIcon, label: 'Enrollments', path: '/enrollments' },
  { icon: FileTextIcon, label: 'Grades', path: '/grades' },
  { icon: UserCogIcon, label: 'Users', path: '/users' },
]

function Sidebar({ isOpen, onToggle }) {
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth < 768) {
      onToggle()
    }
  }
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className={`${styles.sidebarOverlay} ${isOpen ? styles.sidebarOverlayActive : ''}`}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <img
            src={logo}
            alt="SRMS Logo"
            className={styles.sidebarLogo}
          />
          {isOpen && (
            <span className={styles.sidebarTitle}>StudenSync</span>
          )}
        </div>
        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.sidebarNavItem} ${isActive ? styles.sidebarNavItemActive : ''}`}
              >
                <Icon className={styles.sidebarIcon} />
                {isOpen && <span className={styles.sidebarLabel}>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <button
            onClick={() => setShowLogoutModal(true)}
            className={styles.sidebarLogoutButton}
          >
            <LogOutIcon className={styles.sidebarIcon} />
            {isOpen && <span className={styles.sidebarLabel}>Logout</span>}
          </button>
        </div>
      </aside>
      {showLogoutModal && (
        <LogoutModal onClose={() => setShowLogoutModal(false)} />
      )}
    </>
  )
}

export default Sidebar
