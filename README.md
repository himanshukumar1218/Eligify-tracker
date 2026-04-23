<div align="center">

# Eligify

**A production-grade, full-stack Government Exam Ecosystem**  
*From eligibility matching to preparation tracking — the complete aspirant journey, engineered.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Table of Contents

- [What is Eligify?](#what-is-eligify)
- [Architecture](#architecture)
  - [Backend: REST API Design](#backend-rest-api-design)
  - [Security Layer](#security-layer)
  - [Database: PostgreSQL Schema Design](#database-postgresql-schema-design)
- [Feature Deep-Dive](#feature-deep-dive)
  - [The Matching Engine](#the-matching-engine)
  - [Preparation Tracker](#preparation-tracker)
  - [Notes-Sharing System](#notes-sharing-system)
- [The Engineering Mindset](#the-engineering-mindset)
- [About the Developer](#about-the-developer)
- [Getting Started](#getting-started)
- [License](#license)

---

## What is Eligify?

Most government exam aspirants in India navigate a fragmented, overwhelming landscape: dozens of portals, varying eligibility criteria, complex age relaxation rules, and missed deadlines. Eligify exists to solve this problem systematically.

Fill out your profile once. The engine takes over — scanning every active exam post in the database against your academic qualifications, age (with category-based relaxations), domicile, physical standards, and certifications. You get back a clean list of exams you're **fully eligible for** and a "Near Matches" list of exams you're close to qualifying for, with a precise breakdown of what's missing.

Beyond matching, Eligify is a full preparation hub: milestone tracking, daily study logs, activity streaks, and a document wallet — all under one roof.

---

## Architecture

```
eligify/
├── client/                    # React 18 + TypeScript frontend
│   └── src/
│       ├── pages/             # Route-level page components
│       ├── components/        # Reusable UI components
│       └── utils/             # Client-side helpers
├── server/                    # Node.js + Express API
│   └── src/
│       ├── eligibilityEngine/ # Core rules engine
│       │   ├── checks/        # Modular per-criterion check functions
│       │   ├── queries/       # Engine-specific DB queries
│       │   └── utils/         # Normalization, date, and reason utilities
│       ├── controllers/       # Request/response handlers per resource
│       ├── routes/            # RESTful route definitions
│       ├── middlewares/       # Auth guard + Joi validation layer
│       ├── queue/             # BullMQ job queue (Redis-backed)
│       ├── workers/           # Background notification worker
│       └── utils/             # Validation schemas, helpers
└── shared/                    # Shared constants (eligibility criteria, options)
```

### Backend: REST API Design

The server follows a strict **resource-based URL pattern**, ensuring clear API contracts and scalability as new exam types or user features are added.

| Resource Group | Endpoints |
|---|---|
| **Auth** | `POST /api/users/signup`, `POST /api/users/login` |
| **Profile** | `GET /api/users/profile`, `POST /api/users/studentDetails` |
| **Eligibility** | `GET /api/exams/eligible`, `GET /api/users/check-eligibility/:postId` |
| **Prep Tracker** | `GET/POST /api/users/preptracker/tasks`, `PATCH .../tasks/:id/toggle` |
| **Daily Notes** | `GET/POST /api/users/preptracker/daily-notes` |
| **Aggregated Stats** | `GET /api/users/preptracker/stats` |
| **Notifications** | `GET/DELETE /api/notifications` |

### Security Layer

Every sensitive route runs through a three-layer security stack before any business logic executes:

1. **JWT (`jsonwebtoken`)** — Stateless session management. The `protect` middleware decodes and verifies the token on every protected request, attaching `req.user` for downstream use.
2. **Bcrypt** — All passwords are hashed with `bcrypt` at a configurable salt round before storage. Plain-text passwords never touch the database.
3. **Joi Schema Validation** — A dedicated `validate(schema)` middleware intercepts requests and runs them through Joi schemas (`signupSchema`, `loginSchema`, `userDetailsSchema`, `addTaskSchema`) *before* they reach the controller. Malformed or missing data is rejected at the boundary with structured error messages.

```js
// Route example — security pipeline is explicit and composable
router.post('/studentDetails', protect, validate(userDetailsSchema), userDetailsController.userDetails);
```

### Database: PostgreSQL Schema Design

The schema is designed for **multi-variable relational matching** — a single exam `post` row can have multiple education criteria paths (OR logic between paths, AND logic within a path), multiple allowed boards, streams, subjects, and separate physical standard tables per gender.

Key schema decisions:
- **`exam_posts`** — Stores per-post metadata: `min_age`, `max_age`, `age_criteria_date`, `application_start`, `application_end`, `official_link`.
- **`post_education_criteria`** — A one-to-many table linking posts to multiple qualifying education paths (e.g., "B.Tech in CS/IT *OR* MCA with 60%").
- **`post_physical_standards`** — Gender-stratified physical requirements (height, weight, chest) linked to posts.
- **`prep_tasks`** — User task rows with composite index on `(user_id, exam_id)` for `O(log N)` lookups.
- **`prep_daily_notes`** — Date-keyed study journal entries, also indexed on `(user_id, exam_id)`.
- **Stats aggregation** — Streak calculation, activity mapping, and completion rates are computed server-side via SQL aggregation rather than sending raw data to the client, keeping payloads lean.

---

## Feature Deep-Dive

### The Matching Engine

The engine (`eligibilityEngine/checkEligibility.js`) is the architectural centerpiece of Eligify. It implements a **registry-based, pluggable check pipeline** — each eligibility dimension is an isolated, composable function:

```
CHECKS = [
  { name: 'Gender',        severity: 'hard' },  // Disqualifies immediately
  { name: 'Domicile',      severity: 'hard' },
  { name: 'Education',     severity: 'hard' },
  { name: 'Age',           severity: 'hard' },
  { name: 'Certification', severity: 'soft' },  // Near-Match only
  { name: 'Physical',      severity: 'soft' },
  { name: 'Experience',    severity: 'soft' },
]
```

**Severity classification** drives the Near Match logic: a candidate with only `soft` failures (e.g., missing an optional certification) is surfaced as a "Near Match" rather than discarded — providing actionable intelligence to the aspirant. A `hard` failure (wrong education level, out-of-age-range) excludes the post entirely.

**Age with Relaxation:**
The `ageCheck` computes the candidate's exact age against the post's official `age_criteria_date` and adds `relaxation_years` to `max_age` dynamically, based on the user's stored `category` (OBC, SC/ST, PwD, etc.). The failure message is human-readable and cites the specific relaxation applied.

```js
const effectiveMaxAge = post.max_age + relaxation;
// Failure message: "Your age on 01/01/2025 is 27 years. Required: 21-30 years, including 3 year(s) of OBC relaxation."
```

**Education Multi-Path Parsing (`educationCheck.js`):**
This is the most complex check. A post can have multiple qualifying education paths. The engine iterates each path and collects granular failures:
- Qualification hierarchy (`secondary → intermediate → undergraduate → postgraduate`)
- Allowed 10th/12th boards (e.g., CBSE-only)
- Required 12th stream (Science / Commerce / Arts)
- Required 12th subjects (e.g., Physics + Mathematics)
- Minimum percentage/GPA (with automatic normalization: a GPA of 7.5 is converted to 75% for comparison)
- Degree programme and branch (e.g., B.Tech in Computer Science or IT)

If *any single path* passes all sub-checks, the candidate qualifies. This cleanly handles real-world cases like *"B.Tech in CS/IT **OR** B.Sc. in Mathematics."*

**Data Normalization:**
Before any check runs, both the user profile and the post criteria are passed through `normalizeEligibilityContext()`. This step lowercases, trims, and standardizes values from both sides, preventing failures caused by formatting inconsistencies in the raw database data.

---

### Preparation Tracker

The Prep Tracker is a **Bento-grid dashboard** backed by a dedicated, optimized API layer.

- **Milestone Tracking**: Users add tasks with due dates to a specific exam. Overdue tasks are automatically flagged. Toggling a task completion updates the progress ring in real time via an optimistic UI update, with a background sync to recalculate server-side stats.
- **Performance-First Stats**: Instead of sending all tasks to the client for aggregation, the `/preptracker/stats` endpoint runs SQL aggregations directly in PostgreSQL — computing `current_streak`, `longest_streak`, and the `activityMap` (a date-keyed frequency map of task completions) before sending a minimal payload.
- **Circular Progress Ring**: An SVG-based animated ring (`framer-motion`) transitions through a dynamic color scale: `amber (0–39%)` → `blue (40–74%)` → `cyan (75–99%)` → `emerald (100%)`.
- **Study Streaks**: Streak calculation uses the `activityMap` keys, sorted and traversed to find consecutive active days — a classic sliding-window pattern applied to a real-world problem.

---

### Notes-Sharing System

The daily study log system provides peer-level resource sharing and personal accountability:

- **Daily Logs**: Each note is keyed to `(user_id, exam_id, note_date)` in the `prep_daily_notes` table. An `UPSERT` strategy (insert or update on conflict) ensures only one entry per exam per day, preventing duplicates.
- **Date-Organized History**: The UI separates "Today's Entry" (editable textarea) from previous logs, which are displayed chronologically — allowing aspirants to review what they studied on any given date.
- **Peer Resource Sharing**: Notes written by users can be surfaced to other aspirants preparing for the same exam, creating a lightweight, organic knowledge-sharing layer within the platform.

---

## The Engineering Mindset

> *"I do not memorize solutions. I recognize the shape of problems."*

Eligify was not built by following tutorials. It was built by applying first-principles thinking to a domain problem. Each feature maps to a computer science concept:

- **The Eligibility Engine** is a rule-evaluation pipeline — an ordered sequence of predicate functions applied to a data context. This is exactly the structure you arrive at after solving enough constraint-satisfaction problems on LeetCode.
- **Age Relaxation Logic** is a range query with a dynamic upper bound — a trivial transformation once you've internalized interval problems.
- **Streak Calculation** is a consecutive-element-counting problem on a sorted set, identical in shape to "Longest Consecutive Sequence" (LeetCode #128).
- **Multi-path Education Matching** is a short-circuit OR evaluation over AND-conjunctions — a Boolean logic problem with real-world labels.

This approach — pattern recognition and abstraction over memorization — is the foundation that 100+ LeetCode problems in Data Structures & Algorithms have built. Every design decision in this codebase reflects that: composable functions, clear data contracts, and predictable failure modes.

---

## About the Developer

**Himanshu Kumar**  
B.Tech Computer Science & Engineering — BIT Mesra, Jaipur Campus (2023–2027) | GPA: 8.3/10

| Credential | Detail |
|---|---|
| 🎖️ **SSB Recommended** | Selected by the Service Selection Board — a rigorous multi-day psychological and leadership assessment used by the Indian Armed Forces. A testament to reasoning ability, composure under pressure, and the leadership discipline I apply to every system I build. |
| 💻 **100+ LeetCode** | Focused on Data Structures & Algorithms — the foundation for the pattern-recognition approach in Eligify's engine design. |
| 🏫 **Sainik School, Gopalganj** | Class X — 96.5% (CBSE). The discipline instilled here is the bedrock of how I approach complex engineering problems. |

**Stack**: Java · JavaScript (ES6+) · TypeScript · React · Node.js · Express · PostgreSQL · MongoDB · JWT · bcrypt · Joi · BullMQ · Redis · Tailwind CSS · Framer Motion

📧 himanshu99071@gmail.com  
🔗 [github.com/himanshukumar1218](https://github.com/himanshukumar1218) · [LinkedIn](https://linkedin.com/in/himanshu-kumar-145ab6337)

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for the BullMQ notification worker)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/himanshukumar1218/eligify.git
cd eligify

# 2. Install server dependencies
cd server && npm install

# 3. Install client dependencies
cd ../client && npm install

# 4. Configure environment variables
# Create server/.env based on the template below
```

**`server/.env`**
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/eligify
JWT_SECRET=your_super_secret_key
REDIS_URL=redis://localhost:6379
```

```bash
# 5. Run database migrations / init scripts
# (Located in server/src/db/)

# 6. Start the development servers
# Terminal 1 — API Server:
cd server && npm run dev

# Terminal 2 — React Client:
cd client && npm run dev

# Terminal 3 — Background Worker (optional, for notifications):
cd server && node src/workers/notificationWorker.js
```

The client runs on `http://localhost:5173` and proxies API requests to `http://localhost:3000`.

---

## License

MIT © Himanshu Kumar
