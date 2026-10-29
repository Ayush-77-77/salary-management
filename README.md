# ACME Salary Management

A web app for ACME's HR Manager to manage salary data for 10,000 employees across 8 countries and see how the org pays people, replacing a set of Excel sheets.

- **Live demo:** https://salary-management-web-fwb5.onrender.com (the free API instance sleeps when idle, so the first request can take up to a minute)
- **Demo login:** `hr@acme.test` / `pass@acme`

## Features

- **Login** with email and password (JWT).
- **Employees:** search by name or email, filter by country, department and job title, sort by name, salary or hire date, and add, edit or delete employees. Salaries are stored and shown in each country's currency.
- **Salary insights:** org summary, min / average / max salary per country, and a per-country breakdown by job title.

## Docs

| Doc | What's in it |
|---|---|
| [Requirements](docs/requirements.md) | Goal, scope, and what's deliberately left out |
| [Architecture](docs/architecture.md) | Data model, API, frontend structure, and the reasoning behind key decisions |
| [Performance](docs/performance.md) | What's in place and why there's no cache yet |

## Tech stack

| | |
|---|---|
| Backend | Ruby 4.0.9, Rails 8.1 (API only), PostgreSQL, Ransack, Kaminari, Blueprinter, JWT |
| Frontend | React 19 (JavaScript), Vite, Ant Design, React Router, axios |
| Tests | RSpec, FactoryBot, Shoulda Matchers / Vitest, React Testing Library |
| Deployment | Render (Docker API, static frontend, managed Postgres), GitHub Actions CI |

## Running locally

Prerequisites: Ruby 4.0.9, Node 26 (see `frontend/.nvmrc`), PostgreSQL 16 or newer.

**Backend** (runs on http://localhost:3000)

```bash
cd backend
bundle install
bin/rails db:prepare   # creates the databases and seeds 10,000 employees
bin/rails server
```

**Frontend** (runs on http://localhost:5173)

```bash
cd frontend
nvm use
npm install
npm run dev
```

The frontend calls `http://localhost:3000` by default. To use another API URL, copy `.env.example` to `.env.local` and change `VITE_API_URL`.

## Tests and checks

```bash
cd backend && bin/ci                                     # setup, RuboCop, bundler-audit, Brakeman, RSpec
cd frontend && npm run lint && npm test && npm run build
```

GitHub Actions runs the same checks on every push to `main` and on pull requests.

## Configuration

| Variable | App | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | backend (production) | – | Postgres connection |
| `SECRET_KEY_BASE` | backend (production) | – | Signs JWTs |
| `FRONTEND_ORIGINS` | backend | `http://localhost:5173` | Comma-separated origins allowed by CORS |
| `USER_EMAIL` / `USER_PASSWORD` | backend seed | `hr@acme.test` / `pass@acme` | The HR login created by the seed |
| `VITE_API_URL` | frontend | `http://localhost:3000` | API base URL, baked in at build time |

## Project structure

```
backend/    Rails API
frontend/   React app
docs/       requirements, architecture, performance
render.yaml deployment blueprint
.github/    CI workflow
```
