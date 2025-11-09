import React, { useState } from 'react'
import { Sidebar } from '../Sidebar'
import { Navbar } from '../Navbar'
import styles from './Layout.module.css'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Closed by default on mobile
  
  // On desktop (768px+), open sidebar by default
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    // Set initial state
    handleResize()
    
    // Listen for resize events
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return (
    <div className={styles.layoutContainer}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`${styles.layoutMain} ${sidebarOpen ? styles.layoutMainExpanded : styles.layoutMainCollapsed}`}>
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={styles.layoutContent}>{children}</main>
      </div>
    </div>
  )
}

export default Layout
