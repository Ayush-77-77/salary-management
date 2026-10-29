# Architecture & Design Notes

## Overview

```
React (Vite, Ant Design)  ──HTTP/JSON + JWT──▶  Rails 8.1 API  ──▶  PostgreSQL
        frontend/                                 backend/
```

One repo with two apps. The frontend is a static single-page app (SPA) that talks to a JSON API. Keeping them separate means each can be run, tested and deployed independently. Keeping them in one repo means one history and one place for docs.

## Backend (Rails API)

- `rails new --api` with PostgreSQL. No views or asset pipeline needed.
- Controllers stay thin. Logic lives in plain Ruby objects:
  - `EmployeeSearch`: filtering, search, sorting and pagination for the employee list.
  - `SalaryInsights`: the aggregate queries for the dashboard.
- Aggregates (count, min, max, avg) are computed in Postgres with `GROUP BY`, not in Ruby. At 10k rows this is a few milliseconds.

### Data model

```
countries 1 ──< employees >── 1 departments
```

**users**: `email` (unique), `password_digest`

**countries**: `name` (unique), `code` (ISO, e.g. `IN`), `currency` (ISO, e.g. `INR`)

**departments**: `name` (unique)

**employees**

| Column | Type | Notes |
|---|---|---|
| full_name | string | required |
| email | string | required, unique |
| job_title | string | required |
| department_id | FK → departments | required |
| country_id | FK → countries | required |
| salary | decimal(12,2) | required, > 0. Decimal, not float, to avoid rounding errors |
| hire_date | date | required |

Indexes: unique on `email`; on `country_id`, `department_id`, `job_title`, and `(country_id, job_title)` for the drill-down.

**Why country and department are tables:** inconsistent values ("Engineering" vs "Engg") are one of the main problems with the Excel sheets. With foreign keys, an employee can only belong to a country or department that exists, so grouping on the dashboard is always correct. Country also has its own data (currency), so the currency is read from the country and never stored per employee, which means it can't get out of sync.

**Why job title is a string:** there are many titles and they change often. A strict list would need its own management screens. Free text is practical for v1.

Countries and departments are created by the seed script. Screens to manage them are out of scope for v1.

### API (`/api/v1`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Email + password → JWT |
| GET | `/auth/me` | Current user (used to check the token on page load) |
| GET | `/employees` | List: `page`, `per_page`, `q`, `country_id`, `department_id`, `job_title`, `sort`, `direction` |
| GET / POST / PATCH / DELETE | `/employees(/:id)` | CRUD |
| GET | `/countries` | Countries with currency, for dropdowns |
| GET | `/departments` | Departments, for dropdowns |
| GET | `/job_titles` | Distinct job titles, for the filter dropdown |
| GET | `/insights/summary` | Headcount, country and department counts |
| GET | `/insights/countries` | Salary stats per country |
| GET | `/insights/job_titles?country_id=` | Salary stats per job title in one country |

Errors return a consistent JSON shape: `{ "errors": [...] }`, with status 401, 404 or 422.

### Authentication

- `has_secure_password` (bcrypt) for passwords, `jwt` gem for tokens.
- Token is sent as `Authorization: Bearer <token>` and expires after 24 hours.
- The frontend keeps the token in `localStorage`. An httpOnly cookie would be safer against XSS, but needs CSRF handling and cross-domain cookie setup. For an internal tool with no user-generated HTML, `localStorage` is a reasonable v1 trade-off.

## Frontend (React)

- Vite + React (JavaScript), Ant Design for components, React Router for pages.
- Pages: Login, Employees (table + add/edit form), Insights.
- The employee table uses server-side pagination, sorting and filtering, so the browser never loads all 10k rows.
- One small API client module adds the token to requests and sends the user to login on a 401.

## Seed data

- Creates the countries and departments, then 10,000 employees across ~8 countries, several departments and job titles.
- Salaries come from realistic ranges per country and job title, so the insights look meaningful.
- Uses a fixed random seed so every run produces the same data.
- Inserts in batches with `insert_all` instead of 10k separate `create` calls (seconds instead of minutes).

## Testing

- Backend: RSpec + FactoryBot. Model validations, `EmployeeSearch`, `SalaryInsights`, and request specs for auth and endpoints.
- Frontend: Vitest + React Testing Library for key components.
- Tests use small hand-built datasets, not the 10k seed, so they stay fast and deterministic.

## Deployment

Render, described in a `render.yaml` in the repo: Rails API as a web service, React as a static site, and managed Postgres.
