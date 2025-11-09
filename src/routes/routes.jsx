import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login/Login'
import { Dashboard, Students, ArchivedStudents, Programs, Majors, Courses, Enrollments, Grades, Users } from '../pages'
import { Layout } from '../components'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/students/archived" element={<ArchivedStudents />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/majors" element={<Majors />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/enrollments" element={<Enrollments />} />
                  <Route path="/grades" element={<Grades />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export { AppRouter }
