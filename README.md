# EasyEnglish — English Center Management System

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

A full-stack web application for managing English language centers. It covers the complete operational lifecycle — from public course marketing and parent consultation registration, through internal administration of courses, classes, schedules, enrollments, attendance, grading, and tuition payments.

![Web demo](frontend/src/assets/image.png)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Design Decisions](#design-decisions)
- [License](#license)

---

## Tech Stack

| Layer                  | Technology                               | Version            |
| ---------------------- | ---------------------------------------- | ------------------ |
| **Runtime**            | Node.js (ESM)                            | 22+                |
| **Backend Framework**  | Express                                  | 5.x                |
| **Database**           | MongoDB (Mongoose ODM)                   | Atlas / 7.x driver |
| **Authentication**     | JSON Web Tokens (jsonwebtoken, bcryptjs) | —                  |
| **Validation**         | Zod                                      | 4.x                |
| **Frontend Framework** | React                                    | 19                 |
| **Build Tool**         | Vite                                     | 8.x                |
| **Styling**            | Tailwind CSS (Vite plugin)               | 4.x                |
| **Routing (client)**   | React Router DOM                         | 7.x                |
| **Charts**             | Recharts                                 | 3.x                |
| **Calendar**           | react-big-calendar                       | 1.x                |
| **Icons**              | Phosphor Icons                           | 2.x                |
| **Date Utilities**     | date-fns                                 | 4.x                |
| **HTTP Client**        | Axios                                    | 1.x                |
| **Testing**            | Jest + Supertest                         | 30 / 7             |
| **Linting**            | ESLint                                   | 10.x               |
| **Containerization**   | Docker + Docker Compose                  | —                  |
| **Reverse Proxy**      | Nginx (Alpine)                           | —                  |
| **Package Manager**    | pnpm (workspace)                         | —                  |

---

## Features

### Public-facing Website

- Landing page with course program showcase (Kindergarten, Children, Teen, IELTS)
- Center locations and contact information
- News & events section
- Parent resources corner
- Online consultation registration form (no login required)
- Zalo messaging integration

### Admin Dashboard

- Centralized dashboard with key operational statistics
- User management with role-based account creation (teacher, student, parent)
- Course CRUD (create, read, update, delete)
- Class management with teacher assignment and capacity tracking
- Automatic schedule generation from class configuration
- Student enrollment into classes
- Bulk attendance check-in per session
- Exam/grade management with batch scoring
- Tuition fee tracking and payment recording
- Consultation registration review and status updates

### Teacher Portal

- View assigned class schedules
- Mark student attendance
- Input and manage grades/exam scores

### Student Portal

- Personal schedule viewer
- Attendance history
- Grade/exam results
- Tuition payment status

### Parent Portal

- Children's class enrollment overview
- Children's schedule viewer
- Children's attendance tracking
- Children's grade viewer

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│                                                                 │
│   React 19 + React Router 7 + Tailwind CSS 4 + Recharts         │
│   Vite dev-server proxies /api/* to backend                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express 5 REST API                          │
│                                                                 │
│  ┌───────────┐  ┌────────────┐  ┌───────────────┐               |
│  │  Routes   │─▶ Middleware  ─▶│ Controllers   │               |
│  └───────────┘  │ - auth     │  └──────┬────────┘               |
│                 │ - rbac     │         │                        │
│                 │ - validate │         ▼                        │
│                 │ - error    │  ┌──────────────┐                │
│                 └────────────┘  │  Services    │                │
│                                 └──────┬───────┘                │
│                                        │                        │
│                                        ▼                        │
│                                 ┌──────────────┐                │
│                                 │   Models     │                │
│                                 │  (Mongoose)  │                │
│                                 └──────┬───────┘                │
└────────────────────────────────────────┼────────────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │  MongoDB Atlas  │
                                └─────────────────┘
```

### Request Flow

1. Client sends HTTP request to `/api/*`
2. Vite dev-server proxy forwards to Express (port 5000)
3. **Auth middleware** extracts and verifies JWT from `Authorization: Bearer <token>`
4. **RBAC middleware** checks user role against the route's allowed roles
5. **Validation middleware** validates request body against Zod schemas
6. **Controller** processes business logic, interacts with Mongoose models
7. **Error middleware** catches and formats any unhandled errors

### Background Tasks

- **Auto-complete expired schedules**: A periodic task runs every 5 minutes on the server to automatically mark past sessions as completed.

---

## Project Structure

```
EasyEnglish_project/
├── server.js                        # Application entry point
├── package.json                     # Root package (pnpm workspace)
├── pnpm-workspace.yaml
├── .env                             # Local environment variables (not committed)
├── .env.example                     # Sample environment variables template
│
├── Docker-compose.yml               # Multi-container orchestration (MongoDB + Backend + Frontend)
├── Dockerfile.backend               # Backend container image (Node.js 22 Alpine)
├── .dockerignore                    # Excludes node_modules, .env, frontend, etc. from backend build
│
├── backend/
│   └── src/
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── env.js               # Zod-validated environment config
│       ├── controllers/             # Route handlers (14 controllers)
│       ├── middlewares/
│       │   ├── auth.middleware.js    # JWT verification
│       │   ├── rbac.middleware.js    # Role-based access control
│       │   ├── validate.middleware.js# Zod schema validation
│       │   └── error.middleware.js   # Global error handler
│       ├── models/                  # Mongoose schemas (13 models)
│       ├── routes/                  # Express route definitions (10 files)
│       ├── services/                # Business logic services
│       ├── utils/                   # JWT helpers, ID counters, etc.
│       └── validations/             # Zod validation schemas (9 files)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── Dockerfile                   # Multi-stage build: Vite → Nginx static serve
    ├── .dockerignore                # Excludes node_modules, dist, .env from frontend build
    ├── nginx.conf                   # Nginx config: SPA routing + /api reverse proxy to backend
    └── src/
        ├── main.jsx                 # React entry point
        ├── App.jsx                  # Route definitions
        ├── api.js                   # Axios instance
        ├── index.css                # Global styles
        ├── App.css                  # App-level styles
        ├── context/
        │   └── AuthContext.jsx      # Authentication state provider
        ├── layouts/
        │   ├── PublicLayout.jsx     # Navbar wrapper for public pages
        │   └── DashboardLayout.jsx  # Sidebar wrapper for admin pages
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── Hero.jsx
        │   ├── RegistrationModal.jsx
        │   └── ZaloMessageButton.jsx
        ├── pages/                   # 32 page components
        └── services/                # API service modules
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9 (install via `npm install -g pnpm`)
- **MongoDB** — Atlas cluster or local instance

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/minhquan2955/EasyEnglish.git
cd EasyEnglish_project

# 2. Install all dependencies (root + frontend workspace)
pnpm install

# 3. Create the environment file
cp .env.example .env
# Edit .env with your own values (see Environment Variables below)

# 4. Install frontend dependencies
cd frontend
pnpm install
cd ..
```

### Running Locally

You need **two terminals** — one for the backend, one for the frontend:

```bash
# Terminal 1 — Backend API (port 5000)
pnpm dev

# Terminal 2 — Frontend dev server (port 5173)
cd frontend
pnpm dev
```

The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:5000`.

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Tests

```bash
# From the project root
pnpm test
```

---

## Docker Deployment

The project ships with a complete Docker Compose setup that runs the entire stack in three containers — no local Node.js or MongoDB installation required.

### Container Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                             │
│                                                                           │
│  ┌───────────────────┐   ┌───────────────────┐   ┌────────────────────┐   │
│  │   frontend        │   │   backend         │   │   mongodb          │   │
│  │   (Nginx Alpine)  │   │   (Node.js 22)    │   │   (Mongo 6)        │   │
│  │                   │   │                   │   │                    │   │
│  │  Port 80 → Host   │   │  Port 5000 → Host │   │  Internal only     │   │
│  │                   │   │                   │   │                    │   │
│  │  Static files     │──▶│  Express REST API │──▶│  Data persistence │   │
│  │  /api/* proxy     │   │  JWT auth + RBAC  │   │  Volume: mongo-data│   │
│  └───────────────────┘   └───────────────────┘   └────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Docker Files Overview

| File                 | Location     | Purpose                                                                                             |
| -------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `Docker-compose.yml` | Project root | Orchestrates all 3 services (MongoDB, Backend, Frontend)                                            |
| `Dockerfile.backend` | Project root | Single-stage Node.js 22 Alpine image with pnpm production dependencies                              |
| `.dockerignore`      | Project root | Excludes `node_modules`, `.env`, `frontend/`, etc. from backend build context                       |
| `Dockerfile`         | `frontend/`  | Multi-stage build: Stage 1 builds React with Vite, Stage 2 serves static files via Nginx            |
| `.dockerignore`      | `frontend/`  | Excludes `node_modules`, `dist`, `.env` from frontend build context                                 |
| `nginx.conf`         | `frontend/`  | Nginx configuration with SPA routing, gzip, security headers, and `/api/*` reverse proxy to backend |

### Prerequisites

- **Docker** >= 20.10
- **Docker Compose** >= 2.x (bundled with Docker Desktop)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/minhquan2955/EasyEnglish.git
cd EasyEnglish_project

# 2. Create the environment file
cp .env.example .env
# Edit .env — add Docker-specific variables (see Environment Variables below)

# 3. Build and start all containers
docker compose up -d --build

# 4. Check status
docker compose ps
```

Once running, open [http://localhost](http://localhost) (port 80) in your browser.

### Common Docker Commands

```bash
# View logs from all services
docker compose logs -f

# View logs from a specific service
docker compose logs -f backend

# Stop all containers
docker compose down

# Stop and remove volumes (deletes database data)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Access MongoDB shell
docker exec -it easyenglish-mongo mongosh -u admin -p
```

### How It Works

1. **MongoDB** container starts first with a health check (`mongosh ping`). It uses a named volume (`mongo-data`) for data persistence across restarts. Port 27017 is not exposed to the host by default for security.
2. **Backend** container waits for MongoDB to be healthy (`depends_on: condition: service_healthy`), then starts the Express API on port 5000. The `MONGO_URI` is automatically overridden to point to the Docker MongoDB container instead of Atlas.
3. **Frontend** container builds the React app with Vite in a multi-stage Dockerfile (~20MB final image), then serves static files via Nginx on port 80. Nginx handles SPA routing (`try_files`) and reverse-proxies `/api/*` requests to the backend container.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Core Variables (Required)

| Variable     | Description                                | Example                                                     |
| ------------ | ------------------------------------------ | ----------------------------------------------------------- |
| `PORT`       | Server port                                | `5000`                                                      |
| `NODE_ENV`   | Environment mode                           | `development`                                               |
| `MONGO_URI`  | MongoDB connection string (local/Atlas)    | `mongodb+srv://user:pass@cluster.mongodb.net/EasyEnglishDB` |
| `JWT_SECRET` | Secret key for signing JWTs (min 10 chars) | `your-secure-random-string`                                 |

All variables are validated at startup using Zod. The server will refuse to start if any required variable is missing or invalid.

### Docker-specific Variables (Required when using Docker Compose)

When running with `docker compose`, these additional variables configure the MongoDB container. The Docker Compose file automatically builds the correct `MONGO_URI` from these values — you do **not** need to set `MONGO_URI` manually.

| Variable                     | Description                          | Default       |
| ---------------------------- | ------------------------------------ | ------------- |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB root username                | `admin`       |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password (**required**) | —             |
| `MONGO_INITDB_DATABASE`      | Initial database name                | `easyenglish` |

> **Note:** In Docker mode, `MONGO_URI` is overridden by the compose file to: `mongodb://<username>:<password>@mongodb:27017/<database>?authSource=admin`. You only need to set the three variables above.

---

## Design Decisions

### Monorepo with pnpm Workspace

The project uses a pnpm workspace to co-locate the backend and frontend in a single repository. The root `package.json` holds shared dependencies and the backend entry point (`server.js`), while `frontend/` is a self-contained Vite application. This simplifies development without introducing unnecessary build tooling overhead.

### Express 5 with Native ESM

The entire codebase uses ES modules (`"type": "module"`). Express 5 is adopted for its native Promise support in route handlers and improved error handling semantics. The `--env-file` flag (Node.js 22+) loads `.env` natively without `dotenv`.

### Zod for Dual-layer Validation

Zod is used both for environment variable validation at startup (`env.js` fails fast if config is invalid) and for request body validation in route middleware. This provides a single, type-safe validation library across the entire backend.

### Role-based Access Control (RBAC)

The system defines four roles — `admin`, `teacher`, `student`, `parent` — enforced through a composable middleware chain: `protect` (JWT verification) -> `authorize(...roles)` (role checking). Routes declare their allowed roles declaratively, keeping authorization logic decoupled from business logic.

### Controller-Service-Model Pattern

Controllers handle HTTP request/response concerns. Services encapsulate reusable business logic (e.g., schedule generation, attendance auto-completion). Models define the MongoDB document structure via Mongoose schemas. This separation keeps each layer testable in isolation.

### Auto-ID Generation (Counter Model)

Instead of exposing MongoDB `_id` values, the system uses a `Counter` model to generate human-readable sequential IDs (e.g., `STU-001`, `TCH-015`). This improves usability for administrative staff who reference records by ID.

### Frontend Proxy Architecture

Vite's dev server proxies `/api/*` requests to the Express backend, eliminating CORS issues during development without additional middleware. In production, Nginx serves the static frontend build and reverse-proxies `/api/*` requests to the backend container — achieving the same seamless API routing in both environments.

### Docker Compose Three-Container Architecture

The Docker deployment uses three isolated containers orchestrated via Docker Compose:

- **MongoDB** (`mongo:6-jammy`) — Runs as an internal-only service with a health check. Port 27017 is deliberately not exposed to the host for security; only the backend container communicates with it through the Docker network. A named volume (`mongo-data`) ensures data survives container restarts.
- **Backend** (`Dockerfile.backend`) — A single-stage Node.js 22 Alpine image that installs only production dependencies via pnpm. It runs as the `node` user (non-root) for security. The container waits for MongoDB's health check before starting (`depends_on: condition: service_healthy`).
- **Frontend** (`frontend/Dockerfile`) — A multi-stage build: Stage 1 uses Node.js to compile the React app with Vite; Stage 2 copies only the static output into an Nginx Alpine image (~20MB). The Nginx config handles SPA client-side routing, gzip compression, security headers, static asset caching, and reverse-proxying `/api/*` to the backend container.

This architecture keeps each concern isolated, allows independent scaling, and produces minimal production images.

### Scheduled Background Task

Expired class sessions are automatically marked as completed via a `setInterval` task running every 5 minutes. This simple approach avoids external job schedulers while keeping the schedule state consistent without manual intervention.

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
