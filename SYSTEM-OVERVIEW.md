# Student Record Management System – Technical Overview

## 1. Purpose

The Student Record Management System (SRMS) is a full-stack web application that centralizes student lifecycle data for higher-education registrars and staff. It supports day-to-day operations such as enrollment, grade encoding, academic program administration, and user access management while providing real-time dashboards for leadership.

## 2. Architecture at a Glance

| Layer | Technology | Responsibilities |
|-------|------------|-------------------|
| Frontend | React 19 + Vite | Authenticated SPA with role-aware navigation, modals for CRUD workflows, dashboard visualizations |
| Backend | Node.js (Express) | REST API, business rules, validation, file uploads, JWT auth, rate limiting |
| Data | MySQL 8 (mysql2 driver) | Relational schema for users, students, programs, majors, courses, enrollments, grades |

Primary communication flow: the React client calls `/api/*` endpoints secured with Bearer tokens. The backend translates requests into SQL via the shared `executeQuery` helper and returns normalized JSON payloads.

## 3. Backend Highlights (`backend/`)

- **Server bootstrap** – `server.js` wires middleware (CORS, Helmet, rate limiting, JSON parsing), health check, static uploads serving, and graceful shutdown handlers.
- **Database access** – `config/database.js` exposes a mysql2 connection pool plus `executeQuery` for consistent logging and error handling. Preview protections include parameter sanitization and multi-statement blocking.
- **Authentication** – `routes/auth.js` handles login, registration, password updates, and `/me`. Tokens are signed with `JWT_SECRET`, and `middleware/auth.js` verifies tokens while reloading the user record to prevent access by deleted accounts.
- **Domain routes** – CRUD logic is split across feature routers: `students`, `programs`, `majors`, `courses`, `enrollments`, `grades`, `users`, and `dashboard`. Most routes now rely on database filters instead of JS fallbacks, and soft delete conventions are used where appropriate.
- **Scripts** – `scripts/` contains operational utilities (environment creation, DB initialization, archive maintenance). Non-essential test scripts were pruned during the cleanup.

## 4. Database Shape (`backend/sql/srms_schema.sql`)

The schema enforces referential integrity and soft deletes:

- `users` – credential store with roles (`Admin`, `Registrar`, `Staff`).
- `programs` / `majors` – academic catalog; majors reference programs.
- `students` – personal, academic, medical, and status fields; optional `program_id`/`major_id` FKs.
- `addresses`, `contact_info`, `guardians` – child tables cascade on student delete.
- `courses`, `enrollments`, `grades` – academic progress records with appropriate enum constraints.

A default admin account is seeded for first-run access (`username: admin`, password hash for `admin123`).

## 5. Frontend Highlights (`src/`)

- **Routing** – `routes/routes.jsx` defines an authenticated shell via `ProtectedRoute`, redirecting anonymous users to `/login` and gating internal routes (`/dashboard`, `/students`, `/programs`, `/majors`, `/courses`, `/enrollments`, `/grades`, `/users`).
- **Layout** – `components/Layout` combines `Navbar` and `Sidebar` navigation. Sidebar options are role-aware (logic inside component).
- **API abstraction** – `services/api.js` centralizes fetch logic, automatically attaches JWTs, handles JSON parsing, and surfaces errors uniformly.
- **Feature pages** – each major feature (Students, Programs, Majors, etc.) lives under `pages/`, orchestrating table views, filters, and modals for CRUD actions.
- **Modals** – Composable forms under `components/Modals/` cover create/edit flows. Recent cleanup removed debugging logs and strengthened fallback data when the API returns partial results.
- **Utils** – Helpers include `utils/auth.js` (token helpers), `gpaCalculator.js` (grade-to-GPA conversion), and `timeUtils.js` (relative timestamps for dashboards).

## 6. Security & Resilience

- **Transport** – Helmet, refined CORS allow-list, and static file headers protect the API.
- **Authentication** – JWT Bearer tokens with role checks (`requireAdmin`, `requireStaff`, etc.) gate backend routes and the SPA layout.
- **Rate limiting** – `express-rate-limit` throttles excessive requests to mitigate brute force attempts.
- **Input handling** – Database helper sanitizes parameters and blocks multi-statements; the frontend avoids interpolating raw SQL.
- **Uploads** – Student profile photos stored under `backend/uploads/students/` via `multer` with file type and size constraints.

## 7. Detailed Installation Guide (Visual Studio Code + WAMP Server)

This section provides step-by-step instructions for setting up the Student Record Management System using Visual Studio Code as your IDE and WAMP Server for MySQL database.

### 7.1 Prerequisites

Before installing the system, ensure you have the following software installed:

#### Required Software:
1. **Node.js** (v16.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: Open Command Prompt and run `node --version`
   - Verify npm: Run `npm --version`

2. **Yarn Package Manager**
   - Install globally: `npm install -g yarn`
   - Verify installation: Run `yarn --version`

3. **WAMP Server** (Latest version)
   - Download from: https://www.wampserver.com/
   - Includes: Apache, MySQL, and PHP
   - **Important**: During installation, note the MySQL port (usually 3306)

4. **Visual Studio Code**
   - Download from: https://code.visualstudio.com/
   - Recommended extensions:
     - ESLint
     - Prettier
     - JavaScript (ES6) code snippets
     - MySQL (for database management)
     - GitLens (optional)

### 7.2 Installing WAMP Server

#### Step 1: Download and Install WAMP Server
1. Download WAMP Server from the official website
2. Run the installer as Administrator
3. Follow the installation wizard:
   - Choose installation directory (default: `C:\wamp64`)
   - Select components (Apache, MySQL, PHP)
   - Choose default browser (or skip)
4. Complete the installation

#### Step 2: Start WAMP Server
1. Launch WAMP Server from the Start menu
2. Wait for the WAMP icon in the system tray to turn **green** (indicating all services are running)
   - **Orange/Yellow**: Some services are starting
   - **Red**: Services failed to start (check port conflicts)

#### Step 3: Configure MySQL (if needed)
1. Right-click the WAMP icon → **Tools** → **MySQL** → **MySQL Console**
2. If prompted for a password, press Enter (default is empty password)
3. You can also access phpMyAdmin:
   - Right-click WAMP icon → **Localhost** → **phpMyAdmin**
   - Or visit: `http://localhost/phpmyadmin`

#### Step 4: Verify MySQL Port
1. Right-click WAMP icon → **Tools** → **Check MySQL port**
2. Note the port number (usually **3306**)
3. If port 3306 is in use, you may need to change it in WAMP settings

### 7.3 Setting Up the Project in Visual Studio Code

#### Step 1: Open Project in VS Code
1. Open Visual Studio Code
2. Click **File** → **Open Folder**
3. Navigate to your project directory:
   ```
   D:\3rd Year Project\Student-Record-Management-System
   ```
4. Click **Select Folder**

#### Step 2: Open Integrated Terminal
1. In VS Code, press `Ctrl + `` (backtick) to open the terminal
2. Or go to **Terminal** → **New Terminal**
3. Ensure you're in the project root directory

### 7.4 Installing Project Dependencies

#### Step 1: Install Frontend Dependencies
1. In the VS Code terminal, run:
   ```bash
   yarn install
   ```
2. Wait for installation to complete (this may take a few minutes)
3. Verify installation: Check that `node_modules` folder was created

#### Step 2: Install Backend Dependencies
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   yarn install
   ```
3. Wait for installation to complete
4. Verify installation: Check that `node_modules` folder exists in `backend/`

### 7.5 Database Configuration

#### Step 1: Create Database in WAMP/MySQL
1. Ensure WAMP Server is running (green icon)
2. Open phpMyAdmin:
   - Right-click WAMP icon → **Localhost** → **phpMyAdmin**
   - Or visit: `http://localhost/phpmyadmin`
3. Login (usually no password for root user)
4. Click on **New** in the left sidebar to create a new database
5. Enter database name: `sis_data`
6. Select collation: `utf8mb4_general_ci`
7. Click **Create**

**Alternative Method (Using MySQL Console):**
1. Right-click WAMP icon → **Tools** → **MySQL** → **MySQL Console**
2. Run the following command:
   ```sql
   CREATE DATABASE IF NOT EXISTS sis_data CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```
3. Type `exit` to close the console

#### Step 2: Configure Environment Variables
1. In VS Code, navigate to the `backend` folder
2. Create a `.env` file in the `backend` directory (if it doesn't exist)
3. You can use the setup script:
   ```bash
   cd backend
   yarn setup-env
   ```
4. When prompted, enter the following information:
   - **Database Host**: `localhost` (or press Enter for default)
   - **Database Port**: `3306` (or your WAMP MySQL port)
   - **Database Username**: `root` (or press Enter for default)
   - **Database Password**: Leave empty (WAMP default) or enter your MySQL password
   - **Database Name**: `sis_data` (or press Enter for default)
   - **JWT Secret**: Leave empty to auto-generate (recommended)

**Manual Configuration (Alternative):**
If you prefer to create the `.env` file manually:
1. Create a file named `.env` in the `backend` directory
2. Add the following content:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sis_data
   JWT_SECRET=your-secret-key-here
   ```
3. Replace `your-secret-key-here` with a random string (or leave it empty and run `yarn setup-env`)

#### Step 3: Initialize Database Schema
1. Ensure WAMP Server is running and MySQL is active
2. In the VS Code terminal (still in `backend` directory), run:
   ```bash
   yarn init-db
   ```
3. This will:
   - Connect to MySQL
   - Create the database (if it doesn't exist)
   - Create all required tables
   - Seed the default admin user

4. **Expected Output:**
   ```
   📡 Connected to MySQL server
   📄 Reading database schema file...
   🔧 Creating database and tables...
   ✅ Database schema executed successfully
   ✅ Database and tables created successfully!
   👤 Admin user created
      Username: admin
      Password: admin123
      ⚠️  Please change this password immediately!
   ```

5. **Verify Database Creation:**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Select `sis_data` database from the left sidebar
   - Verify that all tables are created (users, students, programs, majors, courses, enrollments, grades, etc.)

### 7.6 Running the Application

#### Step 1: Start the Backend Server
1. In VS Code, open a terminal
2. Navigate to the backend directory (if not already there):
   ```bash
   cd backend
   ```
3. Start the backend server:
   ```bash
   yarn dev
   ```
4. **Expected Output:**
   ```
   Server is running on port 3000
   ✅ Database connected successfully
   📊 Connected to: sis_data on localhost:3306
   ```
5. **Keep this terminal open** - the backend server must remain running

#### Step 2: Start the Frontend Server
1. Open a **new terminal** in VS Code:
   - Click the **+** button next to the terminal tab
   - Or press `Ctrl + Shift + `` (backtick)
2. Make sure you're in the **root directory** of the project (not in `backend`)
3. Start the frontend development server:
   ```bash
   yarn dev
   ```
4. **Expected Output:**
   ```
   VITE v7.1.7  ready in XXX ms
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```
5. The frontend will automatically open in your browser, or navigate to: `http://localhost:5173`

### 7.7 Accessing the Application

1. **Open your web browser** (Chrome, Firefox, Edge, etc.)
2. Navigate to: `http://localhost:5173`
3. You should see the **Login page**
4. **Default Login Credentials:**
   - **Username**: `admin`
   - **Password**: `admin123`
5. Click **Login**
6. You should now be redirected to the Dashboard

### 7.8 Troubleshooting Common Issues

#### Issue 1: WAMP Server Icon is Red/Orange
**Solution:**
- Check if port 80 (Apache) or 3306 (MySQL) is already in use
- Right-click WAMP icon → **Tools** → **Check port 80** or **Check MySQL port**
- If ports are in use, stop the conflicting service or change WAMP ports

#### Issue 2: Database Connection Failed
**Solution:**
- Verify WAMP Server is running (green icon)
- Check MySQL service is active in WAMP
- Verify database credentials in `backend/.env` file
- Test connection using phpMyAdmin: `http://localhost/phpmyadmin`

#### Issue 3: "Cannot find module" Error
**Solution:**
- Make sure you ran `yarn install` in both root and `backend` directories
- Delete `node_modules` folders and `yarn.lock` files, then run `yarn install` again
- Verify Node.js and Yarn are properly installed: `node --version` and `yarn --version`

#### Issue 4: Port 3000 or 5173 Already in Use
**Solution:**
- Close other applications using these ports
- Or change the ports in:
  - Backend: `backend/server.js` (look for `PORT` variable)
  - Frontend: `vite.config.js` (look for `server.port`)

#### Issue 5: Database Schema Not Created
**Solution:**
- Verify the SQL file exists: `backend/sql/srms_schema.sql`
- Check database credentials in `.env` file
- Manually import the SQL file using phpMyAdmin:
  1. Open phpMyAdmin
  2. Select `sis_data` database
  3. Click **Import** tab
  4. Choose file: `backend/sql/srms_schema.sql`
  5. Click **Go**

#### Issue 6: "yarn: command not found"
**Solution:**
- Install Yarn globally: `npm install -g yarn`
- Verify installation: `yarn --version`
- Restart VS Code terminal after installation

### 7.9 Development Workflow

#### Daily Development:
1. **Start WAMP Server** (if not already running)
2. **Start Backend**: Open terminal → `cd backend` → `yarn dev`
3. **Start Frontend**: Open new terminal → `yarn dev` (in root directory)
4. **Make changes** to code in VS Code
5. **Test changes** in browser at `http://localhost:5173`

#### Stopping the Servers:
1. **Frontend**: Press `Ctrl + C` in the frontend terminal
2. **Backend**: Press `Ctrl + C` in the backend terminal
3. **WAMP Server**: Right-click WAMP icon → **Stop All Services** (optional)

### 7.10 Important Notes

- **Always keep WAMP Server running** when working with the application
- **Backend server must run on port 3000** (or update frontend API URL if changed)
- **Frontend server runs on port 5173** (Vite default)
- **Database password**: WAMP Server default is empty (no password)
- **Change admin password** immediately after first login for security
- **Backup database regularly** using phpMyAdmin export feature

## 8. Notable Recent Cleanups

- Removed unused debug endpoints/scripts and noisy console logs across backend and frontend.
- Hardened students API filters to run entirely in SQL and restored authentication middleware.
- Simplified major/course retrieval logic and added proper error codes.
- Updated documentation (`README.md`, `EDIT-FORM-FIX.md`) to reflect the leaner onboarding experience.

## 9. Ideas for Future Enhancements

- Expand automated testing (Jest + Supertest) for critical routes and React components.
- Introduce role-based UI gating on the frontend sidebar and quick actions.
- Add server-side validation middleware (e.g., Joi schemas) consistently across all POST/PUT routes.
- Implement pagination on the frontend tables to match backend paged endpoints (students, archived records).
- Containerize the stack with Docker for easier deployment.

---

This overview complements the existing `README.md` by focusing on architecture, key modules, and operational practices. Update it whenever new domains or workflows are added to keep onboarding smooth.

