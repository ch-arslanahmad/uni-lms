// Teacher mock data for Phase 1. Pages read from here, never from a backend.
// Scoped to the current teacher's assigned sections (admin-owned structure, read-only here).

import { sections, students, teachers as teacherRows, subjects, type SectionRow } from "../models";

export const currentTeacherId = 3; // Carol

export interface TeacherSection {
  id: number;
  offeringId: string; // stable route id
  section: SectionRow;
  subjectTitle: string;
  creditHours: number;
  term: string;
  schedule: string;
  room: string;
}

export interface TeacherMaterial {
  id: string;
  sectionId: number;
  name: string;
  type: "file" | "link";
  size?: string;
  url?: string;
  uploadedAt: string;
}

export interface TeacherAnnouncement {
  id: string;
  sectionId: number;
  title: string;
  body: string;
  date: string;
}

export type ActivityKind = "assignment" | "quiz" | "project" | "exam";
export type SubmissionMode = "upload" | "physical";

export interface TeacherActivity {
  id: string;
  sectionId: number;
  kind: ActivityKind;
  title: string;
  instructions: string;
  category: string;
  maxMarks: number;
  openAt: string;
  dueAt: string;
  closeAt?: string;
  submissionModes: SubmissionMode[];
  hasMcq?: boolean;
  reviewPolicy?: "immediate" | "after_close" | "after_graded" | "never";
  published: boolean;
}

export interface TeacherSubmission {
  id: string;
  activityId: string;
  studentId: number;
  submittedAt?: string;
  status: "not-submitted" | "submitted" | "graded" | "locked";
  marks?: number;
  feedback?: string;
  fileName?: string;
  updatedBy?: string;
  updatedAt?: string;
  extensionDueAt?: string;
  extensionReason?: string;
}

export interface TeacherQuestion {
  id: string;
  sectionId: number;
  activityId?: string;
  studentId: number;
  question: string;
  askedAt: string;
  answer?: string;
  answeredAt?: string;
  status: "pending" | "answered" | "resolved";
}

export interface GradeCategory {
  id: string;
  sectionId: number;
  name: string;
  weight: number;
}

export interface SectionResultState {
  sectionId: number;
  published: boolean;
  frozenWeights: boolean;
}

const assignedSectionRows = sections.filter((s) => s.teacherName === "Carol");

function makeOfferingId(s: SectionRow): string {
  return `${s.subjectCode}-${s.termName.replace(" ", "")}-${s.programCode}-${s.code}`.replace(/[^A-Za-z0-9-]/g, "");
}

export const teacherSections: TeacherSection[] = assignedSectionRows.map((s, idx) => {
  const subject = subjects.find((sub) => sub.code === s.subjectCode);
  return {
    id: s.id,
    offeringId: makeOfferingId(s),
    section: s,
    subjectTitle: subject?.title ?? s.subjectCode,
    creditHours: subject?.creditHours ?? 3,
    term: s.termName,
    schedule: ["Mon/Wed 09:00-10:30", "Tue/Thu 11:00-12:30", "Mon 14:00-15:30", "Wed 08:00-09:30"][idx % 4],
    room: ["CS-Lab-1", "Room-204", "Room-205", "CS-Lab-3"][idx % 4],
  };
});

export const teacherMaterials: TeacherMaterial[] = [
  { id: "tm1", sectionId: 4, name: "Week 1 - ER Modeling.pdf", type: "file", size: "1.4 MB", uploadedAt: "2026-09-02" },
  { id: "tm2", sectionId: 4, name: "Normalization worksheet", type: "link", url: "https://example.edu/norm", uploadedAt: "2026-09-10" },
  { id: "tm3", sectionId: 5, name: "Lab 01 - SQL basics.pdf", type: "file", size: "900 KB", uploadedAt: "2026-09-03" },
];

export const teacherAnnouncements: TeacherAnnouncement[] = [
  { id: "ta1", sectionId: 4, title: "Midterm syllabus", body: "Midterm covers ER modeling, relational model, and normalization up to 3NF.", date: "2026-11-10" },
  { id: "ta2", sectionId: 6, title: "Lab timing update", body: "This week's OS lab starts at 2:00 PM.", date: "2026-11-18" },
];

export const teacherActivities: TeacherActivity[] = [
  { id: "ta-a1", sectionId: 4, kind: "assignment", title: "Assignment 1: ERD", instructions: "Design an ERD for Uni-LMS.", category: "Assignments", maxMarks: 100, openAt: "2026-09-01", dueAt: "2026-09-08", closeAt: "2026-09-15", submissionModes: ["upload"], published: true },
  { id: "ta-a2", sectionId: 4, kind: "quiz", title: "Quiz 1: SQL Basics", instructions: "MCQ quiz on SELECT/JOIN.", category: "Quizzes", maxMarks: 10, openAt: "2026-09-20", dueAt: "2026-09-20", submissionModes: [], hasMcq: true, reviewPolicy: "after_close", published: true },
  { id: "ta-a3", sectionId: 4, kind: "project", title: "Project Milestone 1", instructions: "Submit proposal and ERD draft.", category: "Project", maxMarks: 30, openAt: "2026-10-01", dueAt: "2026-11-25", closeAt: "2026-12-01", submissionModes: ["upload", "physical"], published: true },
  { id: "ta-a4", sectionId: 4, kind: "exam", title: "Midterm Exam", instructions: "Paper-based midterm.", category: "Midterm", maxMarks: 100, openAt: "2026-11-12", dueAt: "2026-11-12", submissionModes: ["physical"], published: true },
  { id: "ta-a5", sectionId: 5, kind: "assignment", title: "Lab Assignment: Joins", instructions: "Write SQL joins for provided schema.", category: "Assignments", maxMarks: 50, openAt: "2026-11-05", dueAt: "2026-11-28", submissionModes: ["upload"], published: true },
  { id: "ta-a6", sectionId: 6, kind: "quiz", title: "Quiz: Processes", instructions: "Short quiz on process states.", category: "Quizzes", maxMarks: 10, openAt: "2026-11-26", dueAt: "2026-11-26", submissionModes: [], hasMcq: true, reviewPolicy: "after_graded", published: true },
];

function seedSubmissions(): TeacherSubmission[] {
  const out: TeacherSubmission[] = [];
  for (const act of teacherActivities) {
    const roster = getSectionStudents(act.sectionId).slice(0, 6);
    roster.forEach((stu, i) => {
      if (act.kind === "quiz" || act.kind === "exam") {
        out.push({
          id: `sub-${act.id}-${stu.id}`,
          activityId: act.id,
          studentId: stu.id,
          submittedAt: i < 4 ? `${act.dueAt} 10:0${i}` : undefined,
          status: i < 3 ? "graded" : i < 4 ? "submitted" : "not-submitted",
          marks: i < 3 ? Math.max(0, act.maxMarks - i * 3) : undefined,
          feedback: i < 3 ? "Good work." : undefined,
          updatedBy: i < 3 ? "Carol" : undefined,
          updatedAt: i < 3 ? `${act.dueAt} 18:00` : undefined,
        });
      } else {
        out.push({
          id: `sub-${act.id}-${stu.id}`,
          activityId: act.id,
          studentId: stu.id,
          submittedAt: i < 5 ? `${act.dueAt} 09:1${i}` : undefined,
          status: i < 2 ? "locked" : i < 4 ? "submitted" : i === 4 ? "graded" : "not-submitted",
          marks: i < 2 || i === 4 ? Math.max(0, act.maxMarks - i * 5) : undefined,
          feedback: i < 2 || i === 4 ? "Reviewed." : undefined,
          fileName: i < 5 ? `${stu.name.split(" ")[0].toLowerCase()}-${act.id}.pdf` : undefined,
          updatedBy: i < 2 || i === 4 ? "Carol" : undefined,
          updatedAt: i < 2 || i === 4 ? `${act.dueAt} 17:30` : undefined,
        });
      }
    });
  }
  return out;
}

export const teacherSubmissions: TeacherSubmission[] = seedSubmissions();

export const teacherQuestions: TeacherQuestion[] = [
  { id: "tq1", sectionId: 4, activityId: "ta-a3", studentId: 7, question: "Can we submit proposal as PDF and slides separately?", askedAt: "2026-11-20 14:10", status: "pending" },
  { id: "tq2", sectionId: 4, studentId: 9, question: "Will normalization beyond 3NF be in midterm?", askedAt: "2026-11-19 10:00", answer: "Midterm is up to 3NF; BCNF is good to know but not required.", answeredAt: "2026-11-19 12:30", status: "answered" },
  { id: "tq3", sectionId: 6, studentId: 16, question: "Is Quiz: Processes open book?", askedAt: "2026-11-21 09:20", status: "pending" },
];

export const gradeCategories: GradeCategory[] = [
  { id: "gc1", sectionId: 4, name: "Assignments", weight: 20 },
  { id: "gc2", sectionId: 4, name: "Quizzes", weight: 10 },
  { id: "gc3", sectionId: 4, name: "Project", weight: 20 },
  { id: "gc4", sectionId: 4, name: "Midterm", weight: 20 },
  { id: "gc5", sectionId: 4, name: "Final", weight: 30 },
  { id: "gc6", sectionId: 5, name: "Assignments", weight: 30 },
  { id: "gc7", sectionId: 5, name: "Quizzes", weight: 20 },
  { id: "gc8", sectionId: 5, name: "Midterm", weight: 20 },
  { id: "gc9", sectionId: 5, name: "Final", weight: 30 },
  { id: "gc10", sectionId: 6, name: "Assignments", weight: 30 },
  { id: "gc11", sectionId: 6, name: "Quizzes", weight: 20 },
  { id: "gc12", sectionId: 6, name: "Midterm", weight: 20 },
  { id: "gc13", sectionId: 6, name: "Final", weight: 30 },
];

export const sectionResultStates: SectionResultState[] = teacherSections.map((s) => ({ sectionId: s.id, published: false, frozenWeights: false }));

export function getTeacherSection(id: number | string | undefined): TeacherSection | undefined {
  const n = Number(id);
  return teacherSections.find((s) => s.id === n || s.offeringId === id);
}

export function getSectionStudents(sectionId: number) {
  // Mock: pick a stable subset of students by section id; admin owns real enrolments.
  const start = (sectionId * 3) % Math.max(1, students.length - 6);
  return students.slice(start, start + 6);
}

export function getSectionActivities(sectionId: number) {
  return teacherActivities.filter((a) => a.sectionId === sectionId);
}

export function getActivitySubmissions(activityId: string) {
  return teacherSubmissions.filter((s) => s.activityId === activityId);
}

export function getSectionQuestions(sectionId: number) {
  return teacherQuestions.filter((q) => q.sectionId === sectionId);
}

export function getPendingGradingCount() {
  return teacherSubmissions.filter((s) => s.status === "submitted").length;
}

export function getUnansweredQuestionsCount() {
  return teacherQuestions.filter((q) => q.status === "pending").length;
}

export function getTeacherProfile() {
  return teacherRows.find((t) => t.id === currentTeacherId);
}
