// Shared mutable mock store for the admin area (Phase 1).
// One source of truth so CRUD, CSV ingest and the timetable all see
// the same data and nothing drifts. Seeded from src/models.ts + src/mock/.
// Persistence, real transactions and authorization arrive with the backend.

import { useSyncExternalStore } from "react";
import {
  departments as seedDepartments,
  programs as seedPrograms,
  subjects as seedSubjects,
  programCurriculums as seedCurriculums,
  academicTerms as seedTerms,
  sections as seedSections,
  users as seedUsers,
  Role,
  type DepartmentRow,
  type ProgramRow,
  type SubjectRow,
  type ProgramCurriculumRow,
  type AcademicTermRow,
  type SectionRow,
  type UserRow,
  type StudentRow,
  type TeacherRow,
} from "../models";
import { studentPlacement, teacherCourses as seedTeacherCourses } from "../mock/people";
import { initialScheduleSlots, type ScheduleSlot } from "../mock/timetable";
import { mockExamDatesheet, type ExamDatesheetEntry } from "../mock/calendar";
import type { CsvDataType } from "../mock/csvTemplates";

export interface EnrolmentRow {
  id: number;
  studentId: number;
  course: string;
  semester: string;
  section: string;
}

export interface AdminState {
  departments: DepartmentRow[];
  programs: ProgramRow[];
  subjects: SubjectRow[];
  programCurriculums: ProgramCurriculumRow[];
  academicTerms: AcademicTermRow[];
  sections: SectionRow[];
  scheduleSlots: ScheduleSlot[];
  users: UserRow[];
  enrolments: EnrolmentRow[];
  teacherCourses: Record<number, string>;
  examDatesheet: ExamDatesheetEntry[];
}

function seedState(): AdminState {
  return {
    departments: seedDepartments.map((d) => ({ ...d })),
    programs: seedPrograms.map((p) => ({ ...p })),
    subjects: seedSubjects.map((s) => ({ ...s })),
    programCurriculums: seedCurriculums.map((c) => ({ ...c })),
    academicTerms: seedTerms.map((t) => ({ ...t })),
    sections: seedSections.map((s) => ({ ...s })),
    scheduleSlots: initialScheduleSlots.map((s) => ({ ...s })),
    users: seedUsers.map((u) => ({ ...u })),
    enrolments: Object.entries(studentPlacement).map(([id, p], idx) => ({
      id: idx + 1,
      studentId: Number(id),
      ...p,
    })),
    teacherCourses: { ...seedTeacherCourses },
    examDatesheet: mockExamDatesheet.map((e) => ({ ...e })),
  };
}

// Phase-1 persistence: keep the mock state across page reloads so CRUD and
// CSV imports survive navigation. Cleared by the browser tab session only.
const STORAGE_KEY = "uni-lms-admin-store-v1";

function loadState(): AdminState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminState;
  } catch {
    // corrupted or unavailable storage — fall back to seeds
  }
  return seedState();
}

let state = loadState();
const listeners = new Set<() => void>();

function commit(next: AdminState) {
  state = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full/unavailable — in-memory state still works
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAdminState(): AdminState {
  return state;
}

export function useAdminStore(): AdminState {
  return useSyncExternalStore(subscribe, getAdminState);
}

/** Restore the original seed data (demo/testing helper). */
export function resetAdminStore() {
  commit(seedState());
}

function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

// ---------------------------------------------------------------------------
// Derived views (computed, never stored — no duplicated state)
// ---------------------------------------------------------------------------

export function departmentRowsWithCounts(s: AdminState): DepartmentRow[] {
  return s.departments.map((d) => ({
    ...d,
    courses: s.subjects.filter((sub) => sub.departmentCode === d.code).length,
    teachers: s.users.filter((u) => u.role === Role.teacher && u.department === d.code).length,
    students: s.users.filter((u) => u.role === Role.student && u.department === d.code).length,
  }));
}

export function studentRows(s: AdminState): StudentRow[] {
  return s.users
    .filter((u) => u.role === Role.student)
    .map((u) => {
      const enrolment = s.enrolments.find((e) => e.studentId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department,
        course: enrolment?.course ?? "—",
        semester: enrolment?.semester ?? "—",
        section: enrolment?.section ?? "—",
      };
    });
}

export function teacherRows(s: AdminState): TeacherRow[] {
  return s.users
    .filter((u) => u.role === Role.teacher)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department,
      courses: s.teacherCourses[u.id] ?? "—",
    }));
}

// ---------------------------------------------------------------------------
// FR18 — academic structure CRUD. Each action returns an error string or null.
// ---------------------------------------------------------------------------

export function saveDepartment(name: string, code: string, originalCode?: string): string | null {
  const trimmedName = name.trim();
  const trimmedCode = code.trim().toUpperCase();
  if (!trimmedName || !trimmedCode) return "Code and name are required.";
  if (!/^[A-Z]{2,6}$/.test(trimmedCode)) return "Code must be 2–6 letters (e.g. CS).";
  const clash = state.departments.find(
    (d) => d.code === trimmedCode && d.code !== originalCode,
  );
  if (clash) return `Department code "${trimmedCode}" already exists.`;
  if (originalCode) {
    commit({
      ...state,
      departments: state.departments.map((d) =>
        d.code === originalCode ? { ...d, name: trimmedName } : d,
      ),
    });
  } else {
    commit({
      ...state,
      departments: [
        ...state.departments,
        { code: trimmedCode, name: trimmedName, courses: 0, teachers: 0, students: 0 },
      ],
    });
  }
  return null;
}

export function deleteDepartment(code: string): string | null {
  if (state.subjects.some((s) => s.departmentCode === code))
    return "Cannot delete: courses still belong to this department.";
  if (state.programs.some((p) => p.departmentCode === code))
    return "Cannot delete: programs still belong to this department.";
  if (state.users.some((u) => u.department === code))
    return "Cannot delete: users still belong to this department.";
  commit({ ...state, departments: state.departments.filter((d) => d.code !== code) });
  return null;
}

export function saveSubject(
  input: { code: string; title: string; departmentCode: string; creditHours: number },
  originalCode?: string,
): string | null {
  const code = input.code.trim().toUpperCase();
  const title = input.title.trim();
  if (!code || !title) return "Code and title are required.";
  if (!state.departments.some((d) => d.code === input.departmentCode))
    return "Select a valid department.";
  if (!Number.isInteger(input.creditHours) || input.creditHours < 1 || input.creditHours > 6)
    return "Credit hours must be a whole number between 1 and 6.";
  if (state.subjects.some((s) => s.code === code && s.code !== originalCode))
    return `Course code "${code}" already exists.`;
  if (originalCode) {
    commit({
      ...state,
      subjects: state.subjects.map((s) =>
        s.code === originalCode ? { ...s, title, departmentCode: input.departmentCode, creditHours: input.creditHours } : s,
      ),
    });
  } else {
    commit({
      ...state,
      subjects: [...state.subjects, { id: nextId(state.subjects), code, title, departmentCode: input.departmentCode, creditHours: input.creditHours }],
    });
  }
  return null;
}

export function deleteSubject(code: string): string | null {
  if (state.programCurriculums.some((c) => c.subjectCode === code))
    return "Cannot delete: course is used in a program curriculum.";
  if (state.sections.some((s) => s.subjectCode === code))
    return "Cannot delete: sections of this course exist.";
  commit({ ...state, subjects: state.subjects.filter((s) => s.code !== code) });
  return null;
}

export function saveTerm(
  input: { name: string; startDate: string; endDate: string; isActive: boolean },
  originalName?: string,
): string | null {
  const name = input.name.trim();
  if (!name) return "Term name is required.";
  if (!input.startDate || !input.endDate) return "Start and end dates are required.";
  if (input.startDate >= input.endDate) return "Start date must be before end date.";
  if (state.academicTerms.some((t) => t.name === name && t.name !== originalName))
    return `Term "${name}" already exists.`;
  if (originalName) {
    commit({
      ...state,
      academicTerms: state.academicTerms.map((t) =>
        t.name === originalName ? { ...t, ...input, name } : t,
      ),
    });
  } else {
    commit({
      ...state,
      academicTerms: [...state.academicTerms, { id: nextId(state.academicTerms), ...input, name }],
    });
  }
  return null;
}

export function deleteTerm(name: string): string | null {
  if (state.sections.some((s) => s.termName === name))
    return "Cannot delete: sections exist for this term.";
  commit({ ...state, academicTerms: state.academicTerms.filter((t) => t.name !== name) });
  return null;
}

export function saveSection(
  input: { subjectCode: string; termName: string; programCode: string; code: string; teacherName?: string },
  id?: number,
): string | null {
  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z]$/.test(code)) return "Section code must be a single letter (A–Z).";
  if (!state.subjects.some((s) => s.code === input.subjectCode)) return "Select a valid course.";
  if (!state.academicTerms.some((t) => t.name === input.termName)) return "Select a valid term.";
  if (!state.programs.some((p) => p.code === input.programCode)) return "Select a valid program.";
  const clash = state.sections.find(
    (s) =>
      s.id !== id &&
      s.subjectCode === input.subjectCode &&
      s.termName === input.termName &&
      s.programCode === input.programCode &&
      s.code === code,
  );
  if (clash) return `Section ${input.programCode} ${input.subjectCode}-${code} already exists for ${input.termName}.`;
  if (id != null) {
    commit({
      ...state,
      sections: state.sections.map((s) => (s.id === id ? { ...s, ...input, code } : s)),
    });
  } else {
    commit({
      ...state,
      sections: [...state.sections, { id: nextId(state.sections), ...input, code, enrolledCount: 0 }],
    });
  }
  return null;
}

export function deleteSection(id: number): string | null {
  commit({ ...state, sections: state.sections.filter((s) => s.id !== id) });
  return null;
}

export function saveCurriculumEntry(input: {
  programCode: string;
  subjectCode: string;
  semesterNumber: number;
}): string | null {
  const program = state.programs.find((p) => p.code === input.programCode);
  if (!program) return "Select a valid program.";
  if (!state.subjects.some((s) => s.code === input.subjectCode)) return "Select a valid course.";
  if (
    !Number.isInteger(input.semesterNumber) ||
    input.semesterNumber < 1 ||
    input.semesterNumber > program.totalSemesters
  )
    return `Semester must be between 1 and ${program.totalSemesters}.`;
  if (
    state.programCurriculums.some(
      (c) => c.programCode === input.programCode && c.subjectCode === input.subjectCode,
    )
  )
    return "This course is already in the program curriculum.";
  commit({
    ...state,
    programCurriculums: [
      ...state.programCurriculums,
      { id: nextId(state.programCurriculums), ...input },
    ],
  });
  return null;
}

export function deleteCurriculumEntry(id: number): string | null {
  commit({
    ...state,
    programCurriculums: state.programCurriculums.filter((c) => c.id !== id),
  });
  return null;
}

// ---------------------------------------------------------------------------
// FR19 — recurring class schedules with basic overlap validation (§13)
// ---------------------------------------------------------------------------

export function saveSlot(input: Omit<ScheduleSlot, "id">, id?: number): string | null {
  if (!input.subjectCode || !input.teacherName || !input.room.trim())
    return "Subject, teacher and room are all required.";
  if (!input.sectionCode) return "Select a class first.";
  const examConflict = state.examDatesheet.find(
    (e) =>
      e.classSection.toUpperCase() === input.sectionCode.toUpperCase() &&
      e.dayOfWeek === input.dayOfWeek &&
      ["midterm", "final"].includes(e.examType.toLowerCase()),
  );
  if (examConflict) {
    return `Cannot schedule a recurring class on ${input.dayOfWeek}: ${input.sectionCode} has ${examConflict.examType} (${examConflict.subjectCode}) on ${examConflict.examDate}.`;
  }

  const conflict = state.scheduleSlots.find(
    (s) =>
      s.id !== id &&
      s.dayOfWeek === input.dayOfWeek &&
      s.timeSlot === input.timeSlot &&
      (s.teacherName === input.teacherName ||
        s.room === input.room.trim() ||
        s.sectionCode === input.sectionCode),
  );
  if (conflict) {
    const reason =
      conflict.teacherName === input.teacherName
        ? `teacher ${conflict.teacherName} is already teaching`
        : conflict.room === input.room.trim()
          ? `room ${conflict.room} is already booked`
          : `class ${conflict.sectionCode} already has a slot`;
    return `Conflict on ${input.dayOfWeek} ${input.timeSlot}: ${reason} (${conflict.subjectCode}).`;
  }
  const slot = { ...input, room: input.room.trim() };
  if (id != null) {
    commit({
      ...state,
      scheduleSlots: state.scheduleSlots.map((s) => (s.id === id ? { ...slot, id } : s)),
    });
  } else {
    commit({
      ...state,
      scheduleSlots: [...state.scheduleSlots, { ...slot, id: nextId(state.scheduleSlots) }],
    });
  }
  return null;
}

export function deleteSlot(id: number): string | null {
  commit({ ...state, scheduleSlots: state.scheduleSlots.filter((s) => s.id !== id) });
  return null;
}

// ---------------------------------------------------------------------------
// FR17 — CSV ingest. Validate every row first; apply only if ALL rows pass
// (mock mirror of the backend's all-or-nothing transaction, I11).
// ---------------------------------------------------------------------------

export interface IngestError {
  row: number; // 1-based data row (header excluded)
  message: string;
}

const EXPECTED_HEADERS: Record<CsvDataType, string[]> = {
  users: ["name", "email", "role", "department_code"],
  enrolments: ["student_roll_no", "term_name", "class_section_code"],
  courses: ["subject_code", "title", "department_code", "credit_hours"],
  exam_datesheet: ["exam_type", "subject_code", "class_section", "exam_date", "start_time", "end_time"],
};

/** "role (student|teacher|admin)" → "role" */
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().split(" (")[0];
}

export function validateIngest(
  type: CsvDataType,
  headers: string[],
  rows: string[][],
): IngestError[] {
  const errors: IngestError[] = [];
  const expected = EXPECTED_HEADERS[type];
  const normalized = headers.map(normalizeHeader);
  const missing = expected.filter((h) => !normalized.includes(h));
  if (missing.length) {
    return [{ row: 0, message: `Missing column(s): ${missing.join(", ")}. Download the template for the expected format.` }];
  }
  if (rows.length === 0) return [{ row: 0, message: "The file has no data rows." }];

  const col = (row: string[], name: string) =>
    (row[normalized.indexOf(name)] ?? "").trim();

  const seenEmails = new Set<string>();
  const seenSubjectCodes = new Set<string>();
  const seenEnrolments = new Set<string>();
  const seenExams = new Set<string>();

  rows.forEach((row, idx) => {
    const rowNo = idx + 1;
    const fail = (message: string) => errors.push({ row: rowNo, message });

    if (type === "users") {
      const name = col(row, "name");
      const email = col(row, "email").toLowerCase();
      const role = col(row, "role").toLowerCase();
      const dept = col(row, "department_code").toUpperCase();
      if (!name) fail("Name is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(`Invalid email "${email || "(empty)"}".`);
      else if (state.users.some((u) => u.email.toLowerCase() === email) || seenEmails.has(email))
        fail(`Email "${email}" is already in use.`);
      seenEmails.add(email);
      if (!["student", "teacher", "admin"].includes(role))
        fail(`Role must be student, teacher or admin (got "${role || "(empty)"}").`);
      const deptOk = dept === "ALL" ? role === "admin" : state.departments.some((d) => d.code === dept);
      if (!deptOk) fail(`Unknown department "${dept || "(empty)"}".`);
    }

    if (type === "enrolments") {
      const roll = col(row, "student_roll_no");
      const term = col(row, "term_name");
      const sectionCode = col(row, "class_section_code").toUpperCase();
      const student = state.users.find(
        (u) => u.role === Role.student && String(u.id) === roll,
      );
      if (!student) fail(`No student with roll no "${roll || "(empty)"}" (roll no = user ID in mock data).`);
      if (!state.academicTerms.some((t) => t.name === term)) fail(`Unknown term "${term || "(empty)"}".`);
      const match = /^([A-Z]+)-(\d)([A-Z])$/.exec(sectionCode);
      if (!match) fail(`Class section "${sectionCode || "(empty)"}" must look like BSCS-5A.`);
      else {
        const [, programCode, sem, letter] = match;
        const program = state.programs.find((p) => p.code === programCode);
        if (!program) fail(`Unknown program "${programCode}".`);
        else if (Number(sem) < 1 || Number(sem) > program.totalSemesters)
          fail(`Semester ${sem} out of range for ${programCode}.`);
        else if (!state.sections.some((s) => s.programCode === programCode && s.code === letter))
          fail(`No section "${letter}" exists for ${programCode}.`);
      }
      const key = `${roll}|${term}|${sectionCode}`;
      if (
        seenEnrolments.has(key) ||
        state.enrolments.some(
          (e) =>
            String(e.studentId) === roll &&
            e.semester === term &&
            e.course.toUpperCase() === sectionCode,
        )
      )
        fail("Duplicate enrolment for this student, term and section.");
      seenEnrolments.add(key);
    }

    if (type === "courses") {
      const code = col(row, "subject_code").toUpperCase();
      const title = col(row, "title");
      const dept = col(row, "department_code").toUpperCase();
      const credits = Number(col(row, "credit_hours"));
      if (!code) fail("Subject code is required.");
      else if (state.subjects.some((s) => s.code === code) || seenSubjectCodes.has(code))
        fail(`Course code "${code}" already exists.`);
      seenSubjectCodes.add(code);
      if (!title) fail("Title is required.");
      if (!state.departments.some((d) => d.code === dept)) fail(`Unknown department "${dept || "(empty)"}".`);
      if (!Number.isInteger(credits) || credits < 1 || credits > 6)
        fail("Credit hours must be a whole number between 1 and 6.");
    }

    if (type === "exam_datesheet") {
      const examType = col(row, "exam_type").toLowerCase();
      const subjectCode = col(row, "subject_code").toUpperCase();
      const classSection = col(row, "class_section").toUpperCase();
      const examDate = col(row, "exam_date");
      const start = col(row, "start_time");
      const end = col(row, "end_time");
      if (!["midterm", "final"].includes(examType))
        fail(`Exam type must be midterm or final (got "${examType || "(empty)"}").`);
      if (!state.subjects.some((s) => s.code === subjectCode))
        fail(`Unknown course "${subjectCode || "(empty)"}".`);
      if (!classSection) fail("Class section is required.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate) || Number.isNaN(Date.parse(examDate)))
        fail(`Exam date "${examDate || "(empty)"}" must be YYYY-MM-DD.`);
      const timeOk = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
      if (!timeOk(start) || !timeOk(end)) fail("Times must be HH:MM (24h).");
      else if (start >= end) fail("Start time must be before end time.");
      const key = `${examType}|${subjectCode}|${classSection}|${examDate}`;
      if (
        seenExams.has(key) ||
        state.examDatesheet.some(
          (e) =>
            e.examType.toLowerCase() === examType &&
            e.subjectCode === subjectCode &&
            e.classSection.toUpperCase() === classSection &&
            e.examDate === examDate,
        )
      )
        fail("Duplicate exam entry for this course, section and date.");
      seenExams.add(key);
    }
  });

  return errors;
}

/** Re-validates, then applies everything in one commit — or nothing. */
export function applyIngest(
  type: CsvDataType,
  headers: string[],
  rows: string[][],
): IngestError[] {
  const errors = validateIngest(type, headers, rows);
  if (errors.length) return errors;

  const normalized = headers.map(normalizeHeader);
  const col = (row: string[], name: string) =>
    (row[normalized.indexOf(name)] ?? "").trim();

  if (type === "users") {
    const additions: UserRow[] = rows.map((row, idx) => ({
      id: nextId(state.users) + idx,
      name: col(row, "name"),
      email: col(row, "email").toLowerCase(),
      role: col(row, "role").toLowerCase() as Role,
      department: col(row, "department_code").toUpperCase(),
    }));
    commit({ ...state, users: [...state.users, ...additions] });
  }

  if (type === "enrolments") {
    const additions: EnrolmentRow[] = rows.map((row, idx) => {
      const sectionCode = col(row, "class_section_code").toUpperCase();
      return {
        id: nextId(state.enrolments) + idx,
        studentId: Number(col(row, "student_roll_no")),
        course: sectionCode,
        semester: col(row, "term_name"),
        section: sectionCode.slice(-1),
      };
    });
    commit({ ...state, enrolments: [...state.enrolments, ...additions] });
  }

  if (type === "courses") {
    const additions: SubjectRow[] = rows.map((row, idx) => ({
      id: nextId(state.subjects) + idx,
      code: col(row, "subject_code").toUpperCase(),
      title: col(row, "title"),
      departmentCode: col(row, "department_code").toUpperCase(),
      creditHours: Number(col(row, "credit_hours")),
    }));
    commit({ ...state, subjects: [...state.subjects, ...additions] });
  }

  if (type === "exam_datesheet") {
    const additions: ExamDatesheetEntry[] = rows.map((row, idx) => {
      const examDate = col(row, "exam_date");
      const subjectCode = col(row, "subject_code").toUpperCase();
      return {
        id: nextId(state.examDatesheet) + idx,
        examType: col(row, "exam_type").toLowerCase() === "midterm" ? "Midterm" : "Final",
        subjectCode,
        subjectTitle: state.subjects.find((s) => s.code === subjectCode)?.title ?? subjectCode,
        classSection: col(row, "class_section").toUpperCase(),
        examDate,
        dayOfWeek: new Date(`${examDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" }),
        timeSlot: `${col(row, "start_time")} - ${col(row, "end_time")}`,
      };
    });
    commit({ ...state, examDatesheet: [...state.examDatesheet, ...additions] });
  }

  return [];
}

/** Export current store data as CSV rows (real data, not empty templates). */
export function exportIngestData(
  type: CsvDataType,
): { headers: string[]; rows: (string | number)[][] } {
  const s = state;
  switch (type) {
    case "users":
      return {
        headers: EXPECTED_HEADERS.users,
        rows: s.users.map((u) => [u.name, u.email, u.role, u.department]),
      };
    case "enrolments":
      return {
        headers: EXPECTED_HEADERS.enrolments,
        rows: s.enrolments.map((e) => [e.studentId, e.semester, e.course]),
      };
    case "courses":
      return {
        headers: EXPECTED_HEADERS.courses,
        rows: s.subjects.map((sub) => [sub.code, sub.title, sub.departmentCode, sub.creditHours]),
      };
    case "exam_datesheet":
      return {
        headers: EXPECTED_HEADERS.exam_datesheet,
        rows: s.examDatesheet.map((e) => {
          const [start, end] = e.timeSlot.split(" - ");
          return [e.examType.toLowerCase(), e.subjectCode, e.classSection, e.examDate, start, end];
        }),
      };
  }
}
