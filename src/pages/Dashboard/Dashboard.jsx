import React, { useState, useEffect, useMemo } from 'react'
import {
  UsersIcon,
  BookOpenIcon,
  GraduationCapIcon,
  BrainCircuitIcon,
  TrendingUpIcon,
} from 'lucide-react'
import { 
  AddStudentModal, 
  AddEnrollmentModal, 
  AddCourseModal, 
  AddProgramModal, 
  AddGradeModal,
  AddUserModal 
} from '../../components'
import { AddMajorModal } from '../../components/Modals/AddMajorModal'
import { dashboardAPI } from '../../services/api'
import { formatTimeAgo } from '../../utils/timeUtils'
import styles from './Dashboard.module.css'

function Dashboard() {
  const [stats, setStats] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showAddEnrollmentModal, setShowAddEnrollmentModal] = useState(false)
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [showAddProgramModal, setShowAddProgramModal] = useState(false)
  const [showAddMajorModal, setShowAddMajorModal] = useState(false)
  const [showAddGradeModal, setShowAddGradeModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setActivitiesLoading(true)
        
        // Fetch stats and activities in parallel
        const [statsResponse, activitiesResponse] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentActivities()
        ])
        
      // Handle response structure: { success: true, data: [...] } or direct data
      setStats(statsResponse?.data || statsResponse || [])
      setActivities(activitiesResponse?.data || activitiesResponse || [])
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setStats([])
        setActivities([])
      } finally {
        setLoading(false)
        setActivitiesLoading(false)
      }
    }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Update time every 30 seconds for live time display
  // This ensures "Just now" updates to "1 minute ago" in real-time
  useEffect(() => {
    // Update immediately when component mounts or activities change
    setCurrentTime(new Date())
    
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000) // Update every 30 seconds for better performance

    return () => clearInterval(interval)
  }, [activities])

  // Format activities with live time updates
  const activitiesWithTime = useMemo(() => {
    return activities.map(activity => ({
      ...activity,
      time: formatTimeAgo(activity.timestamp || activity.activity_date || activity.date)
    }))
  }, [activities, currentTime])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Welcome to Student Record Management System
        </p>
      </div>
      
      <div className={styles.statsGrid}>
        {loading ? (
          // Loading skeleton - show 4 cards initially, will adjust based on actual data
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${styles.statCard} ${styles.loading}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIconSkeleton}></div>
                <div className={styles.statChangeSkeleton}></div>
              </div>
              <div className={styles.statValueSkeleton}></div>
              <div className={styles.statLabelSkeleton}></div>
            </div>
          ))
        ) : stats.length > 0 ? (
          stats.map((stat) => {
            // Map icon strings to actual icon components
            const iconMap = {
              'UsersIcon': UsersIcon,
              'BookOpenIcon': BookOpenIcon,
              'GraduationCapIcon': GraduationCapIcon,
              'BrainCircuitIcon': BrainCircuitIcon,
              'TrendingUpIcon': TrendingUpIcon
            }
            const Icon = iconMap[stat.icon] || UsersIcon
            
            return (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={`${styles.statIcon} ${styles[`statIcon${stat.color}`]}`}>
                    <Icon className={styles.icon} />
                  </div>
                  <span className={styles.statChange}>
                    {stat.change}
                  </span>
                </div>
                <h3 className={styles.statValue}>
                  {stat.value}
                </h3>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            )
          })
        ) : (
          <div className={styles.noStats}>
            <p>No statistics available</p>
          </div>
        )}
      </div>
      
      <div className={styles.contentGrid}>
        <div className={styles.activityCard}>
          <h2 className={styles.cardTitle}>Recent Activities</h2>
          <div className={styles.activityList}>
            {activitiesLoading ? (
              // Loading skeleton for activities
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={`${styles.activityDot} ${styles.loading}`} />
                  <div className={styles.activityContent}>
                    <div className={`${styles.activityTextSkeleton} ${styles.loading}`}></div>
                    <div className={`${styles.activityTimeSkeleton} ${styles.loading}`}></div>
                  </div>
                </div>
              ))
            ) : activitiesWithTime.length > 0 ? (
              activitiesWithTime.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      {activity.text}
                    </p>
                    <p className={styles.activityTime}>{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noActivities}>
                <p>No recent activities found</p>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.quickActionsCard}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
          <div className={styles.quickActionsGrid}>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className={styles.quickActionButton}
            >
              <p className={styles.quickActionTitle}>Add Student</p>
              <p className={styles.quickActionSubtitle}>Create new record</p>
            </button>
            <button
              onClick={() => setShowAddEnrollmentModal(true)}
              className={styles.quickActionButton}
            >
              <p className={styles.quickActionTitle}>Enroll Student</p>
              <p className={styles.quickActionSubtitle}>Process enrollment</p>
            </button>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className={styles.quickActionButton}
            >
              <p className={styles.quickActionTitle}>Add Course</p>
              <p className={styles.quickActionSubtitle}>Create new course</p>
            </button>
            <button
              onClick={() => setShowAddProgramModal(true)}
              className={styles.quickActionButton}
            >
              <p className={styles.quickActionTitle}>Add Program</p>
              <p className={styles.quickActionSubtitle}>Create new program</p>
            </button>
            <button
              onClick={() => setShowAddMajorModal(true)}
              className={styles.quickActionButton}
            >
              <p className={styles.quickActionTitle}>Add Major</p>
              <p className={styles.quickActionSubtitle}>Create new major</p>
            </button>
            <button
              onClick={() => setShowAddGradeModal(true)}
              className={styles.quickActionButton}
            >
              <p className={styles.quickActionTitle}>Add Grade</p>
              <p className={styles.quickActionSubtitle}>Record student grade</p>
            </button>
            <button
              onClick={() => setShowAddUserModal(true)}
              className={styles.quickActionButton}
            >
              <p className={styles.quickActionTitle}>Add User</p>
              <p className={styles.quickActionSubtitle}>Create new user</p>
            </button>
          </div>
        </div>
      </div>
      
      {showAddStudentModal && (
        <AddStudentModal onClose={() => setShowAddStudentModal(false)} onSuccess={fetchDashboardData} />
      )}
      {showAddEnrollmentModal && (
        <AddEnrollmentModal onClose={() => setShowAddEnrollmentModal(false)} onSuccess={fetchDashboardData} />
      )}
      {showAddCourseModal && (
        <AddCourseModal onClose={() => setShowAddCourseModal(false)} onSuccess={fetchDashboardData} />
      )}
      {showAddProgramModal && (
        <AddProgramModal onClose={() => setShowAddProgramModal(false)} onSuccess={fetchDashboardData} />
      )}
      {showAddMajorModal && (
        <AddMajorModal onClose={() => setShowAddMajorModal(false)} onSuccess={fetchDashboardData} />
      )}
      {showAddGradeModal && (
        <AddGradeModal onClose={() => setShowAddGradeModal(false)} onSuccess={fetchDashboardData} />
      )}
      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} onSuccess={fetchDashboardData} />
      )}
    </div>
  )
}

export default Dashboard
