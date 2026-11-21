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
  teachers: number;
  students: number;
}

export interface ProgramRow {
  id: number;
  departmentCode: string;
  code: string;
  name: string;
  durationYears: number;
  totalSemesters: number;
}

export interface SubjectRow {
  id: number;
  departmentCode: string;
  code: string;
  title: string;
  creditHours: number;
}

export interface ProgramCurriculumRow {
  id: number;
  programCode: string;
  subjectCode: string;
  semesterNumber: number; // 1 to 8
}

export interface SectionRow {
  id: number;
  subjectCode: string;
  termName: string;
  programCode: string;
  code: string; // e.g. "A", "B"
  teacherName?: string;
  enrolledCount: number;
}

export interface AcademicTermRow {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Raw rows live in src/mock/ (README: Phase 1 runs on src/mock/).
// They use plain strings; narrow `role` back to the Role enum here.
export const users: UserRow[] = rawUsers.map((user) => ({
  ...user,
  role: user.role as Role,
}));

// Mock data for Departments
export const departments: DepartmentRow[] = rawDepartments;

export const programs: ProgramRow[] = [
  { id: 1, departmentCode: "CS", code: "BSCS", name: "BS Computer Science", durationYears: 4, totalSemesters: 8 },
  { id: 2, departmentCode: "CS", code: "BSSE", name: "BS Software Engineering", durationYears: 4, totalSemesters: 8 },
  { id: 3, departmentCode: "EE", code: "BSEE", name: "BS Electrical Engineering", durationYears: 4, totalSemesters: 8 },
  { id: 4, departmentCode: "ME", code: "BSME", name: "BS Mechanical Engineering", durationYears: 4, totalSemesters: 8 },
];

export const subjects: SubjectRow[] = [
  // CS & General
  { id: 1, departmentCode: "CS", code: "CS-101", title: "Intro to Programming", creditHours: 3 },
  { id: 2, departmentCode: "CS", code: "MATH-101", title: "Calculus & Analytical Geometry", creditHours: 3 },
  { id: 3, departmentCode: "CS", code: "ENG-101", title: "Functional English", creditHours: 3 },
  { id: 4, departmentCode: "CS", code: "CS-102", title: "Object Oriented Programming", creditHours: 4 },
  { id: 5, departmentCode: "CS", code: "CS-201", title: "Data Structures & Algorithms", creditHours: 4 },
  { id: 6, departmentCode: "CS", code: "CS-202", title: "Discrete Structures", creditHours: 3 },
  { id: 7, departmentCode: "CS", code: "CS-301", title: "Database Systems", creditHours: 4 },
  { id: 8, departmentCode: "CS", code: "CS-310", title: "Operating Systems", creditHours: 4 },
  { id: 9, departmentCode: "CS", code: "CS-320", title: "Software Engineering", creditHours: 3 },
  { id: 10, departmentCode: "CS", code: "CS-330", title: "Computer Networks", creditHours: 4 },
  { id: 11, departmentCode: "CS", code: "CS-401", title: "Artificial Intelligence", creditHours: 3 },
  { id: 12, departmentCode: "CS", code: "CS-410", title: "Design & Analysis of Algorithms", creditHours: 3 },
  { id: 13, departmentCode: "CS", code: "CS-490", title: "Final Year Project - I", creditHours: 3 },
  { id: 14, departmentCode: "CS", code: "CS-491", title: "Final Year Project - II", creditHours: 3 },
  { id: 15, departmentCode: "CS", code: "SE-302", title: "Software Architecture & Design", creditHours: 3 },
  { id: 16, departmentCode: "CS", code: "SE-303", title: "Software Quality Engineering", creditHours: 3 },

  // EE
  { id: 17, departmentCode: "EE", code: "EE-101", title: "Linear Circuit Analysis", creditHours: 4 },
  { id: 18, departmentCode: "EE", code: "EE-110", title: "Electronic Devices & Circuits", creditHours: 4 },
  { id: 19, departmentCode: "EE", code: "EE-201", title: "Digital Logic Design", creditHours: 4 },
  { id: 20, departmentCode: "EE", code: "EE-210", title: "Signals & Systems", creditHours: 3 },
  { id: 21, departmentCode: "EE", code: "EE-301", title: "Electromagnetic Field Theory", creditHours: 3 },
  { id: 22, departmentCode: "EE", code: "EE-310", title: "Microprocessor Systems", creditHours: 4 },
  { id: 23, departmentCode: "EE", code: "EE-320", title: "Feedback Control Systems", creditHours: 4 },
  { id: 24, departmentCode: "EE", code: "EE-490", title: "EE Capstone Project - I", creditHours: 3 },
  { id: 25, departmentCode: "EE", code: "EE-491", title: "EE Capstone Project - II", creditHours: 3 },

  // ME
  { id: 26, departmentCode: "ME", code: "ME-101", title: "Thermodynamics - I", creditHours: 3 },
  { id: 27, departmentCode: "ME", code: "ME-102", title: "Engineering Statics", creditHours: 3 },
  { id: 28, departmentCode: "ME", code: "ME-201", title: "Engineering Dynamics", creditHours: 3 },
  { id: 29, departmentCode: "ME", code: "ME-202", title: "Mechanics of Materials", creditHours: 4 },
  { id: 30, departmentCode: "ME", code: "ME-301", title: "Fluid Mechanics", creditHours: 4 },
  { id: 31, departmentCode: "ME", code: "ME-302", title: "Heat & Mass Transfer", creditHours: 4 },
  { id: 32, departmentCode: "ME", code: "ME-401", title: "Mechanical Vibrations", creditHours: 3 },
  { id: 33, departmentCode: "ME", code: "ME-490", title: "ME Design Project - I", creditHours: 3 },
  { id: 34, departmentCode: "ME", code: "ME-491", title: "ME Design Project - II", creditHours: 3 },
];

export const programCurriculums: ProgramCurriculumRow[] = [
  // BSCS (8 Semesters)
  { id: 1, programCode: "BSCS", subjectCode: "CS-101", semesterNumber: 1 },
  { id: 2, programCode: "BSCS", subjectCode: "MATH-101", semesterNumber: 1 },
  { id: 3, programCode: "BSCS", subjectCode: "ENG-101", semesterNumber: 1 },
  { id: 4, programCode: "BSCS", subjectCode: "CS-102", semesterNumber: 2 },
  { id: 5, programCode: "BSCS", subjectCode: "CS-202", semesterNumber: 2 },
  { id: 6, programCode: "BSCS", subjectCode: "CS-201", semesterNumber: 3 },
  { id: 7, programCode: "BSCS", subjectCode: "CS-301", semesterNumber: 4 },
  { id: 8, programCode: "BSCS", subjectCode: "CS-310", semesterNumber: 5 },
  { id: 9, programCode: "BSCS", subjectCode: "CS-320", semesterNumber: 5 },
  { id: 10, programCode: "BSCS", subjectCode: "CS-330", semesterNumber: 6 },
  { id: 11, programCode: "BSCS", subjectCode: "CS-410", semesterNumber: 6 },
  { id: 12, programCode: "BSCS", subjectCode: "CS-401", semesterNumber: 7 },
  { id: 13, programCode: "BSCS", subjectCode: "CS-490", semesterNumber: 7 },
  { id: 14, programCode: "BSCS", subjectCode: "CS-491", semesterNumber: 8 },

  // BSSE (8 Semesters)
  { id: 15, programCode: "BSSE", subjectCode: "CS-101", semesterNumber: 1 },
  { id: 16, programCode: "BSSE", subjectCode: "MATH-101", semesterNumber: 1 },
  { id: 17, programCode: "BSSE", subjectCode: "ENG-101", semesterNumber: 1 },
  { id: 18, programCode: "BSSE", subjectCode: "CS-102", semesterNumber: 2 },
  { id: 19, programCode: "BSSE", subjectCode: "CS-201", semesterNumber: 3 },
  { id: 20, programCode: "BSSE", subjectCode: "CS-320", semesterNumber: 4 },
  { id: 21, programCode: "BSSE", subjectCode: "CS-301", semesterNumber: 5 },
  { id: 22, programCode: "BSSE", subjectCode: "SE-302", semesterNumber: 5 },
  { id: 23, programCode: "BSSE", subjectCode: "SE-303", semesterNumber: 6 },
  { id: 24, programCode: "BSSE", subjectCode: "CS-490", semesterNumber: 7 },
  { id: 25, programCode: "BSSE", subjectCode: "CS-491", semesterNumber: 8 },

  // BSEE (8 Semesters)
  { id: 26, programCode: "BSEE", subjectCode: "EE-101", semesterNumber: 1 },
  { id: 27, programCode: "BSEE", subjectCode: "MATH-101", semesterNumber: 1 },
  { id: 28, programCode: "BSEE", subjectCode: "EE-110", semesterNumber: 2 },
  { id: 29, programCode: "BSEE", subjectCode: "EE-201", semesterNumber: 3 },
  { id: 30, programCode: "BSEE", subjectCode: "EE-210", semesterNumber: 4 },
  { id: 31, programCode: "BSEE", subjectCode: "EE-301", semesterNumber: 5 },
  { id: 32, programCode: "BSEE", subjectCode: "EE-310", semesterNumber: 6 },
  { id: 33, programCode: "BSEE", subjectCode: "EE-320", semesterNumber: 7 },
  { id: 34, programCode: "BSEE", subjectCode: "EE-490", semesterNumber: 7 },
  { id: 35, programCode: "BSEE", subjectCode: "EE-491", semesterNumber: 8 },

  // BSME (8 Semesters)
  { id: 36, programCode: "BSME", subjectCode: "ME-101", semesterNumber: 1 },
  { id: 37, programCode: "BSME", subjectCode: "MATH-101", semesterNumber: 1 },
  { id: 38, programCode: "BSME", subjectCode: "ME-102", semesterNumber: 2 },
  { id: 39, programCode: "BSME", subjectCode: "ME-201", semesterNumber: 3 },
  { id: 40, programCode: "BSME", subjectCode: "ME-202", semesterNumber: 4 },
  { id: 41, programCode: "BSME", subjectCode: "ME-301", semesterNumber: 5 },
  { id: 42, programCode: "BSME", subjectCode: "ME-302", semesterNumber: 6 },
  { id: 43, programCode: "BSME", subjectCode: "ME-401", semesterNumber: 7 },
  { id: 44, programCode: "BSME", subjectCode: "ME-490", semesterNumber: 7 },
  { id: 45, programCode: "BSME", subjectCode: "ME-491", semesterNumber: 8 },
];

export const academicTerms: AcademicTermRow[] = [
  { id: 1, name: "Fall 2026", startDate: "2026-09-01", endDate: "2027-01-31", isActive: true },
  { id: 2, name: "Spring 2026", startDate: "2026-02-01", endDate: "2026-06-30", isActive: false },
];

export const sections: SectionRow[] = [
  // BSCS Sections
  { id: 1, subjectCode: "CS-101", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Erin", enrolledCount: 42 },
  { id: 2, subjectCode: "CS-101", termName: "Fall 2026", programCode: "BSCS", code: "B", teacherName: "Erin", enrolledCount: 39 },
  { id: 3, subjectCode: "CS-201", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Carol", enrolledCount: 38 },
  { id: 4, subjectCode: "CS-301", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Carol", enrolledCount: 35 },
  { id: 5, subjectCode: "CS-301", termName: "Fall 2026", programCode: "BSCS", code: "B", teacherName: "Carol", enrolledCount: 30 },
  { id: 6, subjectCode: "CS-310", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Carol", enrolledCount: 32 },
  { id: 7, subjectCode: "CS-401", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Erin", enrolledCount: 28 },

  // BSSE Sections
  { id: 8, subjectCode: "CS-101", termName: "Fall 2026", programCode: "BSSE", code: "A", teacherName: "Erin", enrolledCount: 40 },
  { id: 9, subjectCode: "SE-302", termName: "Fall 2026", programCode: "BSSE", code: "A", teacherName: "Carol", enrolledCount: 33 },

  // BSEE Sections
  { id: 10, subjectCode: "EE-101", termName: "Fall 2026", programCode: "BSEE", code: "A", teacherName: "Bob", enrolledCount: 30 },
  { id: 11, subjectCode: "EE-110", termName: "Fall 2026", programCode: "BSEE", code: "A", teacherName: "Bob", enrolledCount: 25 },
  { id: 12, subjectCode: "EE-210", termName: "Fall 2026", programCode: "BSEE", code: "A", teacherName: "Farah", enrolledCount: 27 },

  // BSME Sections
  { id: 13, subjectCode: "ME-101", termName: "Fall 2026", programCode: "BSME", code: "A", teacherName: "Dan", enrolledCount: 31 },
  { id: 14, subjectCode: "ME-201", termName: "Fall 2026", programCode: "BSME", code: "A", teacherName: "Dan", enrolledCount: 24 },
  { id: 15, subjectCode: "ME-301", termName: "Fall 2026", programCode: "BSME", code: "A", teacherName: "Dan", enrolledCount: 22 },
];

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
