// This is a holder file to hold the data models of the frontend
// but also holds dummy data as well

import type { LucideIcon } from "lucide-react";

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
  role: Role;
  department: string;
}

export type User = UserRow; // For now, User is userflow for ease & compatibility

export interface DepartmentRow {
  code: string;
  name: string;
  courses: number;
  accounts: number;
}

// Mock data for Users
export const users: UserRow[] = [
  { id: 1, name: "Arslan", role: Role.admin, department: "all" },
  { id: 2, name: "Bob", role: Role.teacher, department: "EE" },
  { id: 3, name: "Carol", role: Role.teacher, department: "CS" },
  { id: 4, name: "David", role: Role.student, department: "ME" },
  { id: 5, name: "Eve", role: Role.student, department: "CS" },
  { id: 6, name: "Frank", role: Role.student, department: "CS" },
  { id: 7, name: "Grace", role: Role.student, department: "EE" },
  { id: 8, name: "Henry", role: Role.student, department: "ME" },
];

// Mock data for Departments
export const departments: DepartmentRow[] = [
  { code: "CS", name: "Computer Science", courses: 12, accounts: 34 },
  { code: "EE", name: "Electrical Engineering", courses: 9, accounts: 21 },
  { code: "ME", name: "Mechanical Engineering", courses: 7, accounts: 18 },
];

// Admin dashboard computed stats
export const adminStats: StatCardInfo[] = [
  {
    value: departments.length,
    label: "Departments",
    href: "/admin/departments",
  },
  { value: 3, label: "Courses", href: "/admin/courses" },
  { value: 2, label: "Teachers", href: "/admin/teachers" },
  { value: 4, label: "Students", href: "/admin/students" },
  { value: 5, label: "Sections", href: "/admin/sections" },
];
