import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  XIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  HeartPulseIcon,
  BookOpenIcon,
  MailIcon,
  UsersIcon,
} from 'lucide-react'
import { Button } from '../../Button'
import { studentsAPI } from '../../../services/api'
import styles from './StudentModal.module.css'

function StudentModal({ student, onClose }) {
  const [loading, setLoading] = useState(true)
  const [studentDetails, setStudentDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        // Validate student_id exists
        if (!student?.student_id) {
          const errorMsg = 'Student ID is missing. Please select a valid student.';
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
        
        const response = await studentsAPI.getById(student.student_id)
        if (response && response.success !== false) {
          // Handle response structure: { success: true, data: {...} }
          const studentData = response.data || response
          if (!studentData || (!studentData.first_name && !studentData.student_number)) {
            toast.error('Student data appears incomplete. Please try again later.')
          }

          setStudentDetails(studentData)
        } else {
          const errorMsg = response?.message || response?.error || 'Failed to load student details';
          throw new Error(errorMsg);
        }
      } catch (error) {
        const errorMsg = error.message || 'Failed to load student details';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false)
      }
    }

    if (student?.student_id) {
      fetchStudentDetails()
    }
  }, [student])

  if (loading) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Loading...</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <XIcon className={styles.closeIcon} />
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.loading}>Loading student details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !studentDetails) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Error</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <XIcon className={styles.closeIcon} />
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.error}>
              {error || 'Student not found'}
              {process.env.NODE_ENV === 'development' && studentDetails && (
                <pre style={{ marginTop: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(studentDetails, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentAddress = Array.isArray(studentDetails.addresses) 
    ? studentDetails.addresses.find(addr => addr && addr.type === 'current')
    : null
  const permanentAddress = Array.isArray(studentDetails.addresses)
    ? studentDetails.addresses.find(addr => addr && addr.type === 'permanent')
    : null
  const contactInfo = studentDetails.contact_info || null
  const guardian = Array.isArray(studentDetails.guardians) && studentDetails.guardians.length > 0
    ? studentDetails.guardians[0]
    : null
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Student Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.avatar}>
              {studentDetails.profile_picture_url ? (
                <img 
                  src={`http://localhost:5001${studentDetails.profile_picture_url}`}
                  alt={`${studentDetails.first_name} ${studentDetails.last_name}`}
                  className={styles.avatarImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <UserIcon 
                className={styles.avatarIcon} 
                style={{ display: studentDetails.profile_picture_url ? 'none' : 'block' }}
              />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.studentName}>
                {`${studentDetails.first_name} ${studentDetails.middle_name || ''} ${studentDetails.last_name} ${studentDetails.suffix || ''}`.trim()}
              </h3>
              <p className={styles.studentId}>Student No: {studentDetails.student_number}</p>
              <p className={styles.program}>{studentDetails.program_name || 'No Program Assigned'}</p>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                <span className={styles.statusText}>{studentDetails.enrollment_status}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <UserIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Personal Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Full Name:</span>
                  <span className={styles.infoValue}>
                    {`${studentDetails.first_name} ${studentDetails.middle_name || ''} ${studentDetails.last_name} ${studentDetails.suffix || ''}`.trim()}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Gender:</span>
                  <span className={styles.infoValue}>{studentDetails.gender || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Citizenship:</span>
                  <span className={styles.infoValue}>{studentDetails.citizenship || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Place of Birth:</span>
                  <span className={styles.infoValue}>{studentDetails.place_of_birth || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Religion:</span>
                  <span className={styles.infoValue}>{studentDetails.religion || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Civil Status:</span>
                  <span className={styles.infoValue}>{studentDetails.civil_status || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <BookOpenIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Academic Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Program:</span>
                  <span className={styles.infoValue}>{studentDetails.program_name || 'Not assigned'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Major:</span>
                  <span className={styles.infoValue}>{studentDetails.major_name || 'Not assigned'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Year Level:</span>
                  <span className={styles.infoValue}>
                    {studentDetails.year_level ? `${studentDetails.year_level}${studentDetails.year_level === 1 ? 'st' : studentDetails.year_level === 2 ? 'nd' : studentDetails.year_level === 3 ? 'rd' : 'th'} Year` : 'Not specified'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>GPA:</span>
                  <span className={styles.infoValueMono}>{studentDetails.gpa || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total Units Earned:</span>
                  <span className={styles.infoValue}>{studentDetails.total_units_earned || 0}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Academic Status:</span>
                  <span className={styles.infoValue}>{studentDetails.academic_status || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Enrollment Status:</span>
                  <span className={styles.infoValueSuccess}>{studentDetails.enrollment_status || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Scholarship:</span>
                  <span className={styles.infoValue}>{studentDetails.scholarship_type || 'None'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Date of Admission:</span>
                  <span className={styles.infoValue}>
                    {studentDetails.date_of_admission ? new Date(studentDetails.date_of_admission).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Expected Graduation Date:</span>
                  <span className={styles.infoValue}>
                    {studentDetails.expected_graduation_date ? new Date(studentDetails.expected_graduation_date).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <PhoneIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Contact Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>School Email:</span>
                  <span className={styles.infoValue}>{contactInfo?.school_email || 'Not provided'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Alternate Email:</span>
                  <span className={styles.infoValue}>{contactInfo?.alternate_email || 'Not provided'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Phone:</span>
                  <span className={styles.infoValue}>{contactInfo?.phone_number || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <MapPinIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Current Address</h4>
              </div>
              {currentAddress ? (
                <p className={styles.addressText}>
                  {currentAddress.street && `${currentAddress.street}`}
                  {currentAddress.street && <br />}
                  {currentAddress.city && currentAddress.province && `${currentAddress.city}, ${currentAddress.province}`}
                  {(currentAddress.city || currentAddress.province) && <br />}
                  {currentAddress.zip_code && `${currentAddress.zip_code}`}
                </p>
              ) : (
                <p className={styles.addressText}>No current address provided</p>
              )}
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <MapPinIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Permanent Address</h4>
              </div>
              {permanentAddress ? (
                <p className={styles.addressText}>
                  {permanentAddress.street && `${permanentAddress.street}`}
                  {permanentAddress.street && <br />}
                  {permanentAddress.city && permanentAddress.province && `${permanentAddress.city}, ${permanentAddress.province}`}
                  {(permanentAddress.city || permanentAddress.province) && <br />}
                  {permanentAddress.zip_code && `${permanentAddress.zip_code}`}
                </p>
              ) : (
                <p className={styles.addressText}>No permanent address provided</p>
              )}
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <HeartPulseIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Medical Information</h4>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Blood Type:</span>
                  <span className={styles.infoValue}>{studentDetails.blood_type || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Known Allergies:</span>
                  <span className={styles.infoValue}>{studentDetails.known_allergies || 'None'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Medical Conditions:</span>
                  <span className={styles.infoValue}>{studentDetails.medical_conditions || 'None'}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <UsersIcon className={styles.cardIcon} />
                <h4 className={styles.cardTitle}>Guardian Information</h4>
              </div>
              {guardian ? (
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Name:</span>
                    <span className={styles.infoValue}>{guardian.guardian_full_name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Relationship:</span>
                    <span className={styles.infoValue}>{guardian.guardian_relationship || 'Not specified'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone:</span>
                    <span className={styles.infoValue}>{guardian.guardian_phone_number || 'Not provided'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{guardian.guardian_email || 'Not provided'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Address:</span>
                    <span className={styles.infoValue}>{guardian.guardian_address || 'Not provided'}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.addressText}>No guardian information provided</p>
              )}
            </div>
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentModal
