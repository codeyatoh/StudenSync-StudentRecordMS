import React, { useState, useEffect, useRef } from 'react'
import { MenuIcon, BellIcon, UserIcon, CheckIcon } from 'lucide-react'
import styles from './Navbar.module.css'

function Navbar({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationsRef = useRef(null)
  const accountRef = useRef(null)

  const hasUnread = notifications.some((notification) => !notification.read)

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      // Simulate API latency; replace with real API call when available
      await new Promise((resolve) => setTimeout(resolve, 400))
      setNotifications([
        {
          id: 1,
          title: 'Enrollment Approved',
          description: 'Juan Dela Cruz has been enrolled in BS Computer Science.',
          timestamp: '2 minutes ago',
          read: false,
        },
        {
          id: 2,
          title: 'Grade Submission',
          description: 'Prof. Santos submitted grades for Analytic Geometry.',
          timestamp: '1 hour ago',
          read: false,
        },
        {
          id: 3,
          title: 'System Update',
          description: 'New course codes were added to the catalog.',
          timestamp: 'Yesterday',
          read: true,
        },
      ])
    } finally {
      setLoadingNotifications(false)
    }
  }

  const toggleNotifications = async () => {
    const willShow = !showNotifications
    setShowNotifications(willShow)
    setShowAccountMenu(false)

    if (willShow && notifications.length === 0 && !loadingNotifications) {
      await fetchNotifications()
    }
  }

  const toggleAccountMenu = () => {
    const willShow = !showAccountMenu
    setShowAccountMenu(willShow)
    setShowNotifications(false)
  }

  const markAllNotificationsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setShowNotifications(false)
        setShowAccountMenu(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [])

  const handleKeyDown = (event, toggleFn) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleFn()
    }
    if (event.key === 'Escape') {
      setShowNotifications(false)
      setShowAccountMenu(false)
    }
  }

  return (
    <header className={styles.navbar}>
      <button onClick={onMenuClick} className={styles.navbarMenuButton}>
        <MenuIcon className={styles.navbarIcon} />
      </button>
      <div className={styles.navbarActions}>
        <div className={styles.navbarActionWrapper} ref={notificationsRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            className={styles.navbarActionButton}
            onClick={toggleNotifications}
            onKeyDown={(event) => handleKeyDown(event, toggleNotifications)}
          >
            <BellIcon className={styles.navbarIcon} />
            {hasUnread && <span className={styles.navbarBadge} />}
          </button>
          {showNotifications && (
            <div className={styles.navbarDropdown} role="dialog" aria-label="Notifications">
              <div className={styles.navbarDropdownHeader}>
                <div>
                  <h3 className={styles.navbarDropdownTitle}>Notifications</h3>
                  <p className={styles.navbarDropdownSubtitle}>
                    {loadingNotifications ? 'Loading updates…' : `You have ${notifications.filter((n) => !n.read).length} unread`}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.navbarDropdownAction}
                  onClick={markAllNotificationsRead}
                  disabled={notifications.length === 0}
                >
                  <CheckIcon className={styles.navbarDropdownActionIcon} />
                  Mark all read
                </button>
              </div>
              <div className={styles.navbarDropdownContent}>
                {loadingNotifications ? (
                  <div className={styles.navbarDropdownEmpty}>Fetching notifications…</div>
                ) : notifications.length === 0 ? (
                  <div className={styles.navbarDropdownEmpty}>No notifications yet</div>
                ) : (
                  <ul className={styles.navbarNotificationList}>
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`${styles.navbarNotificationItem} ${notification.read ? '' : styles.navbarNotificationUnread}`}
                      >
                        <h4 className={styles.navbarNotificationTitle}>{notification.title}</h4>
                        <p className={styles.navbarNotificationDescription}>{notification.description}</p>
                        <span className={styles.navbarNotificationTimestamp}>{notification.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.navbarActionWrapper} ref={accountRef}>
          <button
            type="button"
            aria-label="Account"
            aria-expanded={showAccountMenu}
            className={styles.navbarActionButton}
            onClick={toggleAccountMenu}
            onKeyDown={(event) => handleKeyDown(event, toggleAccountMenu)}
          >
            <UserIcon className={styles.navbarIcon} />
          </button>
          {showAccountMenu && (
            <div className={styles.navbarDropdown} role="menu" aria-label="Account menu">
              <div className={styles.navbarDropdownHeader}>
                <div>
                  <h3 className={styles.navbarDropdownTitle}>Logged in as</h3>
                  <p className={styles.navbarDropdownSubtitle}>Administrator</p>
                </div>
              </div>
              <div className={styles.navbarDropdownContent}>
                <button type="button" className={styles.navbarDropdownLink}>
                  View Profile
                </button>
                <button type="button" className={styles.navbarDropdownLink}>
                  Account Settings
                </button>
                <button type="button" className={`${styles.navbarDropdownLink} ${styles.navbarDropdownLinkDanger}`}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
