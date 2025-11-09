import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XIcon, UserIcon } from 'lucide-react'
import { Button } from '../../Button'
import SearchableSelect from '../../SearchableSelect'
import { studentsAPI, programsAPI, majorsAPI } from '../../../services/api'
import styles from './AddStudentModal.module.css'

function AddStudentModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [programs, setPrograms] = useState([])
  const [majors, setMajors] = useState([])
  const [filteredMajors, setFilteredMajors] = useState([])
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    studentNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    gender: '',
    citizenship: '',
    placeOfBirth: '',
    religion: '',
    civilStatus: 'Single',
    
    // Academic Information
    programId: '',
    majorId: '',
    yearLevel: 1,
    academicStatus: 'Regular',
    enrollmentStatus: 'Not Enrolled',
    dateOfAdmission: '',
    expectedGraduationDate: '',
    scholarshipType: 'None',
    
    // Medical Information
    bloodType: '',
    knownAllergies: '',
    medicalConditions: '',
    
    // Current Address
    currentStreet: '',
    currentCity: '',
    currentProvince: '',
    currentZipCode: '',
    
    // Permanent Address
    permanentStreet: '',
    permanentCity: '',
    permanentProvince: '',
    permanentZipCode: '',
    
    // Contact Information
    schoolEmail: '',
    alternateEmail: '',
    mobilePhone: '',
    
    // Guardian Information
    guardianFullName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
  })

  // Fetch programs and majors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsResponse, majorsResponse] = await Promise.all([
          programsAPI.getAll(),
          majorsAPI.getAll()
        ])
        
        setPrograms(programsResponse.data || [])
        setMajors(majorsResponse.data || [])
      } catch (error) {
        console.error('Error fetching programs and majors:', error)
      }
    }

    fetchData()
  }, [])

  // Filter majors based on selected program
  useEffect(() => {
    if (formData.programId) {
      const filtered = majors.filter(major => 
        major.program_id === parseInt(formData.programId)
      )
      setFilteredMajors(filtered)
      
      // Clear major selection if current major is not in the filtered list
      if (formData.majorId && !filtered.some(major => major.major_id === parseInt(formData.majorId))) {
        setFormData(prev => ({ ...prev, majorId: '' }))
      }
    } else {
      setFilteredMajors([])
      setFormData(prev => ({ ...prev, majorId: '' }))
    }
  }, [formData.programId, majors])

  // Sync permanent address with current address when checkbox is checked
  useEffect(() => {
    if (sameAsCurrentAddress) {
      setFormData(prev => ({
        ...prev,
        permanentStreet: prev.currentStreet,
        permanentCity: prev.currentCity,
        permanentProvince: prev.currentProvince,
        permanentZipCode: prev.currentZipCode
      }))
    }
  }, [sameAsCurrentAddress, formData.currentStreet, formData.currentCity, formData.currentProvince, formData.currentZipCode])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setPhotoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    // Reset file input
    const fileInput = document.getElementById('photo-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add all student data
      formDataToSend.append('student_number', formData.studentNumber)
      formDataToSend.append('first_name', formData.firstName)
      formDataToSend.append('middle_name', formData.middleName)
      formDataToSend.append('last_name', formData.lastName)
      formDataToSend.append('suffix', formData.suffix)
      formDataToSend.append('gender', formData.gender)
      formDataToSend.append('citizenship', formData.citizenship)
      formDataToSend.append('place_of_birth', formData.placeOfBirth)
      formDataToSend.append('religion', formData.religion)
      formDataToSend.append('civil_status', formData.civilStatus)
      formDataToSend.append('program_id', formData.programId)
      formDataToSend.append('major_id', formData.majorId)
      formDataToSend.append('year_level', formData.yearLevel)
      formDataToSend.append('academic_status', formData.academicStatus)
      formDataToSend.append('enrollment_status', formData.enrollmentStatus)
      formDataToSend.append('date_of_admission', formData.dateOfAdmission)
      formDataToSend.append('expected_graduation_date', formData.expectedGraduationDate)
      formDataToSend.append('scholarship_type', formData.scholarshipType)
      formDataToSend.append('blood_type', formData.bloodType)
      formDataToSend.append('known_allergies', formData.knownAllergies)
      formDataToSend.append('medical_conditions', formData.medicalConditions)
      
      // Address data
      formDataToSend.append('current_street', formData.currentStreet)
      formDataToSend.append('current_city', formData.currentCity)
      formDataToSend.append('current_province', formData.currentProvince)
      formDataToSend.append('current_zip_code', formData.currentZipCode)
      formDataToSend.append('permanent_street', formData.permanentStreet)
      formDataToSend.append('permanent_city', formData.permanentCity)
      formDataToSend.append('permanent_province', formData.permanentProvince)
      formDataToSend.append('permanent_zip_code', formData.permanentZipCode)
      
      // Contact data
      formDataToSend.append('school_email', formData.schoolEmail)
      formDataToSend.append('alternate_email', formData.alternateEmail)
      formDataToSend.append('mobile_phone', formData.mobilePhone || '')
      formDataToSend.append('home_phone', '')
      
      // Guardian data
      formDataToSend.append('guardian_full_name', formData.guardianFullName)
      formDataToSend.append('guardian_relationship', formData.guardianRelationship)
      formDataToSend.append('guardian_phone', formData.guardianPhone)
      formDataToSend.append('guardian_email', formData.guardianEmail)
      formDataToSend.append('guardian_address', formData.guardianAddress)
      
      // Add photo file if selected
      if (photoFile) {
        formDataToSend.append('profile_picture', photoFile)
      }
      
      const response = await studentsAPI.createWithPhoto(formDataToSend)
      
      // Show success message from server or default
      if (response.success) {
        toast.success(response.message || 'Student added successfully!')
      } else {
        toast.error(response.message || 'Failed to add student')
        return
      }
      
      // Call onSuccess callback to refresh the students list
      if (onSuccess) {
        await onSuccess()
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to add student:', error)
      toast.error(error.message || 'Failed to add student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <UserIcon className={styles.icon} />
            </div>
            <h2 className={styles.title}>Add New Student</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <XIcon className={styles.closeIcon} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Personal Information */}
          <div>
            <h3 className={styles.sectionTitle}>Personal Information</h3>
            
            {/* Photo Upload Section */}
            <div className={styles.photoSection}>
              <label className={styles.label}>Profile Picture</label>
              <div className={styles.photoUpload}>
                {photoPreview ? (
                  <div className={styles.photoPreview}>
                    <img src={photoPreview} alt="Preview" className={styles.previewImage} />
                    <button type="button" onClick={removePhoto} className={styles.removePhotoBtn}>
                      <XIcon className={styles.removeIcon} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <UserIcon className={styles.placeholderIcon} />
                    <p className={styles.placeholderText}>Click to upload photo</p>
                  </div>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className={styles.photoInput}
                />
              </div>
              <p className={styles.photoHint}>Supported formats: JPG, PNG, GIF (Max 5MB)</p>
            </div>
            
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Student Number *</label>
                <input
                  type="text"
                  value={formData.studentNumber}
                  onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                  className={styles.input}
                  placeholder="2024-001"
                  required
                />
              </div>
              <div>
                <label className={styles.label}>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={styles.input}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className={styles.label}>Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className={styles.input}
                  placeholder="Michael"
                />
              </div>
              <div>
                <label className={styles.label}>Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={styles.input}
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <label className={styles.label}>Suffix</label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  className={styles.input}
                  placeholder="Jr., Sr., III"
                />
              </div>
              <div>
                <label className={styles.label}>Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={styles.select}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className={styles.sectionTitle}>Academic Information</h3>
            <div className={styles.grid}>
              <div>
                <SearchableSelect
                  label="Program"
                  options={programs.map((program) => ({
                    value: program.program_id,
                    label: `${program.program_name} (${program.program_code})`,
                  }))}
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  placeholder="Select Program"
                  searchPlaceholder="Search program..."
                  required
                />
              </div>
              <div>
                <SearchableSelect
                  label="Major"
                  options={filteredMajors.map((major) => ({
                    value: major.major_id,
                    label: `${major.major_name} (${major.major_code})`,
                  }))}
                  value={formData.majorId}
                  onChange={(e) => setFormData({ ...formData, majorId: e.target.value })}
                  placeholder="Select Major"
                  searchPlaceholder="Search major..."
                />
              </div>
              <div>
                <label className={styles.label}>Year Level *</label>
                <select
                  value={formData.yearLevel}
                  onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                  className={styles.select}
                  required
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Academic Status *</label>
                <select
                  value={formData.academicStatus}
                  onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value })}
                  className={styles.select}
                  required
                >
                  <option value="Regular">Regular</option>
                  <option value="Irregular">Irregular</option>
                  <option value="Probationary">Probationary</option>
                  <option value="On Leave of Absence">On Leave of Absence</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Enrollment Status *</label>
                <select
                  value={formData.enrollmentStatus}
                  onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                  className={styles.select}
                  required
                >
                  <option value="Not Enrolled">Not Enrolled</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Dropped">Dropped</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Scholarship Type</label>
                <select
                  value={formData.scholarshipType}
                  onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
                  className={styles.select}
                >
                  <option value="None">None</option>
                  <option value="Academic">Academic</option>
                  <option value="Financial Aid">Financial Aid</option>
                  <option value="Varsity">Varsity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h3 className={styles.sectionTitle}>Personal Details</h3>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Citizenship</label>
                <input
                  type="text"
                  value={formData.citizenship}
                  onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                  className={styles.input}
                  placeholder="Filipino"
                />
              </div>
              <div>
                <label className={styles.label}>Place of Birth</label>
                <input
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  className={styles.input}
                  placeholder="Manila, Philippines"
                />
              </div>
              <div>
                <label className={styles.label}>Religion</label>
                <input
                  type="text"
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className={styles.input}
                  placeholder="Catholic"
                />
              </div>
              <div>
                <label className={styles.label}>Civil Status</label>
                <select
                  value={formData.civilStatus}
                  onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                  className={styles.select}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Date of Admission</label>
                <input
                  type="date"
                  value={formData.dateOfAdmission}
                  onChange={(e) => setFormData({ ...formData, dateOfAdmission: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div>
                <label className={styles.label}>Expected Graduation Date</label>
                <input
                  type="date"
                  value={formData.expectedGraduationDate}
                  onChange={(e) => setFormData({ ...formData, expectedGraduationDate: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className={styles.sectionTitle}>Medical Information</h3>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Blood Type</label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Known Allergies</label>
                <textarea
                  value={formData.knownAllergies}
                  onChange={(e) => setFormData({ ...formData, knownAllergies: e.target.value })}
                  className={styles.textarea}
                  placeholder="None or list any known allergies..."
                  rows={3}
                />
              </div>
              <div>
                <label className={styles.label}>Medical Conditions</label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  className={styles.textarea}
                  placeholder="None or list any medical conditions..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Current Address */}
          <div>
            <h3 className={styles.sectionTitle}>Current Address</h3>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Street Address</label>
                <input
                  type="text"
                  value={formData.currentStreet}
                  onChange={(e) => setFormData({ ...formData, currentStreet: e.target.value })}
                  className={styles.input}
                  placeholder="123 Main Street, Barangay ABC"
                />
              </div>
              <div>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                  className={styles.input}
                  placeholder="Manila"
                />
              </div>
              <div>
                <label className={styles.label}>Province</label>
                <input
                  type="text"
                  value={formData.currentProvince}
                  onChange={(e) => setFormData({ ...formData, currentProvince: e.target.value })}
                  className={styles.input}
                  placeholder="Metro Manila"
                />
              </div>
              <div>
                <label className={styles.label}>ZIP Code</label>
                <input
                  type="text"
                  value={formData.currentZipCode}
                  onChange={(e) => setFormData({ ...formData, currentZipCode: e.target.value })}
                  className={styles.input}
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          {/* Permanent Address */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className={styles.sectionTitle}>Permanent Address</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={sameAsCurrentAddress}
                  onChange={(e) => setSameAsCurrentAddress(e.target.checked)}
                  style={{ cursor: 'pointer', width: '1rem', height: '1rem' }}
                />
                <span>Same as Current Address</span>
              </label>
            </div>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Street Address</label>
                <input
                  type="text"
                  value={formData.permanentStreet}
                  onChange={(e) => setFormData({ ...formData, permanentStreet: e.target.value })}
                  className={styles.input}
                  placeholder="123 Main Street, Barangay ABC"
                  disabled={sameAsCurrentAddress}
                  style={sameAsCurrentAddress ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  value={formData.permanentCity}
                  onChange={(e) => setFormData({ ...formData, permanentCity: e.target.value })}
                  className={styles.input}
                  placeholder="Manila"
                  disabled={sameAsCurrentAddress}
                  style={sameAsCurrentAddress ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div>
                <label className={styles.label}>Province</label>
                <input
                  type="text"
                  value={formData.permanentProvince}
                  onChange={(e) => setFormData({ ...formData, permanentProvince: e.target.value })}
                  className={styles.input}
                  placeholder="Metro Manila"
                  disabled={sameAsCurrentAddress}
                  style={sameAsCurrentAddress ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
              </div>
              <div>
                <label className={styles.label}>ZIP Code</label>
                <input
                  type="text"
                  value={formData.permanentZipCode}
                  onChange={(e) => setFormData({ ...formData, permanentZipCode: e.target.value })}
                  className={styles.input}
                  placeholder="1000"
                  disabled={sameAsCurrentAddress}
                  style={sameAsCurrentAddress ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className={styles.sectionTitle}>Contact Information</h3>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>School Email</label>
                <input
                  type="email"
                  value={formData.schoolEmail}
                  onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
                  className={styles.input}
                  placeholder="john.doe@school.edu"
                />
              </div>
              <div>
                <label className={styles.label}>Alternate Email</label>
                <input
                  type="email"
                  value={formData.alternateEmail}
                  onChange={(e) => setFormData({ ...formData, alternateEmail: e.target.value })}
                  className={styles.input}
                  placeholder="john.doe@gmail.com"
                />
              </div>
              <div>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={formData.mobilePhone}
                  onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                  className={styles.input}
                  placeholder="+63 912 345 6789"
                />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className={styles.sectionTitle}>Guardian Information</h3>
            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Guardian Full Name</label>
                <input
                  type="text"
                  value={formData.guardianFullName}
                  onChange={(e) => setFormData({ ...formData, guardianFullName: e.target.value })}
                  className={styles.input}
                  placeholder="Maria Doe"
                />
              </div>
              <div>
                <label className={styles.label}>Relationship</label>
                <input
                  type="text"
                  value={formData.guardianRelationship}
                  onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
                  className={styles.input}
                  placeholder="Mother"
                />
              </div>
              <div>
                <label className={styles.label}>Guardian Phone</label>
                <input
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className={styles.input}
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div>
                <label className={styles.label}>Guardian Email</label>
                <input
                  type="email"
                  value={formData.guardianEmail}
                  onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                  className={styles.input}
                  placeholder="maria.doe@gmail.com"
                />
              </div>
            </div>
            <div>
              <label className={styles.label}>Guardian Address</label>
              <textarea
                value={formData.guardianAddress}
                onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                className={styles.textarea}
                placeholder="Complete address of guardian..."
                rows={2}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding Student...' : 'Add Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStudentModal
