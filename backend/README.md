# backend

Spring Boot API between the React app and PostgreSQL.

## Responsibilities

- Authentication and role checks (student, teacher, super admin).
- Transactions for the two atomic operations: grading a submission and CSV import.
- Query filtering by section membership.

## Rules

- No SQL in controllers. Controllers → services → repositories.
- Business rules that need session context live here; everything that must never be false lives in `../database/schema/`.
- The frontend never connects to PostgreSQL directly.
