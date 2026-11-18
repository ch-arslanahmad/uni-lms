// This is a holder file to hold the data models of the frontend

export type Role = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department: string
}

export interface Section {
  id: string
  code: string        // e.g. "CS-301-A"
  courseName: string
  term: string        // e.g. "Fall 2026"
  teacher: string
  studentIds: string[]
}

export const users: User[] = [ /* seeded super admin + ~10 users */ ]
export const sections: Section[] = [ /* ~5 sections */ ]