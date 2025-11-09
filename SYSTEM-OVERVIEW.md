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

## 7. Running the System

1. **Install frontend dependencies:** `yarn install`
2. **Install backend dependencies:** `cd backend && yarn install`
3. **Create environment file:** `yarn setup-env` (prompts for DB credentials)
4. **Initialize schema:** `yarn init-db` (optional if schema already exists)
5. **Start servers:**
   - Frontend: `yarn dev`
   - Backend: `cd backend && yarn dev`

Visit `http://localhost:5173` and log in with the seeded admin credentials.

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

