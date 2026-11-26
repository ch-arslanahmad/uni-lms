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
}

export interface TeacherMaterial {
  id: string;
  sectionId: number;
  name: string;
  type: "file" | "link";
  size?: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  uploadedAt: string;
}

export interface TeacherAnnouncement {
  id: string;
  sectionId: number;
  title: string;
  body: string;
  date: string;
}

export interface TeacherEvent {
  id: string;
  sectionId: number;
  title: string;
  startAt: string;
  endAt: string;
  room?: string;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  type: "mcq" | "written";
  text: string;
  options?: string[];
  correctOption?: number;
  marks: number;
}

export type AssessmentKind = "quiz" | "midterm" | "final" | "project";
export type AssessmentMode = "online_mcq" | "online_attachment" | "paper";
export type AssessmentItemType = "assignment" | "assessment";
export type SubmissionMode = "upload" | "physical";
export type SubmissionType = "digital" | "physical" | null;
export type RequirementType = "written_work" | "attachment";

export interface AssignmentRequirement {
  type: RequirementType;
  isRequired: boolean;
}

export interface SubmissionFile {
  name: string;
  mimeType: string;
  size: string | number; // bytes or a preformatted string for mocks
  url: string;
}

export interface VivaRecord {
  examiner: string;
  conductedAt: string;
  marks: number;
  room?: string;
  comment?: string;
  publishedAt?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: number;
  submittedAt: string;
  viva?: VivaRecord; // project attempts only
}

export interface AssessmentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOption?: number;
  textAnswer?: string;
  marksAwarded?: number;
}

export interface TeacherAssessment {
  id: string;
  sectionId: number;
  itemType: AssessmentItemType;
  kind?: AssessmentKind; // assessment items only
  mode?: AssessmentMode; // assessment items only
  title: string;
  instructions: string;
  category: string;
  maxMarks: number;
  openAt: string;
  dueAt: string;
  closeAt?: string;
  submissionMode: SubmissionMode;
  requirements: AssignmentRequirement[]; // FR8 / I7: at least one, at least one required
  physicalRoom?: string; // only when physical submission is required
  documentName?: string; // required supporting document label
  document?: SubmissionFile; // teacher-uploaded reference for grading
  required?: boolean; // mandatory system/term requirement (mid/final)
  published: boolean;
}

export function isMcqAssessment(item: Pick<TeacherAssessment, "mode">): boolean {
  return item.mode === "online_mcq";
}

export function isPaperAssessment(item: Pick<TeacherAssessment, "mode">): boolean {
  return item.mode === "paper";
}

// Viva is mandatory only for a physical assignment submission or a project attempt.
export function requiresViva(item: Pick<TeacherAssessment, "itemType" | "kind" | "submissionMode">): boolean {
  return (item.itemType === "assessment" && item.kind === "project")
    || (item.itemType === "assignment" && item.submissionMode === "physical");
}

export interface TeacherSubmission {
  id: string;
  assessmentId: string;
  studentId: number;
  submittedAt?: string;
  status: "not-submitted" | "submitted" | "graded" | "locked";
  marks?: number;
  feedback?: string;
  type?: SubmissionType;
  file?: SubmissionFile;
  fileName?: string;
  updatedBy?: string;
  updatedAt?: string;
  extensionDueAt?: string;
  extensionReason?: string;
  viva?: VivaRecord; // physical assignment submissions only
}

export interface TeacherQuestion {
  id: string;
  sectionId: number;
  assessmentId?: string;
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
  count: number;
}

export interface SectionResultState {
  sectionId: number;
  published: boolean;
  frozenWeights: boolean;
}

// Same teacher, same subject, multiple sections (typical semester assignment).
const assignedSectionRows = sections.filter((s) => s.teacherName === "Carol" && s.subjectCode === "DBMS");

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
    schedule: ["Mon/Wed 09:00-10:30", "Tue/Thu 11:00-12:30"][idx % 2],
  };
});

export const teacherMaterials: TeacherMaterial[] = [
  { id: "tm1", sectionId: 4, name: "Week 1 - ER Modeling.pdf", type: "file", size: "1.4 MB", uploadedAt: "2026-09-02" },
  { id: "tm2", sectionId: 4, name: "Normalization worksheet", type: "link", url: "https://example.edu/norm", uploadedAt: "2026-09-10" },
  { id: "tm3", sectionId: 5, name: "Lab 01 - SQL basics.pdf", type: "file", size: "900 KB", uploadedAt: "2026-09-03" },
];

export const teacherAnnouncements: TeacherAnnouncement[] = [
  { id: "ta1", sectionId: 4, title: "Midterm syllabus", body: "Midterm covers ER modeling, relational model, and normalization up to 3NF.", date: "2026-11-10" },
  { id: "ta2", sectionId: 5, title: "Section B lab reminder", body: "Bring your SQL lab sheet for Wednesday's session.", date: "2026-11-18" },
];

export const teacherEvents: TeacherEvent[] = [
];

export const assessmentQuestions: AssessmentQuestion[] = [
  { id: "aq1", assessmentId: "ta-a2", type: "mcq", text: "Which SQL clause filters rows?", options: ["ORDER BY", "WHERE", "GROUP BY", "HAVING"], correctOption: 1, marks: 5 },
  { id: "aq2", assessmentId: "ta-a2", type: "mcq", text: "Which join returns only matching rows?", options: ["LEFT JOIN", "FULL JOIN", "INNER JOIN", "CROSS JOIN"], correctOption: 2, marks: 5 },
  { id: "aq3", assessmentId: "ta-a4", type: "written", text: "Explain 3NF with an example.", marks: 20 },
  { id: "aq4", assessmentId: "ta-a7", type: "mcq", text: "Which SQL keyword limits returned rows?", options: ["ORDER BY", "LIMIT", "GROUP BY", "WHERE"], correctOption: 1, marks: 5 },
  { id: "aq5", assessmentId: "ta-a7", type: "mcq", text: "Which join keeps every row from the left table?", options: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "NATURAL JOIN"], correctOption: 1, marks: 5 },
  { id: "aq6", assessmentId: "ta-a3", type: "written", text: "Submit the ERD with normalized relations.", marks: 25 },
];

export const MOCK_ASSESSMENT_FILE_URL = "/mock-assessment-brief.svg";

function referenceFile(name: string): SubmissionFile {
  return { name, mimeType: "image/svg+xml", size: "3 KB", url: MOCK_ASSESSMENT_FILE_URL };
}

export function makeAssessmentReference(documentName: string): SubmissionFile {
  return referenceFile(documentName.replace(/\.[^.]+$/, "") + "-reference.svg");
}

const seededAssessments: Omit<TeacherAssessment, "requirements">[] = [
  { id: "ta-a1", sectionId: 4, itemType: "assignment", title: "Assignment 1", instructions: "Design an ERD for Uni-LMS.", category: "Assignments", maxMarks: 100, openAt: "2026-09-01", dueAt: "2026-09-08", closeAt: "2026-09-15", submissionMode: "upload", documentName: "assignment1-erd.pdf", document: referenceFile("assignment1-erd-reference.svg"), published: true },
  { id: "ta-a2", sectionId: 4, itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz 1", instructions: "MCQ quiz on SELECT/JOIN.", category: "Quizzes", maxMarks: 10, openAt: "2026-09-20T09:00", dueAt: "2026-09-20T10:00", closeAt: "2026-09-20T10:30", submissionMode: "upload", published: true },
  { id: "ta-a3", sectionId: 4, itemType: "assessment", kind: "project", mode: "online_attachment", title: "Final Project", instructions: "Submit proposal and ERD draft.", category: "Project", maxMarks: 30, openAt: "2026-10-01", dueAt: "2026-11-25", closeAt: "2026-12-01", submissionMode: "upload", documentName: "project-m1-brief.pdf", document: referenceFile("project-m1-brief-reference.svg"), published: true },
  { id: "ta-a4", sectionId: 4, itemType: "assessment", kind: "midterm", mode: "paper", title: "Midterm", instructions: "Paper-based midterm. Covers ER modeling, relational model, and normalization up to 3NF.", category: "Midterm", maxMarks: 100, openAt: "2026-11-12", dueAt: "2026-11-12", submissionMode: "physical", physicalRoom: "Exam Hall A", required: true, documentName: "midterm-question-paper.pdf", document: referenceFile("midterm-question-paper-reference.svg"), published: true },
  { id: "ta-a5", sectionId: 4, itemType: "assessment", kind: "final", mode: "paper", title: "Final", instructions: "Comprehensive final exam.", category: "Final", maxMarks: 100, openAt: "2027-01-18", dueAt: "2027-01-18", submissionMode: "physical", physicalRoom: "Exam Hall A", required: true, documentName: "final-question-paper.pdf", document: referenceFile("final-question-paper-reference.svg"), published: true },
  { id: "ta-a6", sectionId: 4, itemType: "assignment", title: "Assignment 2", instructions: "Physical submission with a mandatory viva.", category: "Assignments", maxMarks: 100, openAt: "2026-11-01", dueAt: "2026-11-08", closeAt: "2026-11-15", submissionMode: "physical", physicalRoom: "Lab 2", documentName: "assignment2-brief.pdf", document: referenceFile("assignment2-brief-reference.svg"), published: true },
  { id: "ta-a7", sectionId: 5, itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz 1: SQL Basics", instructions: "MCQ quiz on SELECT/JOIN.", category: "Quizzes", maxMarks: 10, openAt: "2026-09-20T09:00", dueAt: "2026-09-20T10:00", closeAt: "2026-09-20T10:30", submissionMode: "upload", published: true },
  { id: "ta-a8", sectionId: 5, itemType: "assessment", kind: "midterm", mode: "paper", title: "Midterm Exam", instructions: "Paper-based midterm. Covers ER modeling, relational model, and normalization up to 3NF.", category: "Midterm", maxMarks: 100, openAt: "2026-11-12", dueAt: "2026-11-12", submissionMode: "physical", physicalRoom: "Exam Hall B", required: true, documentName: "midterm-question-paper.pdf", document: referenceFile("midterm-question-paper-reference.svg"), published: true },
  { id: "ta-a9", sectionId: 5, itemType: "assessment", kind: "final", mode: "paper", title: "Final Exam", instructions: "Comprehensive final exam.", category: "Final", maxMarks: 100, openAt: "2027-01-18", dueAt: "2027-01-18", submissionMode: "physical", physicalRoom: "Exam Hall B", required: true, documentName: "final-question-paper.pdf", document: referenceFile("final-question-paper-reference.svg"), published: true },
];

function defaultRequirements(act: Omit<TeacherAssessment, "requirements">): AssignmentRequirement[] {
  if (act.category === "Project") return [
    { type: "attachment", isRequired: true },
    { type: "written_work", isRequired: true },
  ];
  if (act.submissionMode === "upload") return [{ type: "attachment", isRequired: true }];
  return [{ type: "written_work", isRequired: true }];
}

export const teacherAssessments: TeacherAssessment[] = seededAssessments.map((act) => ({
  ...act,
  requirements: defaultRequirements(act),
}));

const MOCK_SUBMISSION_FILE_URL = "/mock-submission.svg";

function seedSubmissions(): TeacherSubmission[] {
  const out: TeacherSubmission[] = [];
  for (const act of teacherAssessments) {
    const roster = getSectionStudents(act.sectionId).slice(0, 6);
    roster.forEach((stu, i) => {
      const inApp = isMcqAssessment(act);
      if (inApp || isPaperAssessment(act)) {
        out.push({
          id: `sub-${act.id}-${stu.id}`,
          assessmentId: act.id,
          studentId: stu.id,
          submittedAt: i < 4 ? `${act.dueAt} 10:0${i}` : undefined,
          status: i < 3 ? "graded" : i < 4 ? "submitted" : "not-submitted",
          // Paper assessments have no file; in-app MCQs are scored from attempts.
          type: isPaperAssessment(act) ? "physical" : null,
          marks: i < 3 ? Math.max(0, act.maxMarks - i * 3) : undefined,
          feedback: i < 3 ? "Good work." : undefined,
          updatedBy: i < 3 ? "Carol" : undefined,
          updatedAt: i < 3 ? `${act.dueAt} 18:00` : undefined,
        });
      } else {
        const fileName = `${stu.name.split(" ")[0].toLowerCase()}-${act.id}.svg`;
        const marks = i < 2 || i === 4 ? Math.max(0, act.maxMarks - i * 5) : undefined;
        const viva = act.itemType === "assignment" && requiresViva(act) && marks != null
          ? {
              examiner: "Carol",
              conductedAt: `${act.dueAt} 16:00`,
              marks: Math.min(5, act.maxMarks - marks),
              room: act.physicalRoom,
            }
          : undefined;
        out.push({
          id: `sub-${act.id}-${stu.id}`,
          assessmentId: act.id,
          studentId: stu.id,
          submittedAt: i < 5 ? `${act.dueAt} 09:1${i}` : undefined,
          status: i < 2 ? "locked" : i < 4 ? "submitted" : i === 4 ? "graded" : "not-submitted",
          type: act.submissionMode === "physical" ? "physical" : "digital",
          file: act.submissionMode === "upload" && i < 5 ? { name: fileName, mimeType: "image/svg+xml", size: "2 KB", url: MOCK_SUBMISSION_FILE_URL } : undefined,
          marks,
          feedback: i < 2 || i === 4 ? "Reviewed." : undefined,
          fileName: act.submissionMode === "upload" && i < 5 ? fileName : undefined,
          updatedBy: i < 2 || i === 4 ? "Carol" : undefined,
          updatedAt: i < 2 || i === 4 ? `${act.dueAt} 17:30` : undefined,
          viva,
        });
      }
    });
  }
  return out;
}

export const teacherSubmissions: TeacherSubmission[] = seedSubmissions();

function seedAssessmentAttempts(): AssessmentAttempt[] {
  const out: AssessmentAttempt[] = [];
  for (const act of teacherAssessments.filter((item) => isMcqAssessment(item) || item.kind === "project")) {
    getSectionStudents(act.sectionId).forEach((stu, i) => {
      out.push({
        id: `att-${act.id}-${stu.id}`,
        assessmentId: act.id,
        studentId: stu.id,
        submittedAt: `${act.dueAt} 10:${String(i).padStart(2, "0")}`,
        ...(act.kind === "project" ? {
          viva: {
            examiner: "Carol",
            conductedAt: `${act.dueAt} 16:00`,
            marks: Math.min(5, act.maxMarks),
          },
        } : {}),
      });
    });
  }
  return out;
}

export const assessmentAttempts: AssessmentAttempt[] = seedAssessmentAttempts();

function seedAssessmentAnswers(): AssessmentAnswer[] {
  return assessmentAttempts.flatMap((attempt) =>
    assessmentQuestions
      .filter((question) => question.assessmentId === attempt.assessmentId)
      .map((question, qi) => {
        const attemptIndex = Number(attempt.id.slice(-1));
        const correct = (attemptIndex + qi) % 3 !== 0;
        const optionCount = Math.max(1, question.options?.length ?? 1);
        const selectedOption = correct
          ? question.correctOption
          : ((question.correctOption ?? 0) + 1) % optionCount;
        if (question.type === "written") {
          const projectMarks = question.assessmentId === "ta-a3"
            ? Math.max(0, question.marks - (Number(attempt.id.slice(-1)) % 3) * 5)
            : undefined;
          return {
            id: `ans-${attempt.id}-${question.id}`,
            attemptId: attempt.id,
            questionId: question.id,
            textAnswer: "3NF is achieved when a relation is in 2NF and has no transitive dependency of non-key attributes on the primary key.",
            ...(projectMarks != null ? { marksAwarded: projectMarks } : {}),
          };
        }
        return {
          id: `ans-${attempt.id}-${question.id}`,
          attemptId: attempt.id,
          questionId: question.id,
          selectedOption,
          marksAwarded: correct ? question.marks : 0,
        };
      }),
  );
}

export const assessmentAnswers: AssessmentAnswer[] = seedAssessmentAnswers();

export function getAssessmentAttempt(assessmentId: string, studentId: number): AssessmentAttempt | undefined {
  return assessmentAttempts.find((a) => a.assessmentId === assessmentId && a.studentId === studentId);
}

export function getAssessmentAnswers(attemptId: string): AssessmentAnswer[] {
  return assessmentAnswers.filter((a) => a.attemptId === attemptId);
}

export const teacherQuestions: TeacherQuestion[] = [
  { id: "tq1", sectionId: 4, assessmentId: "ta-a3", studentId: 7, question: "Can we submit proposal as PDF and slides separately?", askedAt: "2026-11-20 14:10", status: "pending" },
  { id: "tq2", sectionId: 4, studentId: 9, question: "Will normalization beyond 3NF be in midterm?", askedAt: "2026-11-19 10:00", answer: "Midterm is up to 3NF; BCNF is good to know but not required.", answeredAt: "2026-11-19 12:30", status: "answered" },
  { id: "tq3", sectionId: 5, studentId: 16, question: "Is Quiz 1 the same format for section B?", askedAt: "2026-11-21 09:20", status: "pending" },
];

export const gradeCategories: GradeCategory[] = [
  { id: "gc1", sectionId: 4, name: "Assignments", weight: 20, count: 2 },
  { id: "gc2", sectionId: 4, name: "Quizzes", weight: 10, count: 2 },
  { id: "gc3", sectionId: 4, name: "Project", weight: 20, count: 1 },
  { id: "gc4", sectionId: 4, name: "Midterm", weight: 20, count: 1 },
  { id: "gc5", sectionId: 4, name: "Final", weight: 30, count: 1 },
  { id: "gc6", sectionId: 5, name: "Assignments", weight: 20, count: 2 },
  { id: "gc7", sectionId: 5, name: "Quizzes", weight: 10, count: 2 },
  { id: "gc8", sectionId: 5, name: "Project", weight: 20, count: 1 },
  { id: "gc9", sectionId: 5, name: "Midterm", weight: 20, count: 1 },
  { id: "gc10", sectionId: 5, name: "Final", weight: 30, count: 1 },
];

export const sectionResultStates: SectionResultState[] = teacherSections.map((s) => ({ sectionId: s.id, published: false, frozenWeights: false }));

export function getTeacherSection(id: number | string | undefined): TeacherSection | undefined {
  const n = Number(id);
  return teacherSections.find((s) => s.id === n || s.offeringId === id);
}

export function getSectionStudents(sectionId: number) {
  // Mock: give each section a distinct stable slice; admin owns real enrolments.
  // Step by 5 (coprime with the 18 seeded students) so section 4 and 5 rosters never collide.
  const start = (sectionId * 5) % students.length;
  return Array.from({ length: Math.min(6, students.length) }, (_, i) => students[(start + i) % students.length]);
}

export function getSectionAssessments(sectionId: number) {
  return teacherAssessments.filter((a) => a.sectionId === sectionId);
}

// MCQ marks are derived from the question key, not trusted from stored answers.
export function mcqMarksFor(question: AssessmentQuestion, answer?: AssessmentAnswer): number {
  if (question.type !== "mcq" || question.correctOption == null || answer?.selectedOption == null) return 0;
  return answer.selectedOption === question.correctOption ? question.marks : 0;
}

export function getAssessmentSubmissions(assessmentId: string) {
  return teacherSubmissions.filter((s) => s.assessmentId === assessmentId);
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
