<div align="center">

# Eligify

**A high-performance, full-stack Government Exam Ecosystem**  
*From AI-driven eligibility matching to premium preparation tracking — the complete aspirant journey, engineered.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🚀 Recent Major Updates
- ✨ **Premium UI Redesign**: Fully immersive dark-mode experience with Glassmorphism, liquid animations (Framer Motion), and Bento-grid layouts.
- 🔐 **Google OAuth 2.0 & One-Tap**: Seamless, one-click authentication integrated with backend auto-provisioning and secure "passwordless" schemas.
- 📂 **Secure Document Wallet**: A centralized, encrypted vault for storing and managing critical exam documents (IDs, Certificates, etc.).
- ⚡ **Enhanced Eligibility Engine**: Optimized multi-path education parsing and real-time category-based age relaxation.

---

## 🗺️ Table of Contents

- [What is Eligify?](#what-is-eligify)
- [Architecture](#architecture)
  - [Backend: REST API Design](#backend-rest-api-design)
  - [Security Layer](#security-layer)
  - [Database: PostgreSQL Schema Design](#database-postgresql-schema-design)
- [Feature Deep-Dive](#feature-deep-dive)
  - [The Matching Engine](#the-matching-engine)
  - [Premium Dashboard](#premium-dashboard)
  - [Document Wallet](#document-wallet)
- [The Engineering Mindset](#the-engineering-mindset)
- [About the Developer](#about-the-developer)
- [Getting Started](#getting-started)
- [License](#license)

---

## 💡 What is Eligify?

Eligify is the definitive solution for India's government exam landscape. It eliminates the manual effort of scanning hundreds of notifications by providing a **"Match Once, Track Always"** experience. 

By mapping your academic DNA (qualifications, boards, percentages) against our deeply structured exam database, the engine provides:
- **Instant Eligibility**: A clean, prioritized list of exams you qualify for *today*.
- **Near-Match Intelligence**: Tells you exactly what you're missing (e.g., "Need 5% more in 12th" or "Missing NCC-C Certificate").
- **Full Preparation Lifecycle**: From eligibility to the exam date, with integrated tasks, notes, and study streaks.

---

## 🏗️ Architecture

```
eligify/
├── client/                    # React 18 + Vite + TypeScript frontend
│   └── src/
│       ├── pages/             # Premium Glassmorphic Page Components
│       ├── components/        # Reusable UI (Loader, Bento Cards, Modal)
│       ├── store/             # Global State Management
│       └── utils/             # API wrappers & dynamic SEO (RouteSeo)
├── server/                    # Node.js + Express + PostgreSQL API
│   └── src/
│       ├── eligibilityEngine/ # The Core "Brain" (Rules & Normalization)
│       ├── controllers/       # Optimized handlers (Exam, User, PrepTracker)
│       ├── routes/            # Scalable REST definitions
│       ├── middlewares/       # JWT Auth, Google Auth & Joi Validation
│       ├── queue/             # BullMQ (Redis) for Async Notifications
│       └── utils/             # Validation Schemas (Joi)
└── shared/                    # Root-level Shared Constants & Validation Logic
```

### 📡 Backend: REST API Design

The API is built for high concurrency, utilizing PostgreSQL indexing and Redis caching to serve complex eligibility results in sub-100ms.

| Resource Group | Endpoints | Key Feature |
|---|---|---|
| **Authentication** | `POST /api/users/signup`, `POST /api/users/login`, `POST /api/users/google-login` | JWT + Google OAuth 2.0 |
| **Profile** | `GET /api/users/profile`, `POST /api/users/studentDetails` | Dynamic Joi Validation |
| **Eligibility** | `GET /api/exams/eligible`, `GET /api/users/check-eligibility/:postId` | Multi-path Logic Engine |
| **Prep Tracker** | `GET/POST /api/preptracker/tasks`, `PATCH /tasks/:id/toggle` | Progress Percentage Rings |
| **Knowledge Base** | `GET/PUT /api/preptracker/notes`, `GET/POST /api/preptracker/daily-notes` | Persistence-first Study Logs |
| **Analytics** | `GET /api/preptracker/stats` | SQL-aggregated Activity Maps |
| **Wallet** | `GET/POST /api/documents` | Secure Document Management |

### 🔒 Security & Data Integrity

- **OAuth 2.0 Integration**: Implements a secure "passwordless" pattern for Google users, generating unique, locked hashes for database compliance without sacrificing security.
- **Input Sanitization**: Every username is sanitized (alphanumeric only) and truncated to ensure zero database overflows.
- **Stateless Auth**: JWT-based session management with auto-expiring tokens.
- **Modular Validation**: Joi schemas for every incoming request, ensuring the database never receives malformed data.

---

## 🔬 Feature Deep-Dive

### 🏎️ The Matching Engine
The engine uses a **registry-based pipeline** to evaluate candidates against posts. It handles:
- **Age Relaxation**: Dynamically computes relaxation years based on `Category` (OBC/SC/ST) and `PwD` status against specific post-dated criteria.
- **Education Pathing**: Uses short-circuit OR logic to evaluate multiple qualifying degrees (e.g., "Any Graduate" vs "B.Sc Physics").
- **Normalization Layer**: Standardizes different board names and grading systems (CGPA to Percentage) before evaluation.

### 💎 Premium Dashboard
A world-class user interface built with **Framer Motion** and **Tailwind CSS**.
- **Bento-Grid Layout**: Optimized for high-density information display.
- **Glassmorphism**: Translucent UI elements with real-time backdrop filtering.
- **Dynamic Streaks**: Calculated on the fly using SQL window functions to track preparation consistency.

### 📂 Document Wallet
A secure storage solution where students can:
- Store digital copies of 10th/12th Marksheets, ID Proofs, and Caste Certificates.
- Link documents directly to specific exam applications.
- Receive "Missing Document" alerts based on specific exam requirements.

---

## 🧠 The Engineering Mindset

Eligify is a testament to **First-Principles Thinking**. Every feature is mapped to a computer science core:
- **Eligibility Engine**: A constraint-satisfaction pipeline.
- **Streak Logic**: A sliding-window consecutive sequence algorithm (LeetCode #128).
- **Google OAuth**: A cryptographically secure identity handshake.
- **Progress Rings**: SVG-based dynamic data visualization.

---

## 👨‍💻 About the Developer

**Himanshu Kumar**  
B.Tech CSE — BIT Mesra, Jaipur Campus (2023–2027) | GPA: 8.3/10  

- 🎖️ **SSB Recommended**: Recommended by the Service Selection Board for the Indian Armed Forces — showcasing leadership, logic, and composure.
- 💻 **DSA Focused**: 100+ LeetCode problems solved, specializing in pattern recognition and system optimization.
- 🏫 **Ex-Sainik**: Discipline and engineering rigor from Sainik School, Gopalganj (96.5% Class X).

**Tech Stack**: JavaScript (ES6+), TypeScript, React, Node.js, Express, PostgreSQL, Redis, BullMQ, Framer Motion, Tailwind CSS.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for Notifications/BullMQ)
- Google Cloud Console Project (for OAuth)

### Quick Start
1. **Clone & Install**
   ```bash
   git clone https://github.com/himanshukumar1218/eligify.git
   cd eligify
   cd server && npm install
   cd ../client && npm install
   ```

2. **Environment Setup**
   Create `server/.env` with your DB, Redis, and Google Client credentials.

3. **Run Development Mode**
   ```bash
   # Terminal 1: Server
   cd server && npm run dev
   # Terminal 2: Frontend
   cd client && npm run dev
   ```

---

## 📜 License
MIT © [Himanshu Kumar](https://github.com/himanshukumar1218)
