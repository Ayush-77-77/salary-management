# Architecture & Design Notes

## Overview

```
React (Vite, Ant Design)  ──HTTP/JSON + JWT──▶  Rails 8.1 API  ──▶  PostgreSQL
        frontend/                                 backend/
```

One repo with two apps. The frontend is a static single-page app (SPA) that talks to a JSON API. Keeping them separate means each can be run, tested and deployed independently. Keeping them in one repo means one history and one place for docs.

## Backend (Rails API)

- `rails new --api` with PostgreSQL. Unused frameworks (Action Mailbox, Action Text, Active Storage, Action Cable, Solid Queue/Cache/Cable, Kamal) were skipped at generation time.
- Controllers stay thin: they read params, call a model or service, and render JSON.
- Logic that is more than a single model call lives in service objects:
  - `EmployeeSearch`: builds the Ransack search, applies the default sort and a stable tie-breaker, preloads associations and paginates with Kaminari.
  - `SalaryInsights`: the aggregate queries for the dashboard. All maths (count, min, max, avg) runs in Postgres with `GROUP BY`.
- Create, update and delete call the model directly (`create!`, `update!`, `destroy!`). The only rules are validations, so a service would just wrap one line.
- JSON is rendered with Blueprinter serializers (`EmployeeSerializer`, `CountrySerializer`, `DepartmentSerializer`). The lookup endpoints reuse the same country and department serializers.
- Two controller concerns are shared by every endpoint:
  - `Authentication`: every endpoint requires a valid JWT unless it opts out (only login does).
  - `ErrorHandling`: turns `RecordNotFound`, `RecordInvalid` and `ParameterMissing` into `{ "errors": [...] }` responses with 404, 422 and 400.

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
| email | string | required, unique, stored lowercase |
| job_title | string | required |
| department_id | FK → departments | required |
| country_id | FK → countries | required |
| salary | decimal(12,2) | required, > 0, in the country's currency. Decimal, not float, to avoid rounding errors |
| hire_date | date | required, not in the future |

Indexes: unique on `email`; on `department_id`, `job_title`, and `(country_id, job_title)`. The composite index also serves country-only filters, because Postgres can use the leading column of an index on its own, so there is no separate `country_id` index.

**Why country and department are tables:** inconsistent values ("Engineering" vs "Engg") are one of the main problems with the Excel sheets. With foreign keys, an employee can only belong to a country or department that exists, so grouping on the dashboard is always correct. Country also has its own data (currency), so the currency is read from the country and never stored per employee, which means it can't get out of sync.

**Why job title is a string:** there are many titles and they change often. A strict list would need its own management screens. Free text is practical for v1.

Countries and departments are created by the seed script. Screens to manage them are out of scope for v1. A country or department that still has employees can't be deleted (`restrict_with_error`).

### API (`/api/v1`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Email + password → JWT |
| GET | `/auth/me` | Current user (used to check the token on page load) |
| GET | `/employees` | List with `page`, `per_page` and Ransack params (below) |
| GET / POST / PATCH / DELETE | `/employees(/:id)` | CRUD |
| GET | `/countries` | Countries with currency, for dropdowns |
| GET | `/departments` | Departments, for dropdowns |
| GET | `/job_titles` | Distinct job titles, for the filter dropdown |
| GET | `/insights/summary` | Headcount, country and department counts |
| GET | `/insights/countries` | Salary stats per country |
| GET | `/insights/job_titles?country_id=` | Salary stats per job title in one country |

The employee list accepts five Ransack keys: `q[full_name_or_email_i_cont]`, `q[country_id_eq]`, `q[department_id_eq]`, `q[job_title_eq]` and `q[s]` (e.g. `salary desc`). The model allowlists which attributes can be searched and sorted, so a client can't filter or sort on anything else. Pages default to 25 rows, with a maximum of 100.

### Authentication

- `has_secure_password` (bcrypt) for passwords, `jwt` gem for tokens, signed with `secret_key_base`.
- Token is sent as `Authorization: Bearer <token>` and expires after 24 hours.
- Login uses `User.authenticate_by`, which takes the same time whether or not the email exists, and returns the same error for both cases.
- Login is rate-limited to 10 attempts per IP per minute (Rails 8 `rate_limit`), which slows down password guessing.
- The frontend keeps the token in `localStorage`. An httpOnly cookie would be safer against XSS, but needs CSRF handling and cross-domain cookie setup. For an internal tool with no user-generated HTML, `localStorage` is a reasonable v1 trade-off.
- CORS only allows `/api/*` from the origins in `FRONTEND_ORIGINS`.

## Frontend (React)

- Vite + React (JavaScript), Ant Design for components, React Router for pages, axios for HTTP.
- Pages: Login, Employees (table + add/edit form), Insights. Each page is lazy-loaded, and React and Ant Design are split into their own chunks so browsers keep them cached across deploys.

```
src/
  api/        one function per endpoint; client.js adds the token and handles 401s
  auth/       AuthProvider, useAuth, RequireAuth, token storage
  hooks/      useRequest (loading, errors, cancellation), useEmployees, useLookups
  components/ EmployeeFormModal
  layouts/    AppLayout (header + navigation)
  pages/      LoginPage, EmployeesPage, InsightsPage
  utils/      formatMoney
```

- `useRequest` is the one place that loads data. It cancels the previous request when its input changes, so a slow old response can't overwrite a newer one.
- The employee table uses server-side pagination, sorting and filtering, so the browser never loads all 10k rows.
- Salaries are always shown with their ISO currency code (`INR 2,400,000`, `AUD 83,300`), so dollar currencies can't be confused.

## Seed data

- Reference data (countries with currency and salary factor, departments with job titles and base salaries) lives in `db/seeds/reference_data.yml`. The logic is in `lib/seeds/employee_seeder.rb`.
- 10,000 employees across 8 countries and 8 departments. Salary = base salary for the job × country factor × a random spread of 0.8–1.25.
- A fixed random seed and a fixed hire-date range make every run produce the same data.
- Inserts in batches with `insert_all!` inside one transaction (about 1.5 seconds). Running it again changes nothing.
- Skipped in the test environment, so tests never see seed data.

## Testing

- Backend: RSpec + FactoryBot + Shoulda Matchers. Model validations, `EmployeeSearch`, `SalaryInsights`, the seeder, serializers, and request specs for every endpoint, including auth, errors, CORS and an N+1 check.
- Frontend: Vitest + React Testing Library. The auth flow, the API client, `useRequest`, and the Employees and Insights pages, with the API mocked.
- Tests use small hand-built datasets, not the 10k seed, so they stay fast and deterministic.
- `backend/bin/ci` runs setup, RuboCop, bundler-audit, Brakeman and RSpec. GitHub Actions runs it on every push, plus the frontend lint, tests and build.

## Deployment

Render, described in `render.yaml`:

- **API:** a Docker web service built from the Rails Dockerfile. On boot the container runs `db:prepare`, which loads the schema and runs the seed on an empty database. `SECRET_KEY_BASE` is generated by Render.
- **Frontend:** a static site built with `npm run build`, with all paths rewritten to `index.html` for client-side routing.
- **Database:** Render managed Postgres.
