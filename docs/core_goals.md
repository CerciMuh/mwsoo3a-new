# 🏗️ Core Goal Build Plan (Copilot Prompts)

## Phase 1 — Health Check

**Backend Prompt:**  
Create a simple Express server with CORS enabled.  
Add a `GET /health` endpoint that returns `{ status: 'ok' }`.  
Listen on port 4000.  

**Frontend Prompt:**  
In `App.tsx`, fetch `http://localhost:4000/health` on mount,  
and display the status inside a `<p>` tag.  

---

## Phase 2 — Local Database (SQLite with better-sqlite3)

**Setup Commands:**  
npm install better-sqlite3 bcrypt jsonwebtoken dotenv  

**Schema Prompt:**  
Create a local SQLite database `dev.db` using better-sqlite3.  
On server startup, ensure a `users` table exists with:  
- id (INTEGER PRIMARY KEY AUTOINCREMENT)  
- email (TEXT UNIQUE)  
- password (TEXT)  

**Auth Endpoints Prompt:**  
In Express backend, add:  
- `POST /register`: insert new user (hash password with bcrypt).  
- `POST /login`: check email + password,  
  return a JWT if valid, error otherwise.  

Use `jsonwebtoken` for JWT creation.  
Store secret in `.env` file (e.g., `JWT_SECRET=supersecret`).  

---

## Phase 3 — University Structure

**Schema Prompt:**  
Add tables to SQLite:  
- universities (id, name)  
- degrees (id, name, universityId)  
- classes (id, name, degreeId)  
- user_classes (id, userId, classId)  

**Endpoints Prompt:**  
In Express backend, add:  
- `GET /universities`: return universities with degrees + classes  
- `POST /join-class`: let a user join a class (insert into user_classes)  

---

## Phase 4 — File Uploads (Local)

**Backend Prompt:**  
Add an Express endpoint `POST /upload` that accepts file uploads  
using multer, saves them to `/uploads`, and stores metadata in DB:  
filename, uploaderId, classId.  

**Frontend Prompt:**  
Create a file upload form. On submit, send file to `/upload`.  
Display a list of files retrieved from a `GET /files` endpoint.  

---

## 🚀 Build Flow

1. Phase 1 → Confirm backend ↔ frontend connection.  
2. Phase 2 → Add local DB + user auth.  
3. Phase 3 → Add university/degree/class schema + selection.  
4. Phase 4 → Enable file uploads + browsing.  

Test after **each phase** before moving forward.

## Phase 3 — University Structure and Seeding

**Schema Prompt:**  
Extend the SQLite schema to include a `universities` table with:  
- id (INTEGER PRIMARY KEY AUTOINCREMENT)  
- name (TEXT UNIQUE)  
- country (TEXT)  
- domain (TEXT UNIQUE)  

Also, add `universityId` column to the `users` table (nullable).  

---

**Seeding Prompt:**  
Create a `seedUniversities.js` script that:  
- Contains an array of at least the top 1000 global universities (name, country, domain).  
- Iterates through the array and inserts them into the `universities` table if not already present.  
- Can be run with `node seedUniversities.js` to populate the DB.  

---

**Auth Integration Prompt:**  
When a user registers:  
- Extract the domain from their email (e.g., `manchester.ac.uk`).  
- Match it against the `universities.domain`.  
- If found, set `user.universityId` automatically.  
- If not found, leave `universityId` as NULL.  

---

**Endpoints Prompt:**  
In Express backend, add:  
- `GET /universities`: return all universities with id, name, and country.  
- `GET /me/university`: return the logged-in user’s university (joined by `universityId`).  




**Frontend Prompt (Dashboard UI):**  
Create a `Dashboard.tsx` component with a modern UI using React and Tailwind CSS.  
- On mount, call `GET /me/university` and display:  
  - The logged-in user’s email  
  - Their assigned university name + country  
- Add a section “Joined Classes” and fetch from a future `GET /my-classes` endpoint (empty state for now).  
- Add a page `Universities.tsx` that fetches `GET /universities` and lists them in a searchable table or grid with Tailwind styling.  

