<div align="center">

# lvlBase 🎮

### The Gamified AI-Powered EdTech Platform for Schools

**LMS · Gamification · AI Tutoring · School ERP — All in One Platform**

[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Functions-orange?logo=firebase)](https://firebase.google.com)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20GPT--4o--mini-green?logo=openai)](https://openai.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=googlechrome)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Firebase Configuration](#firebase-configuration)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [API Reference](#api-reference)
- [Gamification System](#gamification-system)
- [PWA Support](#pwa-support)
- [Contributing](#contributing)

---

## Overview

**lvlBase** is a full-stack, gamified school management system built on Firebase. It combines a traditional Learning Management System (LMS) with RPG-style gamification (XP, ranks, guilds, arena battles), AI-powered tutoring and grading (via OpenAI), real-time live sessions (WebRTC), and a complete school ERP — all in a single PWA-first web application.

Key philosophies:
- **Engagement first** — every learning action earns XP and unlocks achievements
- **Multi-role** — five distinct portals (Student, Teacher, Admin, Parent, Super-Admin)
- **Serverless** — zero backend to manage; fully hosted on Firebase
- **Offline-ready** — Service Worker caches critical assets for offline use

---

## Features

### 🎓 Student Portal
| Feature | Description |
|---|---|
| Dashboard | XP bar, rank badge, streak counter, upcoming quests & announcements |
| Quest Map | Visual learning path — complete quests to unlock new content |
| Arena | Real-time 1v1 quiz battles with matchmaking, leaderboard & tournaments |
| Backpack | Inventory of earned badges, loot boxes, and shop items |
| Focus Mode | Distraction-free study environment with AI Proctor |
| Analytics | Personal performance graphs and attendance history |
| AI Tutor (Sage) | Chat with GPT-4o-mini for subject help |
| Support Desk | Raise and track support tickets |

### 👨‍🏫 Teacher Portal
| Feature | Description |
|---|---|
| Dashboard | Class overview, recent submissions, alerts |
| Class Manager | Create classes, manage rosters, track attendance |
| Assignment Builder | Drag-and-drop assignment creation with due dates |
| Quest Builder | Build gamified quest chains linked to curriculum |
| Gradebook | View and edit grades; AI auto-grading available |
| Live Session | WebRTC-powered virtual classroom |
| AI Tools | AI code review, auto-grading, and feedback generation |
| Student Profiles | Deep dive into individual student progress |
| Announcements | Post school-wide or class-level announcements |
| Analytics | Class performance charts and export |

### 🏫 School Admin Portal
| Feature | Description |
|---|---|
| Dashboard | School-wide KPIs — students, teachers, classes, XP |
| User Management | Invite, activate, block, and manage all users |
| Class Management | Oversee all classes and assignments |
| Billing | Subscription management via Razorpay |
| Reports | Generate attendance, grade, and engagement reports |
| Announcements | School-wide broadcasts |
| Settings | Branding, timezone, features toggle |

### 👨‍👩‍👧 Parent Portal
| Feature | Description |
|---|---|
| Dashboard | Child's XP, rank, streak, and recent activity |
| Child Progress | Grades, attendance, quest completion |
| Messages | Direct messaging with teachers |
| Reports | PDF-ready progress reports |
| Settings | Notification preferences |

### ⚙️ Super-Admin Portal
| Feature | Description |
|---|---|
| Dashboard | Platform-wide metrics |
| Schools | Create and manage school tenants |
| Users | View all users across all schools |
| Analytics | Cross-school usage and revenue data |
| Settings | Global platform configuration |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES2020+) |
| **Database** | Firebase Firestore (NoSQL, multi-tenant) |
| **Realtime** | Firebase Realtime Database (chat, arena) |
| **Auth** | Firebase Authentication (email, Google SSO, magic link, MFA) |
| **Storage** | Firebase Storage (avatars, certificates, school files) |
| **Backend** | Firebase Cloud Functions (Node.js 18) |
| **AI** | OpenAI GPT-4o-mini (tutor, grading, code review) |
| **Payments** | Razorpay (subscription billing, webhooks) |
| **Email** | Nodemailer via SMTP |
| **PWA** | Service Worker with cache-first strategy |
| **Real-time Video** | WebRTC (live sessions) |
| **Security** | TOTP MFA via speakeasy, HMAC webhook verification |

---

## Repository Structure

```
lvlBase/
│
├── api/                        # Firebase Cloud Functions (Node.js 18)
│   ├── index.js                # 🔑 Main entry point — exports all functions
│   ├── package.json            # Functions dependencies
│   ├── ai/
│   │   ├── chat.js             # aiChat — AI tutor (Sage)
│   │   ├── grading.js          # aiGrade — AI auto-grading
│   │   └── code-review.js      # codeReview — AI code review
│   ├── auth/
│   │   ├── mfa.js              # setupMFA / verifyMFA (TOTP)
│   │   └── verify-sso.js       # verifySSO — token + school validation
│   └── core/
│       ├── generate-cert.js    # generateCertificate
│       ├── payment.js          # paymentWebhook (Razorpay)
│       └── send-email.js       # sendEmail (SMTP)
│
├── app/                        # Role-specific HTML app pages
│   ├── student/
│   │   ├── dashboard.html
│   │   ├── quest-map.html
│   │   ├── analytics.html
│   │   ├── backpack.html
│   │   ├── focus-mode.html
│   │   ├── profile.html
│   │   ├── support-desk.html
│   │   └── arena/
│   │       ├── matchmaking.html
│   │       ├── battle-stage.html
│   │       ├── leaderboard.html
│   │       └── tournaments.html
│   ├── teacher/
│   │   ├── dashboard.html
│   │   ├── class-manager.html
│   │   ├── assignment-builder.html
│   │   ├── quest-builder.html
│   │   ├── gradebook.html
│   │   ├── live-session.html
│   │   ├── ai-tools.html
│   │   ├── student-profiles.html
│   │   ├── announcements.html
│   │   └── analytics.html
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── user-management.html
│   │   ├── class-management.html
│   │   ├── billing.html
│   │   ├── reports.html
│   │   ├── announcements.html
│   │   └── settings.html
│   ├── parent/
│   │   ├── dashboard.html
│   │   ├── child-progress.html
│   │   ├── messages.html
│   │   ├── reports.html
│   │   └── settings.html
│   └── super-admin/
│       ├── dashboard.html
│       ├── schools.html
│       ├── users.html
│       ├── analytics.html
│       └── settings.html
│
├── auth/                       # Authentication HTML pages
│   ├── portal-login.html       # Unified login
│   ├── signup-student.html
│   ├── signup-teacher.html
│   ├── school-onboarding.html  # New school registration
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── magic-link.html
│   ├── 2fa-setup.html
│   ├── invite-claim.html
│   ├── blocked.html
│   └── session-expired.html
│
├── config/                     # Firebase & project config
│   ├── firebase.json           # Firebase project config
│   ├── firestore.rules         # Firestore security rules
│   ├── firestore.indexes.json  # Composite indexes
│   ├── storage.rules           # Storage security rules
│   ├── .env.example            # Environment variable template
│   └── .gitignore
│
├── core/                       # Shared frontend assets
│   ├── css/
│   │   ├── base.css            # Global styles, design tokens, utilities
│   │   ├── auth.css            # Auth page styles
│   │   ├── bento-grid.css      # Bento-grid layout system
│   │   ├── data.css            # Tables, charts, data displays
│   │   ├── gamification.css    # XP bars, rank badges, loot boxes
│   │   └── themes/
│   │       └── dark.css        # Dark theme overrides
│   └── js/
│       ├── firebase/
│       │   ├── init.js         # Firebase initialization & FCM
│       │   ├── auth.js         # LvlAuth — sign-in, sign-up, guards
│       │   └── firestore.js    # LvlDB — all Firestore/RTDB helpers
│       ├── core/
│       │   ├── state.js        # LvlState — global state manager
│       │   ├── ui-components.js # LvlUI — toasts, modals, loaders
│       │   └── security.js     # XSS sanitisation, CSP helpers
│       └── features/
│           ├── gamification.js  # LvlGame — XP, ranks, streaks, loot
│           ├── ai-proctor.js    # LvlProctor — exam proctoring
│           ├── bento-drag.js    # Drag-and-drop bento grid
│           └── webrtc.js        # WebRTC live sessions
│
├── public/                     # Public/landing pages
│   ├── index.html              # Marketing homepage
│   ├── features.html           # Feature overview (tabbed)
│   ├── 404.html                # 404 error page
│   ├── offline.html            # PWA offline fallback
│   └── verify-certificate.html # Certificate verification
│
└── pwa/                        # Progressive Web App manifests
    ├── manifest-student.json
    ├── manifest-teacher.json
    ├── manifest-admin.json
    ├── manifest-parent.json
    └── sw.js                   # Service Worker (cache-first)
```

---

## Setup & Installation

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | Required for Firebase Functions |
| Firebase CLI | ≥ 13 | `npm install -g firebase-tools` |
| Git | any | — |

You also need a **Firebase project** with the following services enabled:
- Authentication (Email/Password, Google)
- Firestore Database
- Realtime Database
- Storage
- Cloud Functions (Blaze / pay-as-you-go plan required for Functions)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Harshitkashyap2027/Not.git
cd Not
```

---

### Step 2 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. Enable **Firestore Database** (production mode).
3. Enable **Realtime Database**.
4. Enable **Authentication** → Sign-in methods:
   - Email/Password ✅
   - Google ✅
   - Email link (passwordless) ✅
5. Enable **Storage**.
6. Upgrade to the **Blaze plan** (required for Cloud Functions and outbound network calls).

---

### Step 3 — Configure Firebase credentials in the frontend

Open `core/js/firebase/init.js` and replace the placeholder config with your project's credentials (found in **Project Settings → Your apps → Web app**):

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com"
};
```

---

### Step 4 — Set up Cloud Functions environment variables

Firebase Functions uses environment config for secrets. From the project root:

```bash
# Log in to Firebase
firebase login

# Select your project
firebase use YOUR_PROJECT_ID

# Set OpenAI key
firebase functions:config:set openai.key="sk-your_openai_key"

# Set Razorpay credentials
firebase functions:config:set razorpay.key="rzp_live_xxxx" razorpay.secret="your_secret"

# Set SMTP credentials
firebase functions:config:set smtp.host="smtp.gmail.com" smtp.user="noreply@yourschool.com" smtp.pass="your_app_password"
```

Alternatively, create a `.env` file inside `api/` for local emulator use (see [Environment Variables](#environment-variables)):

```bash
cp config/.env.example api/.env
# then edit api/.env with your values
```

---

### Step 5 — Install Functions dependencies

```bash
cd api
npm install
cd ..
```

---

### Step 6 — Deploy Firestore rules and indexes

```bash
# Deploy from the config/ directory where firebase.json lives
firebase deploy --only firestore --project YOUR_PROJECT_ID
```

---

### Step 7 — Deploy Storage rules

```bash
firebase deploy --only storage --project YOUR_PROJECT_ID
```

---

### Step 8 — Deploy Cloud Functions

```bash
firebase deploy --only functions --project YOUR_PROJECT_ID
```

---

### Step 9 — Deploy Hosting

```bash
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

Or deploy everything at once:

```bash
firebase deploy --project YOUR_PROJECT_ID
```

---

### Local Development (Emulators)

To run the platform locally without deploying:

```bash
# Start all emulators (Functions, Firestore, Auth, Storage, Realtime DB)
firebase emulators:start

# The emulator UI is available at http://localhost:4000
# Hosting is served at http://localhost:5000
```

> **Note:** When using emulators, update `core/js/firebase/init.js` to point services at `localhost`. See [Firebase Emulator docs](https://firebase.google.com/docs/emulator-suite/connect_firestore).

---

## Environment Variables

All secrets live in `api/.env` (for local dev) or in Firebase Functions config (for production). Copy from the template:

```bash
cp config/.env.example api/.env
```

| Variable | Description |
|---|---|
| `FIREBASE_API_KEY` | Firebase Web API key |
| `FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_DATABASE_URL` | Realtime Database URL |
| `OPENAI_API_KEY` | OpenAI API key (for AI tutor, grading, code review) |
| `OPENAI_MODEL` | Model name, e.g. `gpt-4o-mini` |
| `RAZORPAY_KEY_ID` | Razorpay live/test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret (used for webhook HMAC verification) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (usually `587`) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM` | Display name + from address, e.g. `lvlBase <noreply@school.com>` |
| `APP_URL` | Public app URL, e.g. `https://your-app.web.app` |
| `CERTIFICATE_SECRET` | Secret used for certificate signing |

> ⚠️ Never commit `.env` files to version control. They are already in `.gitignore`.

---

## Firebase Configuration

### `config/firebase.json`

Defines hosting rules, rewrite targets, Cloud Functions source, and security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection). All `/**` routes fall back to `public/404.html`.

### `config/firestore.rules`

Role-based access control enforced at the database level:

| Collection | Who can read | Who can write |
|---|---|---|
| `users/{uid}` | Self, same-school admin/teacher, super-admin | Self, school-admin, super-admin |
| `schools/{schoolId}` | Same-school members, super-admin | School-admin, super-admin |
| `schools/{id}/students` | Same-school members | School-admin, teacher, self, super-admin |
| `schools/{id}/classes` | Same-school members | Teacher, school-admin, super-admin |
| `schools/{id}/guilds` | Same-school members | Same-school members |
| `schools/{id}/announcements` | Same-school members | Teacher, school-admin, super-admin |
| `schools/{id}/chatRooms` | Same-school members | Same-school members |
| `schools/{id}/proctoring` | Teacher, school-admin, super-admin | Same-school members |
| `certificates/{certId}` | Public | Teacher, admin roles |

### `config/storage.rules`

| Path | Read | Write |
|---|---|---|
| `avatars/{userId}/*` | Any authenticated user | Owner only, max 2 MB, image/* |
| `schools/{schoolId}/**` | Same-school members | Teacher or admin only |
| `certificates/{certId}` | Public | Teacher, admin, super-admin |

---

## Deployment

### Full deploy

```bash
firebase deploy --project YOUR_PROJECT_ID
```

### Partial deploys

```bash
# Functions only
firebase deploy --only functions

# Hosting only
firebase deploy --only hosting

# Firestore rules + indexes
firebase deploy --only firestore

# Storage rules
firebase deploy --only storage
```

### First-time super-admin setup

After deploying, manually create a super-admin user in Firestore:

1. Go to **Firebase Console → Firestore → `users` collection**
2. Create a document with the UID of your admin's Firebase Auth account:

```json
{
  "uid": "YOUR_AUTH_UID",
  "name": "Super Admin",
  "email": "admin@yourdomain.com",
  "role": "super-admin",
  "schoolId": null,
  "status": "active",
  "createdAt": "<server timestamp>"
}
```

Log in with that account at `/auth/portal-login.html` to access the Super-Admin portal.

---

## User Roles

| Role | Portal URL | Capabilities |
|---|---|---|
| `student` | `/app/student/dashboard.html` | Learn, earn XP, battle in arena, chat |
| `teacher` | `/app/teacher/dashboard.html` | Create classes, grade, run live sessions |
| `school-admin` | `/app/admin/dashboard.html` | Manage school, billing, reports |
| `parent` | `/app/parent/dashboard.html` | Monitor child progress, message teachers |
| `super-admin` | `/app/super-admin/dashboard.html` | Manage all schools and platform settings |

Role assignment flow:
1. Students self-register via `/auth/signup-student.html` (status: `pending`)
2. School admin activates them via User Management
3. Teachers are invited via invite link (`/auth/invite-claim.html`)
4. School admins are created by super-admin

---

## API Reference

All backend logic runs as Firebase Cloud Functions callable via `firebase.functions().httpsCallable(name)`.

### AI Functions

#### `aiChat`
Chat with the AI tutor "Sage".

**Request:**
```js
{ messages: [{role, content}], subject: string, studentContext: string }
```
**Response:** `{ reply: string, tokens: number }`
**Auth required:** Yes

---

#### `aiGrade`
AI-powered assignment grading. Teachers only.

**Request:**
```js
{ question: string, answer: string, rubric: string, maxScore: number }
```
**Response:** `{ score: number, feedback: string, strengths: string[], improvements: string[] }`
**Auth required:** Yes (teacher/admin role)

---

#### `codeReview`
AI code review for student submissions.

**Request:**
```js
{ code: string, language: string }
```
**Response:** `{ issues: [{type, line, message}], score: number, summary: string, improvedCode: string }`
**Auth required:** Yes

---

### Auth Functions

#### `setupMFA`
Generates a TOTP secret and QR code for 2FA setup.

**Response:** `{ secret: string, qrCode: string (data URL) }`
**Auth required:** Yes

---

#### `verifyMFA`
Verifies a TOTP token and enables MFA on the account.

**Request:** `{ token: string }`
**Response:** `{ success: true }`
**Auth required:** Yes

---

#### `verifySSO`
Validates a Firebase ID token and confirms school membership.

**Request:** `{ idToken: string, schoolId: string }`
**Response:** `{ valid: true, role: string, schoolId: string }`

---

### Core Functions

#### `generateCertificate`
Issues a verifiable certificate for a student.

**Request:** `{ studentId: string, courseName: string, schoolId: string }`
**Response:** `{ certId: string, verifyUrl: string }`
**Auth required:** Yes

> Certificates are publicly verifiable at `/public/verify-certificate.html?id=CERT_ID`

---

#### `paymentWebhook` (HTTP)
Razorpay webhook handler. Verifies HMAC signature and records payments.

**Endpoint:** `POST /paymentWebhook`
**Headers:** `x-razorpay-signature`

---

#### `sendEmail`
Sends a transactional email via SMTP.

**Request:** `{ to: string, subject: string, html: string, text: string }`
**Response:** `{ success: true }`
**Auth required:** Yes

---

## Gamification System

The gamification engine (`core/js/features/gamification.js`) provides:

### XP & Ranks

| Rank | Label | Min XP |
|---|---|---|
| E | Iron | 0 |
| D | Bronze | 500 |
| C | Silver | 1,500 |
| B | Gold | 3,500 |
| A | Platinum | 7,500 |
| S | Diamond | 15,000 |
| SS | Legendary | 30,000 |

### XP Rewards

| Action | XP |
|---|---|
| Quest complete | 100 |
| Quiz correct | 10 |
| Quiz perfect | 50 |
| Arena battle win | 75 |
| Arena battle lose | 15 |
| Daily login | 20 |
| Streak bonus | 5 × streak days |
| Assignment submit | 30 |
| Help a peer | 25 |
| Code submission | 40 |

### Achievements

| ID | Name | Trigger |
|---|---|---|
| `first_quest` | First Steps | Complete first quest |
| `streak_7` | On Fire! | 7-day login streak |
| `streak_30` | Month Master | 30-day login streak |
| `rank_b` | Going Places | Reach B rank |
| `rank_s` | Elite | Reach S rank |
| `rank_ss` | Legendary | Reach SS rank |
| `guild_create` | Guild Master | Create a guild |
| `battle_win_10` | Warrior | Win 10 arena battles |
| `perfect_quiz` | Perfectionist | 100% on a quiz |
| `top_10` | Rising Star | Top 10 leaderboard |

### Loot Boxes

Four tiers: **Common · Rare · Epic · Legendary** — each contains XP rewards or special badges. Students can buy loot boxes from the XP Shop.

### XP Shop

| Item | Cost |
|---|---|
| Streak Shield (1 day) | 200 XP |
| 2× XP Boost (1 hour) | 500 XP |
| Common Loot Box | 100 XP |
| Rare Loot Box | 300 XP |
| Epic Loot Box | 750 XP |
| Gold Avatar Frame | 1,000 XP |

---

## PWA Support

lvlBase ships as a Progressive Web App:

- **4 manifests** — one per role (student/teacher/admin/parent) with distinct names, icons, and start URLs
- **Service Worker** (`pwa/sw.js`) — cache-first for static assets, network-first for HTML, API calls always bypass cache
- **Offline fallback** — `/public/offline.html` served when the network is unavailable
- **Push Notifications** — FCM-powered via Firebase Messaging

To install: visit the app in Chrome/Edge on desktop or mobile, then use "Add to Home Screen" / "Install App".

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style (vanilla JS, no frameworks, consistent naming conventions).

---

<div align="center">

Made with ❤️ by the lvlBase team · [Report a Bug](https://github.com/Harshitkashyap2027/Not/issues)

</div>