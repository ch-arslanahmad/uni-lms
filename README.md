# uni-lms

A university learning management system, where students, instructors and administrators share one platform for the full course lifecycle.

## Features

- **Students** enroll in courses, view announcements, submit assignments and track grades and retake results.
- **Instructors** manage course offerings, create and grade assignments, and publish announcements.
- **Administrators** maintain users, courses and enrollment, with validated data-entry forms behind every write.

Data is stored in a PostgreSQL schema of 26 normalized tables (3NF) with constraints and triggers enforcing integrity; a Spring Boot API exposes it under role-based authorization, and a React single-page app is the only client. The frontend never talks to the database directly.

## Stack

- **Frontend:** React + TypeScript
- **Backend:** Spring Boot + Spring Security
- **Database:** PostgreSQL
- **Containerization:** Docker Compose

## Structure

```
uni-lms/
├── frontend/   React + TypeScript app (Vite, Tailwind v4, shadcn/ui)
├── backend/    Spring Boot API (controllers → services → repositories)
├── database/   Schema, seeds, queries, reports, tests, docs
```

Each directory has its own README with the rules code there must follow — read it before writing code in that directory.

- [frontend/README.md](frontend/README.md), screens, phases, UI rules
- [backend/README.md](backend/README.md), layering, security, atomic ops
- [database/README.md](database/README.md), layout, schema/seed rules, tests

## Setup

After cloning, activate the Git hooks once:

```bash
git config core.hooksPath scripts/hooks
```

This wires up pre-commit (lint + type-check), commit-msg (Conventional Commits), and pre-push (full build) for your local clone. Ahsan needs to run this too.

## Commands

To be added
