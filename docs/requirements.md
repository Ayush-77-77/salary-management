# Requirements: ACME Salary Management

## Goal

ACME's HR team manages salary data for about 10,000 employees across several countries in Excel. Updating records and answering simple questions like "what do we pay engineers in India?" means scrolling through sheets and building pivot tables by hand.

The goal is a web app where the HR Manager can manage employee salary data in one place and quickly understand how the org pays people.

## Scope & Features

**Login**
- The HR Manager logs in with email and password (JWT-based).
- No public sign-up. HR accounts are created by the seed script.

**Employees**
- A list of all employees with pagination, search by name, and filters for country, department and job title.
- Sorting by name, salary and hire date.
- Add, edit and delete an employee, with basic validation (required fields, unique email, positive salary).
- Fields: name, email, job title, department, country, salary, hire date.
- Salary is stored in the employee's local currency (e.g. INR for India, USD for the US). The currency is set automatically from the country, so it can't be entered wrong.

**Salary Insights**
- Summary: total employees, countries and departments.
- Salary by country: headcount, min, max and average salary, shown in that country's currency.
- Salary by job title within a selected country.

**Seed data**
- A seed script that creates 10,000 employees spread across countries, departments and job titles.

## Out of Scope

- **Currency conversion:** salaries are compared within a country, so currencies never get mixed. Comparing across countries in a single currency would need exchange rates that change daily, which adds complexity without being needed for v1.
- **Roles and permissions:** there is a single user type (HR Manager) for now, so different access levels aren't needed yet.
- **Salary history:** v1 tracks the current salary only, same as the spreadsheet does today. History can be added later.
- **Excel import/export:** the seed script handles initial data. A proper import needs good validation and error reporting, so it's better as a separate feature.
- **Password reset:** this needs email delivery and secure, expiring reset tokens, which is separate infrastructure from the core problem. Since HR accounts are created by an admin (no public sign-up), an admin can reset a password the same way for now.
