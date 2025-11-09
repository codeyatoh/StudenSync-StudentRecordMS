# Student Record Management System (SRMS)

A comprehensive web-based Student Information System built with React and Vite, designed to manage student records, courses, programs, enrollments, grades, and users.

## Features

- **Student Management** - Complete student profiles with personal, academic, and medical information
- **Course Management** - Course catalog with units, semester, and year level tracking
- **Program Management** - Academic programs with degree types and requirements
- **Enrollment Management** - Student course enrollments by academic year and semester
- **Grade Management** - Midterm/final grades with automatic GPA calculation
- **User Management** - Admin, Registrar, and Staff user roles
- **Authentication** - Secure login system
- **Responsive Design** - Mobile-friendly interface with CSS modules

## Technology Stack

- **Frontend:** React 19.1.1 with Vite 7.1.7
- **Routing:** React Router DOM 7.9.4
- **Icons:** Lucide React 0.546.0
- **Styling:** CSS Modules (no external CSS frameworks)
- **Package Manager:** Yarn

## Getting Started

### Frontend (React + Vite)

1. **Install dependencies (root):**
   ```bash
   yarn install
   ```

2. **Start the development server:**
   ```bash
   yarn dev
   ```

3. **Build for production:**
   ```bash
   yarn build
   ```

### Backend (Express + MySQL)

1. **Install dependencies:**
   ```bash
   cd backend
   yarn install
   ```

2. **Configure environment variables:**
   ```bash
   yarn setup-env
   ```

3. **Initialize the database (optional on first run):**
   ```bash
   yarn init-db
   ```

4. **Start the API server:**
   ```bash
   yarn dev
   ```

## Database Schema

The application is designed to work with a MySQL database. See the database schema documentation for complete table structures and relationships.

## Project Structure

```
backend/                # Express API, routes, and utility scripts
src/
├── components/          # Reusable UI components
├── pages/               # Feature pages (Dashboard, Students, etc.)
├── routes/              # React Router configuration
├── assets/              # Static assets (images, etc.)
└── main.jsx             # Frontend entry point
```
