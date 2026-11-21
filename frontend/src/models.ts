// This is a holder file to hold the data models of the frontend
// but also holds dummy data as well

import type { LucideIcon } from "lucide-react";
import {
  users as rawUsers,
  studentPlacement,
  teacherCourses,
  departments as rawDepartments,
} from "./mock/people";

export enum Role {
  student = "student",
  teacher = "teacher",
  admin = "admin",
}

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

// View-only shapes (computed, not a DB entity)
export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export interface TeacherRow {
  id: number;
  name: string;
  email: string;
  department: string;
  courses: string;
}

export interface StudentRow {
  id: number;
  name: string;
  email: string;
  course: string;
  semester: string;
  section: string;
  department: string;
}

export type User = UserRow; // For now, User is userflow for ease & compatibility
export type Teacher = TeacherRow;
export type Student = StudentRow;

export interface DepartmentRow {
  code: string;
  name: string;
  courses: number;
  accounts: number;
}

// Raw rows live in src/mock/ (README: Phase 1 runs on src/mock/).
// They use plain strings; narrow `role` back to the Role enum here.
export const users: UserRow[] = rawUsers.map((user) => ({
  ...user,
  role: user.role as Role,
}));

// Mock data for Students
export const students: StudentRow[] = users
  .filter((user) => user.role === Role.student)
  .map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    ...studentPlacement[user.id],
  }));

// Mock data for Teachers
export const teachers: TeacherRow[] = users
  .filter((user) => user.role === Role.teacher)
  .map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    courses: teacherCourses[user.id],
  }));

// Mock data for Departments
export const departments: DepartmentRow[] = rawDepartments;

// Admin dashboard computed stats
export const adminStats: StatCardInfo[] = [
  {
    value: departments.length,
    label: "Departments",
    href: "/admin/departments",
  },
  { value: 3, label: "Courses", href: "/admin/courses" },
  { value: teachers.length, label: "Teachers", href: "/admin/teachers" },
  { value: students.length, label: "Students", href: "/admin/students" },
];
