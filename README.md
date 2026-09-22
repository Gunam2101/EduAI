# LearnTrack AI (PS52) — Student Learning Difficulty Detection & Personalized Study Planning System
*Understand Learning. Personalize Growth.*

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TypeScript-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203-009688)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS%203.4-38B2AC)](https://tailwindcss.com/)
[![ML](https://img.shields.io/badge/ML-Scikit--Learn-orange)](https://scikit-learn.org/)
[![Dataset](https://img.shields.io/badge/Dataset-300%20Records%20(Real)-success)](./dataset/student_dropout_behavior_dataset.csv)

**Problem ID**: PS52  
**Domain**: Smart Education & Student Analytics (Indian Engineering College Context)  
**Brand**: LearnTrack AI  
**Tagline**: *Understand Learning. Personalize Growth.*  
**Target Audience**: Indian engineering college students, faculty mentors, and academic administrators.  
**Affiliation Pattern**: Autonomous / State Technical University (Anna University / VTU / AICTE Model Curriculum aligned).  

---

## 1. System Overview & Key Capabilities

- **Indian Engineering College Context & Terminology**:
  - Semester, Continuous Internal Assessment (CIA), Internal Test (Midterm - 30 Marks), End Semester Examination (50 Marks), Theory & Practical Lab Attendance, Unit, Topic, Faculty Mentor, Department (AI & Data Science, CSE, IT), Section (A, B, C), and Regulation 2021.
  - Realistic Indian student names used consistently across all 300 student records (e.g. *Arjun Kumar*, *Karthik S*, *Priya M*, *Harini P*, *Rahul V*, *Sneha R*, *Vignesh K*, *Divya S*, *Aditya R*, *Nandhini M*, etc.) with student IDs (1–300) preserved.
- **Application-Level Indian Engineering Subject Mapping Layer**:
  - Transparent application-level academic structure mapping continuous assessment indicators to 12 core Indian engineering subjects and exact unit topics:
    1. Engineering Mathematics (Matrices, Differential Equations, Probability, Statistics, Linear Algebra)
    2. Data Structures & Algorithms (Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching)
    3. Database Management Systems (ER Model, SQL, Relational Algebra, Normalization, Transactions, Indexing)
    4. Python Programming (Variables & Data Types, Functions, Lists & Dictionaries, OOP, File Handling, Exception Handling)
    5. Object Oriented Programming (Classes & Objects, Inheritance, Polymorphism, Abstraction, Encapsulation)
    6. Computer Networks (OSI Model, TCP/IP, IP Addressing, Routing, Transport Layer, Network Security)
    7. Operating Systems (Processes, Threads, CPU Scheduling, Deadlocks, Memory Management, File Systems)
    8. Machine Learning (Data Preprocessing, Feature Engineering, Linear Regression, Classification, Clustering, Model Evaluation)
    9. Artificial Intelligence (Search Algorithms, Knowledge Representation, Expert Systems, Neural Networks, AI Agents)
    10. Statistics & Probability (Descriptive Statistics, Probability, Distributions, Correlation, Regression, Hypothesis Testing)
    11. Big Data Analytics (Hadoop, MapReduce, Spark, Data Processing, Distributed Systems)
    12. Natural Language Processing (Text Preprocessing, Tokenization, Stemming, TF-IDF, Word Embeddings, Text Classification)
- **Personalized 5-Stage Learning Roadmap Engine**:
  - The Learning Roadmap is the **primary personalized feature** integrating diagnostic indicators and recommendations directly into an actionable learning journey:
    `Student Data` $\rightarrow$ `Performance Analysis` $\rightarrow$ `Weak Areas` $\rightarrow$ `Subject Mapping` $\rightarrow$ `Personalized Learning Roadmap` $\rightarrow$ `Practice` $\rightarrow$ `Assessment` $\rightarrow$ `Progress Tracking`
  - Differentiated 5 sequential stages per student based on their diagnostic deficiency:
    - **STEP 1: Foundation** (Core theory and review)
    - **STEP 2: Concept Building** (In-depth topics and mechanics)
    - **STEP 3: Guided Practice** (Problem sets, coding exercises, practice MCQs)
    - **STEP 4: Assessment** (Continuous Internal Assessment simulation)
    - **STEP 5: Progress Check** (Longitudinal benchmark against baseline marks)
  - Interactive on-page practice assessment modal with real questions, immediate scoring, and automatic progress advance.
- **Simplified Student Portal**:
  - Student navigation strictly contains ONLY 5 items + Logout:
    1. **Dashboard** (`/student/dashboard`)
    2. **My Performance** (`/student/performance`)
    3. **Learning Roadmap** (`/student/roadmap`)
    4. **My Progress** (`/student/progress`)
    5. **Profile** (`/student/profile`)
  - No separate recommendations section on the Student Dashboard; recommendations are natively integrated into the Learning Roadmap steps.
  - Student Dashboard highlights **Overall Performance**, **Quiz Average**, **Midterm Exam**, **End Sem Exam**, **Attendance**, **Assignment Completion**, **Learning Status**, **Current Roadmap Progress**, and **Next Learning Step** (`[Continue Roadmap]`).
- **Clean Role Architecture**:
  - Role selection belongs **strictly to the login page** (Admin, Faculty, Student).
  - The top navbar role switcher tabs (`Admin | Faculty | Student`) are **completely removed** from all authenticated dashboards.
- **Authentic Dataset Foundation**: 300 student records from `student_dropout_behavior_dataset.csv` with zero arbitrary synthetic replacement metrics.

---

## 2. Dataset Integration & Data Cleaning

The system imports and validates `student_dropout_behavior_dataset.csv` (300 records) on startup:

| Field | Source Range | Description |
|---|---|---|
| `student_id` | 1 – 300 | Unique student identifier |
| `name` | String | Full name |
| `age` | 18 – 25 | Student age |
| `gender` | Male / Female | Gender |
| `quiz1_marks`, `quiz2_marks`, `quiz3_marks` | 0 – 10 | Continuous assessment quiz marks |
| `total_assignments` | 5 | Total assignments assigned |
| `assignments_submitted` | Imputed [0, 5] | Raw dataset null values imputed via engagement correlation: $\text{round}((\text{lectures\_attended} / \text{total\_lectures}) \times \text{total\_assignments})$ |
| `midterm_marks` | 0 – 30 | Midterm examination marks |
| `final_marks` | 0 – 50 | Semester final examination marks |
| `previous_gpa` | 0.61 – 4.00 | Prior cumulative grade point average |
| `total_lectures`, `lectures_attended` | 12 total, 0–12 attended | Theory lecture participation |
| `total_lab_sessions`, `labs_attended` | 6 total, 0–6 attended | Practical laboratory sessions |

---

## 3. Explainable Difficulty Scoring Mathematical Model

### A. Normalized Dimension Scores ($[0, 100]$)
1. **Quiz Score**: $\text{Quiz} = \frac{\text{quiz1} + \text{quiz2} + \text{quiz3}}{30} \times 100$
2. **Exam Score**: $\text{Exam} = \frac{\text{midterm} + \text{final}}{80} \times 100$
3. **Attendance Score**: $\text{Att} = \frac{\text{lectures\_attended} + \text{labs\_attended}}{18} \times 100$
4. **Assignment Score**: $\text{Assign} = \frac{\text{assignments\_submitted}}{5} \times 100$
5. **GPA Score**: $\text{GPA} = \frac{\text{previous\_gpa}}{4.0} \times 100$

### B. Composite Learning Performance Score ($S_{\text{perf}}$)
$$S_{\text{perf}} = 0.20 \cdot \text{Quiz} + 0.35 \cdot \text{Exam} + 0.20 \cdot \text{Att} + 0.15 \cdot \text{Assign} + 0.10 \cdot \text{GPA}$$

### C. Difficulty Score & Risk Classification
$$\text{Difficulty Score} = 100 - S_{\text{perf}}$$

- **NORMAL (On Track)**: $S_{\text{perf}} \ge 70\%$ ($\text{Difficulty} \le 30$)
- **MODERATE ATTENTION**: $50\% \le S_{\text{perf}} < 70\%$ ($30 < \text{Difficulty} \le 50$)
- **AT RISK (High Attention)**: $S_{\text{perf}} < 50\%$ OR Attendance $< 50\%$ OR Final Exam $< 40\%$

---

## 4. Technology Stack & Project Structure

```
EduAI/
├── dataset/
│   └── student_dropout_behavior_dataset.csv     # 300 Authentic Student Records
├── backend/
│   ├── app/
│   │   ├── api/                                  # Modular FastAPI Endpoints
│   │   │   ├── auth.py                           # JWT Authentication & Role Authorization
│   │   │   ├── students.py                       # Search, Pagination, Student Dossier
│   │   │   ├── faculty.py                        # Faculty Mentoring Directory & Cohorts
│   │   │   ├── assessments.py                    # Quiz, Midterm, Final Grading Analytics
│   │   │   ├── attendance.py                     # Lecture & Practical Lab Attendance
│   │   │   ├── analytics.py                      # Recharts Dataset Aggregation
│   │   │   ├── curriculum.py                     # Subject -> Unit -> Topic -> Assessment
│   │   │   ├── difficulty.py                     # Scoring & Explanation Logic
│   │   │   ├── study_plans.py                    # 7-Day Personalized Schedule Generator
│   │   │   ├── progress.py                       # Longitudinal Cohort Progression
│   │   │   ├── alerts.py                         # Automated Early Warning System
│   │   │   ├── reports.py                        # CSV & PDF Report Generators
│   │   │   └── settings.py                       # Live Scoring Weight Calibration
│   │   ├── database/                             # SQLAlchemy Models & Connection
│   │   ├── schemas/                              # Pydantic Request/Response Schemas
│   │   ├── services/                             # Data Cleaning & Ingestion Services
│   │   ├── ml/                                   # Scikit-Learn Pipeline
│   │   └── main.py                               # FastAPI Application Entrypoint
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/                           # Reusable UI (Cards, Badges, Modals, etc.)
    │   ├── context/                              # AuthContext with 1-Click Role Switcher
    │   ├── layouts/                              # Sidebar, Topbar, Responsive Mobile Drawer
    │   ├── pages/                                # Admin, Faculty, and Student Portals
    │   ├── services/                             # Typed API Client
    │   └── types/                                # TypeScript Interfaces
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 5. Deployment & Production Operations

### Environment Variables

#### Backend (`backend/.env` / Environment Variables)
| Variable | Default | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | Deployment environment (`development` or `production`) |
| `HOST` | `0.0.0.0` | Host address to bind the production server |
| `PORT` | `8000` | Port for the backend application (supports PaaS `$PORT`) |
| `SECRET_KEY` | `eduai_super_secret_jwt_key_ps52_academic_system` | Secret key for signing and verifying JWT tokens |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT token validity window (24 hours) |
| `DATABASE_URL` | `sqlite:///./eduai.db` | SQLAlchemy connection string (`sqlite:///./eduai.db` or `postgresql://user:pass@host:5432/dbname`) |
| `FRONTEND_URL` | `http://localhost:5173` | Production origin of the frontend web application |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed CORS domains |

#### Frontend (`frontend/.env` / Build Variables)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Base API URL for API client requests (`/api` behind reverse proxy, or full backend URL) |
| `VITE_BACKEND_URL` | `http://localhost:8001` | Target URL for the Vite development reverse proxy |

---

### Local Development Quick Start

#### Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```
- API Docs: `http://localhost:8001/docs`
- Root Status: `http://localhost:8001/`

#### Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173/`

---

### Production Deployment & Build

#### Frontend Production Build
```bash
cd frontend
# 1. Clean install dependencies
npm install

# 2. Compile TypeScript and generate optimized Vite/Rollup production bundle
npm run build

# 3. Preview production build locally
npm run preview
```
The compiled static assets are generated in `frontend/dist/` ready for hosting on Nginx, Caddy, Vercel, Netlify, or AWS CloudFront.

#### Backend Production Execution
```bash
cd backend
pip install -r requirements.txt

# Run production Uvicorn server with 0.0.0.0 binding and production workers:
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4
```

---

## 6. Security, Isolation & Multi-Role Architecture

1. **Strict Student Isolation**:
   - Authenticated student accounts (`role: Student`) can strictly only access their own academic records matching their assigned `student_id`.
   - Direct requests to access another student's record (`/api/students/{other_id}`, `/api/predictions/student/{other_id}`) return **HTTP 403 Forbidden**.
   - Admin and Faculty roles possess institutional and cohort supervision authority.
2. **Dynamic Identity Context**:
   - Student identities are dynamically retrieved from the institutional database.
   - Dynamic profile tester allows evaluating the 300 Indian engineering cohort across all views (e.g. *Vignesh K* Roll #7, *Harini P* Roll #4, *Arjun Kumar* Roll #1, *Sneha R* Roll #6) with zero hardcoded identity fallbacks.
3. **Robust Error Handling**:
   - Full `<ErrorBoundary>` prevents screen crashes across all routes.
   - Reusable `LoadingState`, `EmptyState`, and `ErrorState` (with one-click `Retry` triggers) on all API-dependent views.

---

## 7. Demo Accounts & Credentials

| Role | Email | Password | Default Scope |
|---|---|---|---|
| **Admin (Dean / Principal)** | `admin@ps52.edu` | `admin123` | Institutional supervision, all 300 students, faculty mentors, weights calibration |
| **Faculty Mentor** | `faculty@ps52.edu` | `faculty123` | Department cohort supervision, remedial interventions, assessments monitoring |
| **Student** | `student@ps52.edu` | `student123` | Student portal, dynamic roll switcher, personalized 5-stage roadmap, progress tracking |
