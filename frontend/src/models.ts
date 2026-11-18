// This is a holder file to hold the data models of the frontend

export type Role = "student" | "teacher" | "admin";

export class User {
  id: number;
  name: string;
  role: Role;
  department: string;

  constructor(id: number, name: string, role: Role, department: string) {
    this.id = id;
    this.name = name;
    this.role = role;
    if (role.toLowerCase() === "admin") {
      this.department = "all";
    }
    this.department = department;
  }
}

export class Section {
  id: string;
  code: string; // e.g. "CS-301-A"
  courseName: string;
  term: string; // e.g. "Fall 2026"
  teacher: string;
  studentIds: string[];
}

export const users: User[] = [new User(1, "admin", "admin", "admin")];
export const sections: Section[] = [/* ~5 sections */];
