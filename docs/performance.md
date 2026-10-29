# Performance Considerations

The target is 10,000 employees. That is small for Postgres, so the aim was not to optimise early but to avoid the patterns that break as data grows, and to measure before adding anything.

## What is in place

**Database does the work**
- All salary statistics are calculated in Postgres with `GROUP BY` (`COUNT`, `MIN`, `MAX`, `AVG`). No employee rows are loaded into Ruby for the dashboard.
- The summary is one query: `COUNT(*), COUNT(DISTINCT country_id), COUNT(DISTINCT department_id)`.

**Indexes match the queries**
- `(country_id, job_title)` serves both the country filter and the job-title drill-down.
- `department_id`, `job_title` and a unique `email` index cover the other filters and lookups.

**The list never loads everything**
- Server-side pagination with Kaminari: 25 rows by default, 100 at most.
- `includes(:country, :department)` loads associations in two extra queries, not one per row. A request spec checks that a 2-row page and a 10-row page run the same number of queries.

**Seeding**
- `insert_all!` in batches of 1,000 inside one transaction, instead of 10,000 separate `create` calls.

**Frontend**
- Search runs on Enter, not on every keystroke.
- When filters change quickly, the previous request is cancelled, so the table never shows a stale response.
- Pages are lazy-loaded. React and Ant Design are split into their own chunks, so a deploy that only changes our code doesn't make browsers download the libraries again.

## Why there is no cache

The slowest query takes under 8 ms, so there is nothing to speed up yet. A cache would add code and a cache store without a noticeable gain.

When it is needed, the standard Rails approach is enough: wrap the insights queries in `Rails.cache.fetch` with a key built from `Employee.count` and `Employee.maximum(:updated_at)`. Any create, update or delete gives a new key, so old numbers are never served. The store can be Solid Cache (Rails 8 default, uses Postgres) or Redis.
