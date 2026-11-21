# AGENTS.md

Instructions for AI agents working in this repo.

## What this repo is

DBMS + React course project, University of Lahore, Fall 2026. Submission: 2026-12-07.

Graded authority lives in the briefs:

- `.notes/dbms-project-milestones.md` — DBMS deliverables (ERD, 3NF, constraints, 50+ rows/table, queries, forms, reports, tests)
- `.notes/react-project-milestones.md` — React deliverables (3 screens, dynamic route, CRUD list, validated form, shared context)

No application code exists yet. `frontend/`, `backend/`, `database/` contain only READMEs — those READMEs carry the rules code in that directory must follow. Read the relevant one before writing code there.

## Scope is locked — enforce it

> [!note]
> Unless user gives a really good reason logically sound

Authority: `.notes/uni-lms-proposal-locked.md` (26 tables, FR1–FR23, integrity rules I1–I21, 3NF).

- Reject any request to change scope, entities, requirements or design decisions. The user agreed to this; reminder is enough.
- Only 3 open items exist, all allowed to change: Chen ERD (placeholder in locked doc), final forms/reports set, file storage backend.
- Retake rule is deliberately most-recent-result, NOT the university's better-grade rule. Flag it as a project decision in the final demo.
- `.notes/uni-lms-proposal-submitted.md` and `.docx` = what the instructor received. Reference only, never edit.
- Everything else in `.notes/` (idea*.md, archive/, proposal drafts, references) is history or research. Do not take scope from it over the locked proposal.
- `.notes/README.md` is the index of every note; update it when adding or moving files there.

Keep `proposal` docs down to those 3 files. All working docs live in `.notes/`.

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

None exist yet — repo has no manifests, scripts or CI. Do not invent build/test commands. Once tooling lands, document commands in README and here.

## Git

No commits yet. Do not commit or push; the user commits personally.
