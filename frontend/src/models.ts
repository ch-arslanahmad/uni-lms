// This is a holder file to hold the data models of the frontend
// but also holds dummy data as well

import type { LucideIcon } from "lucide-react";

export type Role = "student" | "teacher" | "admin";

// ── Dashboard shared types ────────────────────────────────────────────────────

export interface StatCardInfo {
  value: number;
  label: string;
  href?: string;
}

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
}

// Domain classes (map to DB entities later)

export class User {
  id: number;
  name: string;
  role: Role;
  department: string;

  constructor(id: number, name: string, role: Role, department: string) {
    this.id = id;
    this.name = name;
    this.role = role;
    // Admins see every department, so their own is "all"
    this.department = role === "admin" ? "all" : department;
  }
}

export class Section {
  id: string;
  code: string; // e.g. "CS-301-A"
  courseName: string;
  term: string; // e.g. "Fall 2026"
  teacher: string;
  studentIds: string[];

  constructor(
    id: string,
    code: string,
    courseName: string,
    term: string,
    teacher: string,
    studentIds: string[],
  ) {
    this.id = id;
    this.code = code;
    this.courseName = courseName;
    this.term = term;
    this.teacher = teacher;
    this.studentIds = studentIds;
  }
}

// View-only shape (computed, not a DB entity)

// Dashboard departments table (computed view shape, not a DB entity)
export interface DepartmentRow {
  code: string;
  name: string;
  courses: number;
  accounts: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const users: User[] = [new User(1, "Arslan", "admin", "admin")];
export const sections: Section[] = [/* ~5 sections */];

export const departments: DepartmentRow[] = [
  { code: "CS", name: "Computer Science",        courses: 12, accounts: 34 },
  { code: "EE", name: "Electrical Engineering",  courses: 9,  accounts: 21 },
  { code: "ME", name: "Mechanical Engineering",  courses: 7,  accounts: 18 },
];

// ── Admin dashboard data ──────────────────────────────────────────────────────
// Import icons at the page level; icons are listed here as placeholder strings
// and resolved in AdminDashboard.tsx to keep models.ts icon-free.

export const adminStats: StatCardInfo[] = [
  { value: departments.length, label: "Departments", href: "/admin/departments" },
  { value: 3,                  label: "Courses",     href: "/admin/courses"     },
  { value: 5,                  label: "Teachers",    href: "/admin/teachers"    },
  { value: 10,                 label: "Students",    href: "/admin/students"    },
  { value: 8,                  label: "Sections",    href: "/admin/sections"    },
];
