# database

Schema, data and SQL for uni-lms. Runs on PostgreSQL without the frontend or backend.

## Layout

```
database/
├── schema/     DDL: tables, PK/FK, NOT NULL, UNIQUE, CHECK, triggers
├── seed/       at least 50 rows per table, including one admin account
├── queries/    WHERE, ORDER BY, GROUP BY, JOIN, CASE, subquery, aggregate
├── reports/    report SQL and expected output
├── tests/      constraint and trigger tests, including invalid-input cases
└── docs/       ERD, 3NF notes, data dictionary
```

## Rules

- The schema must run on a fresh PostgreSQL database with `schema/` then `seed/`, nothing else.
- Every data rule needs a test that proves it holds and a test that proves the invalid write is rejected.
- No application logic here. Authorization and business rules that need a session live in `backend/`.
- Forms and reports are demonstrated through the frontend, but the SQL behind them belongs here.
