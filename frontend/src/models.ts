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
  code: string; // subject abbreviation, e.g. "DBMS"
  title: string;
  creditHours: number;
}

export interface ProgramCurriculumRow {
  id: number;
  programCode: string;
  subjectCode: string; // subject abbreviation, e.g. "DBMS"
  semesterNumber: number; // 1 to 8
}

export interface SectionRow {
  id: number;
  subjectCode: string; // subject abbreviation, e.g. "DBMS"
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
  { id: 1, departmentCode: "CS", code: "PROG", title: "Intro to Programming", creditHours: 3 },
  { id: 2, departmentCode: "CS", code: "MATH", title: "Calculus & Analytical Geometry", creditHours: 3 },
  { id: 3, departmentCode: "CS", code: "ENG", title: "Functional English", creditHours: 3 },
  { id: 4, departmentCode: "CS", code: "OOP", title: "Object Oriented Programming", creditHours: 4 },
  { id: 5, departmentCode: "CS", code: "DSA", title: "Data Structures & Algorithms", creditHours: 4 },
  { id: 6, departmentCode: "CS", code: "DISC", title: "Discrete Structures", creditHours: 3 },
  { id: 7, departmentCode: "CS", code: "DBMS", title: "Database Systems", creditHours: 4 },
  { id: 8, departmentCode: "CS", code: "OS", title: "Operating Systems", creditHours: 4 },
  { id: 9, departmentCode: "CS", code: "SE", title: "Software Engineering", creditHours: 3 },
  { id: 10, departmentCode: "CS", code: "CN", title: "Computer Networks", creditHours: 4 },
  { id: 11, departmentCode: "CS", code: "AI", title: "Artificial Intelligence", creditHours: 3 },
  { id: 12, departmentCode: "CS", code: "DAA", title: "Design & Analysis of Algorithms", creditHours: 3 },
  { id: 13, departmentCode: "CS", code: "FYP1", title: "Final Year Project - I", creditHours: 3 },
  { id: 14, departmentCode: "CS", code: "FYP2", title: "Final Year Project - II", creditHours: 3 },
  { id: 15, departmentCode: "CS", code: "SAD", title: "Software Architecture & Design", creditHours: 3 },
  { id: 16, departmentCode: "CS", code: "SQE", title: "Software Quality Engineering", creditHours: 3 },

  // EE
  { id: 17, departmentCode: "EE", code: "LCA", title: "Linear Circuit Analysis", creditHours: 4 },
  { id: 18, departmentCode: "EE", code: "EDC", title: "Electronic Devices & Circuits", creditHours: 4 },
  { id: 19, departmentCode: "EE", code: "DLD", title: "Digital Logic Design", creditHours: 4 },
  { id: 20, departmentCode: "EE", code: "SS", title: "Signals & Systems", creditHours: 3 },
  { id: 21, departmentCode: "EE", code: "EMFT", title: "Electromagnetic Field Theory", creditHours: 3 },
  { id: 22, departmentCode: "EE", code: "MP", title: "Microprocessor Systems", creditHours: 4 },
  { id: 23, departmentCode: "EE", code: "FCS", title: "Feedback Control Systems", creditHours: 4 },
  { id: 24, departmentCode: "EE", code: "ECP1", title: "EE Capstone Project - I", creditHours: 3 },
  { id: 25, departmentCode: "EE", code: "ECP2", title: "EE Capstone Project - II", creditHours: 3 },

  // ME
  { id: 26, departmentCode: "ME", code: "THM1", title: "Thermodynamics - I", creditHours: 3 },
  { id: 27, departmentCode: "ME", code: "EST", title: "Engineering Statics", creditHours: 3 },
  { id: 28, departmentCode: "ME", code: "EDYN", title: "Engineering Dynamics", creditHours: 3 },
  { id: 29, departmentCode: "ME", code: "MOM", title: "Mechanics of Materials", creditHours: 4 },
  { id: 30, departmentCode: "ME", code: "FM", title: "Fluid Mechanics", creditHours: 4 },
  { id: 31, departmentCode: "ME", code: "HMT", title: "Heat & Mass Transfer", creditHours: 4 },
  { id: 32, departmentCode: "ME", code: "MV", title: "Mechanical Vibrations", creditHours: 3 },
  { id: 33, departmentCode: "ME", code: "MDP1", title: "ME Design Project - I", creditHours: 3 },
  { id: 34, departmentCode: "ME", code: "MDP2", title: "ME Design Project - II", creditHours: 3 },
];

export const programCurriculums: ProgramCurriculumRow[] = [
  // BSCS (8 Semesters)
  { id: 1, programCode: "BSCS", subjectCode: "PROG", semesterNumber: 1 },
  { id: 2, programCode: "BSCS", subjectCode: "MATH", semesterNumber: 1 },
  { id: 3, programCode: "BSCS", subjectCode: "ENG", semesterNumber: 1 },
  { id: 4, programCode: "BSCS", subjectCode: "OOP", semesterNumber: 2 },
  { id: 5, programCode: "BSCS", subjectCode: "DISC", semesterNumber: 2 },
  { id: 6, programCode: "BSCS", subjectCode: "DSA", semesterNumber: 3 },
  { id: 7, programCode: "BSCS", subjectCode: "DBMS", semesterNumber: 4 },
  { id: 8, programCode: "BSCS", subjectCode: "OS", semesterNumber: 5 },
  { id: 9, programCode: "BSCS", subjectCode: "SE", semesterNumber: 5 },
  { id: 10, programCode: "BSCS", subjectCode: "CN", semesterNumber: 6 },
  { id: 11, programCode: "BSCS", subjectCode: "DAA", semesterNumber: 6 },
  { id: 12, programCode: "BSCS", subjectCode: "AI", semesterNumber: 7 },
  { id: 13, programCode: "BSCS", subjectCode: "FYP1", semesterNumber: 7 },
  { id: 14, programCode: "BSCS", subjectCode: "FYP2", semesterNumber: 8 },

  // BSSE (8 Semesters)
  { id: 15, programCode: "BSSE", subjectCode: "PROG", semesterNumber: 1 },
  { id: 16, programCode: "BSSE", subjectCode: "MATH", semesterNumber: 1 },
  { id: 17, programCode: "BSSE", subjectCode: "ENG", semesterNumber: 1 },
  { id: 18, programCode: "BSSE", subjectCode: "OOP", semesterNumber: 2 },
  { id: 19, programCode: "BSSE", subjectCode: "DSA", semesterNumber: 3 },
  { id: 20, programCode: "BSSE", subjectCode: "SE", semesterNumber: 4 },
  { id: 21, programCode: "BSSE", subjectCode: "DBMS", semesterNumber: 5 },
  { id: 22, programCode: "BSSE", subjectCode: "SAD", semesterNumber: 5 },
  { id: 23, programCode: "BSSE", subjectCode: "SQE", semesterNumber: 6 },
  { id: 24, programCode: "BSSE", subjectCode: "FYP1", semesterNumber: 7 },
  { id: 25, programCode: "BSSE", subjectCode: "FYP2", semesterNumber: 8 },

  // BSEE (8 Semesters)
  { id: 26, programCode: "BSEE", subjectCode: "LCA", semesterNumber: 1 },
  { id: 27, programCode: "BSEE", subjectCode: "MATH", semesterNumber: 1 },
  { id: 28, programCode: "BSEE", subjectCode: "EDC", semesterNumber: 2 },
  { id: 29, programCode: "BSEE", subjectCode: "DLD", semesterNumber: 3 },
  { id: 30, programCode: "BSEE", subjectCode: "SS", semesterNumber: 4 },
  { id: 31, programCode: "BSEE", subjectCode: "EMFT", semesterNumber: 5 },
  { id: 32, programCode: "BSEE", subjectCode: "MP", semesterNumber: 6 },
  { id: 33, programCode: "BSEE", subjectCode: "FCS", semesterNumber: 7 },
  { id: 34, programCode: "BSEE", subjectCode: "ECP1", semesterNumber: 7 },
  { id: 35, programCode: "BSEE", subjectCode: "ECP2", semesterNumber: 8 },

  // BSME (8 Semesters)
  { id: 36, programCode: "BSME", subjectCode: "THM1", semesterNumber: 1 },
  { id: 37, programCode: "BSME", subjectCode: "MATH", semesterNumber: 1 },
  { id: 38, programCode: "BSME", subjectCode: "EST", semesterNumber: 2 },
  { id: 39, programCode: "BSME", subjectCode: "EDYN", semesterNumber: 3 },
  { id: 40, programCode: "BSME", subjectCode: "MOM", semesterNumber: 4 },
  { id: 41, programCode: "BSME", subjectCode: "FM", semesterNumber: 5 },
  { id: 42, programCode: "BSME", subjectCode: "HMT", semesterNumber: 6 },
  { id: 43, programCode: "BSME", subjectCode: "MV", semesterNumber: 7 },
  { id: 44, programCode: "BSME", subjectCode: "MDP1", semesterNumber: 7 },
  { id: 45, programCode: "BSME", subjectCode: "MDP2", semesterNumber: 8 },
];

export const academicTerms: AcademicTermRow[] = [
  { id: 1, name: "Fall 2026", startDate: "2026-09-01", endDate: "2027-01-31", isActive: true },
  { id: 2, name: "Spring 2026", startDate: "2026-02-01", endDate: "2026-06-30", isActive: false },
];

export const sections: SectionRow[] = [
  // BSCS Sections
  { id: 1, subjectCode: "PROG", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Erin", enrolledCount: 42 },
  { id: 2, subjectCode: "PROG", termName: "Fall 2026", programCode: "BSCS", code: "B", teacherName: "Erin", enrolledCount: 39 },
  { id: 3, subjectCode: "DSA", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Carol", enrolledCount: 38 },
  { id: 4, subjectCode: "DBMS", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Carol", enrolledCount: 35 },
  { id: 5, subjectCode: "DBMS", termName: "Fall 2026", programCode: "BSCS", code: "B", teacherName: "Carol", enrolledCount: 30 },
  { id: 6, subjectCode: "OS", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Carol", enrolledCount: 32 },
  { id: 7, subjectCode: "AI", termName: "Fall 2026", programCode: "BSCS", code: "A", teacherName: "Erin", enrolledCount: 28 },

  // BSSE Sections
  { id: 8, subjectCode: "PROG", termName: "Fall 2026", programCode: "BSSE", code: "A", teacherName: "Erin", enrolledCount: 40 },
  { id: 9, subjectCode: "SAD", termName: "Fall 2026", programCode: "BSSE", code: "A", teacherName: "Carol", enrolledCount: 33 },

  // BSEE Sections
  { id: 10, subjectCode: "LCA", termName: "Fall 2026", programCode: "BSEE", code: "A", teacherName: "Bob", enrolledCount: 30 },
  { id: 11, subjectCode: "EDC", termName: "Fall 2026", programCode: "BSEE", code: "A", teacherName: "Bob", enrolledCount: 25 },
  { id: 12, subjectCode: "SS", termName: "Fall 2026", programCode: "BSEE", code: "A", teacherName: "Farah", enrolledCount: 27 },

  // BSME Sections
  { id: 13, subjectCode: "THM1", termName: "Fall 2026", programCode: "BSME", code: "A", teacherName: "Dan", enrolledCount: 31 },
  { id: 14, subjectCode: "EDYN", termName: "Fall 2026", programCode: "BSME", code: "A", teacherName: "Dan", enrolledCount: 24 },
  { id: 15, subjectCode: "FM", termName: "Fall 2026", programCode: "BSME", code: "A", teacherName: "Dan", enrolledCount: 22 },
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
    href: "/admin/academics?tab=departments",
  },
  { value: subjects.length, label: "Courses", href: "/admin/academics?tab=courses" },
  { value: teachers.length, label: "Teachers", href: "/admin/teachers" },
  { value: students.length, label: "Students", href: "/admin/students" },
];
