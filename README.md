# 🏋️‍♂️ FITTRACK — Modern Gym Management & Fitness SaaS

A full-stack, enterprise-grade commercial gym management web application built with **React.js (Vite)** and **Python Django REST Framework**.

---

## 🎨 Theme & Design Specs

- **Background**: `#0B0F0E` (Deep Gym Dark)
- **Sidebar & Panels**: `#111715`
- **Dashboard Cards**: `#17211D`
- **Primary Accent**: Electric Lime (`#B6F23A`)
- **Secondary Accent**: `#86C232`
- **Text**: White & Light Grey
- **Borders**: Subtle `#21302A`

---

## 🏛️ System Architecture

```
FitTrack/
├── backend/                  # Python Django 5 + Django REST Framework
│   ├── fittrack_backend/     # Settings, URL router, JWT config, CORS
│   ├── users/                # Custom User model (Admin, Trainer, Member), Auth, Profiles
│   ├── memberships/          # Plans (1, 3, 6, 12 months), Subscriptions, Renewals
│   ├── attendance/           # Daily check-ins, duplicate entry prevention, statistics
│   ├── workouts/             # Workout programs, weekday splits (Mon-Sun), exercises
│   ├── payments/             # Billing records, payment modes (Cash, Card, UPI), receipts
│   ├── fitness/              # Body composition, weight progression, anthropometry
│   ├── analytics/            # Live dashboard aggregation, revenue trends, check-in curves
│   └── manage.py
│
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, Navbar, DashboardLayout
│   │   │   └── ui/           # Button, Card, Badge, Modal, StatsCard, Toast, Spinner
│   │   ├── context/          # AuthContext (JWT auth state, auto-refresh)
│   │   ├── services/         # Axios API client with interceptors
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Hero, Features, About, Impact, Contact, Footer
│   │   │   ├── auth/                   # LoginPage, RegisterPage
│   │   │   ├── admin/                  # Dashboard, Members, Trainers, Memberships,
│   │   │   │                           # Attendance, Workouts, Payments, Fitness
│   │   │   ├── trainer/                # TrainerDashboard
│   │   │   └── member/                 # MemberDashboard
│   │   ├── App.jsx           # React Router DOM + Role-Based Protected Routes
│   │   └── main.jsx
│   └── package.json
└── run_dev.ps1               # Single-click launcher for both services
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

```powershell
cd c:\Users\Samriddha\Desktop\FitTrack\backend

# Run migrations (already executed)
python manage.py migrate

# Seed realistic database records (already executed)
python manage.py seed_data

# Start Django REST API server
python manage.py runserver 8000
```
Backend runs on `http://127.0.0.1:8000/`

### 2. Frontend Setup & Run

```powershell
cd c:\Users\Samriddha\Desktop\FitTrack\frontend

# Start Vite React development server
npm run dev
```
Frontend runs on `http://localhost:5173/`

### 3. Single-Click Launch (PowerShell)

You can launch both servers simultaneously:
```powershell
.\run_dev.ps1
```

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@fittrack.com` | `admin123` | Full administrative control, all 10 modules, financials |
| **Fitness Trainer** | `alex@fittrack.com` | `trainer123` | Trainer portal, assigned athletes, workouts, attendance |
| **Fitness Trainer** | `sarah@fittrack.com` | `trainer123` | Trainer portal, assigned athletes, workouts, attendance |
| **Gym Member** | `rahul@example.com` | `member123` | Personal member portal, subscription status, workout split |

---

## 📱 Modules & Implemented Features

1. **Landing Page**:
   - Hero banner with headline: *"Manage Your Fitness. Transform Your Gym."*
   - Interactive floating statistics and impact numbers
   - Features grid: Member Lifecycle, Instant Attendance, Flexible Memberships, Workout Programming, Payment Receipts, Fitness Progression
   - About section & Live club snapshot
   - Contact form with address, phone & email
   - Professional footer

2. **Authentication & Authorization**:
   - JWT token authentication (`djangorestframework-simplejwt`)
   - Secure login with Show/Hide password toggle & quick-demo autofill buttons
   - Registration with password confirmation and client role assignment (public admin registration prevented)
   - Role-based route protection for Admin, Trainer, and Member

3. **Admin Dashboard**:
   - 6 Live operational metric cards: Total Members, Active Members, Trainers, Memberships, Today's Check-ins, Monthly Revenue
   - 6-month Revenue trend area chart (Recharts)
   - 7-day Attendance volume bar chart
   - Recent registrations, recent billing transactions, and upcoming expiring memberships

4. **Member Management**:
   - Add new member with full contact & emergency details
   - Search by name, email, or phone
   - Active/Inactive filtering
   - Member profile view modal
   - Edit member details
   - Deactivate member

5. **Trainer Management**:
   - Trainer cards with specializations and years of experience
   - Modal to assign/unassign members to coaches
   - Edit trainer qualifications and bio

6. **Membership Plans & Subscriptions**:
   - Multi-tier plan configuration: Monthly, Quarterly, Half-Yearly, Yearly
   - Assign subscription to member with start and calculated expiry dates
   - Single-click membership renewal
   - Status indicators (Active vs Expired)

7. **Daily Attendance Registry**:
   - Date picker to query any historical or current day
   - Quick one-tap check-in with optional locker key notes
   - Duplicate check-in prevention (both database constraint & UI validation)
   - Real-time check-in count for the selected date

8. **Workout Programming**:
   - Create multi-day split routines (Monday through Friday/Sunday)
   - Add specific exercises with sets, target reps, and rest intervals (seconds)
   - Assign workout routines directly to gym members

9. **Payments & Billing**:
   - Financial summaries: Total revenue collected, pending dues
   - Record payment transactions with modes (UPI, Card, Cash, Bank Transfer)
   - Instant printable official receipt / PDF with receipt numbers and timestamps

10. **Fitness Progression & Anthropometry**:
    - Weight progression curve over time using dynamic Recharts
    - Body measurements: Height, Weight, Body Fat %, Chest, Waist, Hips, Bicep
    - Previous vs current measurement comparisons
    - Full measurement history log

11. **Trainer Portal**:
    - Dedicated athlete roster view
    - Coached workout routines
    - Quick check-in shortcut

12. **Member Portal**:
    - Strictly scoped personal portal (members only see their own records)
    - Active membership plan and expiry countdown
    - Assigned personal coach details
    - Today's workout schedule and daily split
    - Personal weight progression chart
    - Attendance history and payment receipts
