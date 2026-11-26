# AGENTS.md

Instructions for AI agents working in this repo.

## What this repo is

DBMS + React course project, University of Lahore, Fall 2026. Submission: 2026-12-07.

Graded authority lives in the course briefs: DBMS deliverables (ERD, 3NF, constraints, 50+ rows/table, queries, forms, reports, tests) and React deliverables (3 screens, dynamic route, CRUD list, validated form, shared context).

Application code lives in `frontend/`. Each directory README carries the rules code in that directory must follow; read it before writing code there.

## Scope

Scope was locked after the student UI was merged, then reopened while the teacher branch was being built. Changes are allowed when the previous decision is not better; otherwise remind the user that scope was agreed.

- Current design: 26 tables, FR1–FR23, integrity rules I1–I21, 3NF.
- Only 3 open items remain: Chen ERD, final forms/reports set, file storage backend.
- Retake rule is deliberately most-recent-result, NOT the university's better-grade rule. Flag it as a project decision in the final demo.
- MCQ scores are revealed on submission; written answers and other grades stay hidden until teacher publication. This is the chosen reading of FR4's review policy.
- The proposal already given to the instructor is reference material only; a resubmission happened, so keep proposals current.
- Keep proposal documents to the three agreed files. Older drafts and research are history, not scope authority.

## Planned stack

React + TypeScript, Spring Boot + Spring Security, PostgreSQL, Docker Compose.

## Order of work

React frontend on mock data (frontend/README.md Phase 1) → Spring API → database schema. Prove one table through all three layers before feature work.

## Non-obvious rules (from directory READMEs)

- Frontend never connects to PostgreSQL. It talks to backend only; Phase 1 runs on `src/mock/`.
- Backend: controllers → services → repositories. No SQL in controllers. Atomic ops: grading, CSV import.
- Database: `schema/` then `seed/` must run on a fresh PostgreSQL alone. Every data rule needs two tests: valid write accepted, invalid write rejected.
- Business rules needing session context live in backend; everything that must never be false lives in `database/schema/`.

## Commands

Frontend commands, run in `frontend/`: `npm run lint`, `npx tsc -b`, `npm run build`.

## Git

Use conventional commit messages. Never mention local-only or untracked files in commits.
