// Student mock data for Phase 1. Pages read from here, never from a backend.
// Kept compact: derived views are computed, not duplicated.

export type SubmissionMode = "upload" | "physical";
export type ActivityItemType = "assignment" | "assessment";
export type ActivityKind = "quiz" | "midterm" | "final" | "project";
export type ActivityMode = "online_mcq" | "online_attachment" | "paper";
export type QuestionStatus = "open" | "resolved";
export type QuestionVisibility = "public" | "private";

export interface PhysicalSubmission {
  timeWindow: string;
  room: string;
}

export interface Activity {
  id: string;
  itemType: ActivityItemType;
  kind?: ActivityKind; // assessment items only
  mode?: ActivityMode; // assessment items only
  title: string;
  opened: string;
  due: string;
  closed?: string;
  submitted: boolean;
  graded?: boolean;
  score?: number;
  max: number;
  submissionMode: SubmissionMode;
  physical?: PhysicalSubmission;
}

// Viva is required only for a physical assignment submission or a project attempt.
export function requiresViva(activity: Activity): boolean {
  return (activity.itemType === "assessment" && activity.kind === "project")
    || (activity.itemType === "assignment" && activity.submissionMode === "physical");
}

// Online MCQ attempts are answered in the app, not through a file upload block.
export function requiresStudentUpload(activity: Activity): boolean {
  return (activity.itemType === "assignment" && activity.submissionMode === "upload")
    || activity.mode === "online_attachment";
}

export function requiresPhysicalActivity(activity: Activity): boolean {
  return activity.submissionMode === "physical";
}

export interface Week {
  range: string;
  current?: boolean;
  activities: Activity[];
}

export type CourseStatus = "in-progress" | "past" | "future";

export interface CourseOffering {
  offeringId: string;
  code: string;
  section: string;
  sectionId: number;
  title: string;
  department: string;
  instructorId: number;
  term: string;
  status: CourseStatus;
  objective: string;
  timetable: string;
  materials: { name: string; size: string }[];
  announcements: { title: string; date: string; body: string }[];
  weeks: Week[];
}

export interface GradeRow {
  offeringId: string;
  sectionId: number;
  course: string;
  title: string;
  kind: string;
  raw: number;
  max: number;
  weight: number; // percent
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  answer: number;
  points: number;
  // Written questions are answered with free text and graded by the teacher.
  type?: "mcq" | "written";
}

export interface QuizAttempt {
  started: string;
  completed: string;
  duration: string;
  grade: string;
  // Seeded answer sheets keep review marks consistent with the stored score.
  answers?: Record<string, number | string>;
}

export interface Quiz {
  id: string;
  offeringId: string;
  sectionId: number;
  // Links a seeded student quiz to a teacher-created assessment so its
  // questions come from the teacher workspace snapshot in Phase 1.
  sourceAssessmentId?: string;
  title: string;
  opened: string;
  closed: string;
  timeLimit: string;
  grade: number;
  max: number;
  questions: QuizQuestion[];
  // One attempt per student per assessment (§14.2).
  attempt?: QuizAttempt;
}

export interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  department: string;
  location: string;
  lastAccess: string;
  courseIds: string[];
}

const WEEK_RANGES = [
  "25 August - 31 August",
  "1 September - 7 September",
  "8 September - 14 September",
  "15 September - 21 September",
  "22 September - 28 September",
  "29 September - 5 October",
  "6 October - 12 October",
  "13 October - 19 October",
  "20 October - 26 October",
  "27 October - 2 November",
  "3 November - 9 November",
  "10 November - 16 November",
  "17 November - 23 November",
];

function weeks(activities: Partial<Record<number, Activity[]>>): Week[] {
  return WEEK_RANGES.map((range, index) => ({
    range,
    current: index === 11,
    activities: activities[index] ?? [],
  }));
}

export const offerings: CourseOffering[] = [
  {
    offeringId: "CS301-5-A",
    code: "CS301",
    section: "BSIET-5-A",
    sectionId: 4,
    title: "Advanced Front-End Development",
    department: "CS",
    instructorId: 3,
    term: "Fall 2026",
    status: "in-progress",
    objective: "Build accessible, production-grade web interfaces with React and TypeScript.",
    timetable: "Monday 09:00-10:30 · Wednesday 11:00-12:30 · Lab Friday 14:00-16:00",
    materials: [
      { name: "Lecture 01 - React fundamentals.pdf", size: "1.2 MB" },
      { name: "Week 04 - TypeScript deep dive.pdf", size: "860 KB" },
      { name: "Course outline.pdf", size: "220 KB" },
    ],
    announcements: [
      { title: "Midterm schedule", date: "2026-11-10", body: "Midterm exam will be held during week 12. Regular class timetable remains unchanged." },
      { title: "Guest lecture", date: "2026-11-03", body: "Industry guest lecture on design systems, Friday 14:00 in Lab 2." },
    ],
    weeks: weeks({
      1: [{ id: "a1", itemType: "assignment", title: "Assignment 1: Component basics", opened: "2026-09-01", due: "2026-09-07", submitted: true, graded: true, score: 88, max: 100, submissionMode: "upload" }],
      3: [{ id: "q1", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz #1", opened: "2026-09-15", due: "2026-09-21", submitted: true, graded: true, score: 10, max: 10, submissionMode: "upload" }],
      5: [{ id: "p1", itemType: "assessment", kind: "project", mode: "online_attachment", title: "Project Milestone 1: Proposal", opened: "2026-09-29", due: "2026-10-05", submitted: true, graded: true, score: 18, max: 20, submissionMode: "upload" }],
      7: [{ id: "p2", itemType: "assessment", kind: "project", mode: "online_attachment", title: "Project Viva", opened: "2026-10-13", due: "2026-10-19", submitted: false, max: 30, submissionMode: "upload", physical: { timeWindow: "10:00 AM - 1:00 PM", room: "Room C-304" } }],
      9: [{ id: "q3", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz #3", opened: "2026-10-27", due: "2026-10-27", submitted: false, max: 10, submissionMode: "upload" }],
      10: [
        { id: "a4", itemType: "assignment", title: "Assignment 4: State management", opened: "2026-11-03", due: "2026-11-09", closed: "2026-11-16", submitted: false, max: 100, submissionMode: "upload" },
        { id: "q6", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz #3: Hooks", opened: "2026-10-27", due: "2026-10-30", submitted: true, graded: true, score: 10, max: 10, submissionMode: "upload" },
      ],
      11: [{ id: "a5", itemType: "assignment", title: "DBMS Assignment_4 Fall 2026", opened: "2026-11-10", due: "2026-11-17", closed: "2026-11-24", submitted: true, max: 100, submissionMode: "upload" }],
      12: [
        { id: "q2", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz #2", opened: "2026-11-18", due: "2026-11-24", submitted: false, max: 10, submissionMode: "upload" },
        { id: "q7", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz #4: Rendering", opened: "2026-11-20", due: "2026-11-27", submitted: false, max: 10, submissionMode: "upload" },
        { id: "e1", itemType: "assessment", kind: "midterm", mode: "paper", title: "Midterm exam", opened: "2026-11-20", due: "2026-11-23", submitted: false, max: 100, submissionMode: "physical", physical: { timeWindow: "09:00 AM - 11:00 AM", room: "Room C-304" } },
        { id: "e2", itemType: "assessment", kind: "final", mode: "paper", title: "Final exam", opened: "2026-12-01", due: "2026-12-05", submitted: false, max: 100, submissionMode: "physical", physical: { timeWindow: "09:00 AM - 12:00 PM", room: "Exam Hall A" } },
      ],
    }),
  },
  {
    offeringId: "CS201-5-B",
    code: "CS201",
    section: "BSIET-5-B",
    sectionId: 5,
    title: "Data Structures & Algorithms",
    department: "CS",
    instructorId: 5,
    term: "Fall 2026",
    status: "in-progress",
    objective: "Analyse and implement core data structures and algorithms.",
    timetable: "Tuesday 09:00-10:30 · Thursday 09:00-10:30",
    materials: [{ name: "Course outline.pdf", size: "180 KB" }],
    announcements: [{ title: "Lab make-up", date: "2026-11-12", body: "Lab shifted to Friday 10:00 this week." }],
    weeks: weeks({
      2: [{ id: "a2", itemType: "assignment", title: "Assignment 2: Trees", opened: "2026-09-08", due: "2026-09-14", submitted: true, graded: true, score: 92, max: 100, submissionMode: "upload" }],
      4: [{ id: "q4", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz: Trees", opened: "2026-09-22", due: "2026-09-22", submitted: true, graded: true, score: 5, max: 10, submissionMode: "upload" }],
      8: [{ id: "p3", itemType: "assessment", kind: "project", mode: "online_attachment", title: "DSA Project Viva", opened: "2026-10-20", due: "2026-10-26", submitted: false, max: 40, submissionMode: "upload", physical: { timeWindow: "11:00 AM - 1:00 PM", room: "Lab 3" } }],
      11: [{ id: "a6", itemType: "assignment", title: "Assignment: Graphs", opened: "2026-11-10", due: "2026-11-16", submitted: false, max: 100, submissionMode: "physical", physical: { timeWindow: "10:00 AM - 12:00 PM", room: "Room E-202" } }],
      12: [
        { id: "a10", itemType: "assignment", title: "Assignment: Hashing", opened: "2026-11-17", due: "2026-11-23", submitted: false, max: 100, submissionMode: "upload" },
        { id: "q8", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz: Graphs", opened: "2026-11-19", due: "2026-11-28", submitted: false, max: 10, submissionMode: "upload" },
        { id: "e3", itemType: "assessment", kind: "midterm", mode: "paper", title: "Midterm exam", opened: "2026-11-20", due: "2026-11-23", submitted: false, max: 100, submissionMode: "physical", physical: { timeWindow: "10:00 AM - 12:00 PM", room: "Room E-202" } },
        { id: "e4", itemType: "assessment", kind: "final", mode: "paper", title: "Final exam", opened: "2026-12-01", due: "2026-12-05", submitted: false, max: 100, submissionMode: "physical", physical: { timeWindow: "10:00 AM - 01:00 PM", room: "Exam Hall B" } },
      ],
    }),
  },
  {
    offeringId: "ME101-5-A",
    code: "ME101",
    section: "BSME-5-A",
    sectionId: 13,
    title: "Thermodynamics - I",
    department: "ME",
    instructorId: 4,
    term: "Fall 2026",
    status: "in-progress",
    objective: "Apply the laws of thermodynamics to engineering systems.",
    timetable: "Monday 14:00-15:30 · Wednesday 14:00-15:30",
    materials: [{ name: "Steam tables.pdf", size: "540 KB" }],
    announcements: [{ title: "Midterm", date: "2026-11-09", body: "Midterm on Monday 09:00-11:00, room E-202." }],
    weeks: weeks({
      3: [{ id: "q5", itemType: "assessment", kind: "quiz", mode: "online_mcq", title: "Quiz: Thermo basics", opened: "2026-09-15", due: "2026-09-15", submitted: true, graded: true, score: 6, max: 10, submissionMode: "upload" }],
      6: [{ id: "a11", itemType: "assignment", title: "Assignment: Heat transfer", opened: "2026-10-06", due: "2026-10-12", submitted: false, max: 100, submissionMode: "upload" }],
      9: [{ id: "p4", itemType: "assessment", kind: "project", mode: "online_attachment", title: "Thermo Project Viva", opened: "2026-10-27", due: "2026-11-02", submitted: false, max: 50, submissionMode: "upload", physical: { timeWindow: "2:00 PM - 5:00 PM", room: "ME Seminar Hall" } }],
      11: [{ id: "e5", itemType: "assessment", kind: "midterm", mode: "paper", title: "Midterm exam", opened: "2026-11-20", due: "2026-11-23", submitted: false, max: 100, submissionMode: "physical", physical: { timeWindow: "09:00 AM - 11:00 AM", room: "Room E-202" } }],
      12: [
        { id: "a12", itemType: "assignment", title: "Assignment: Refrigeration cycle", opened: "2026-11-17", due: "2026-11-23", submitted: false, max: 100, submissionMode: "upload" },
        { id: "e6", itemType: "assessment", kind: "final", mode: "paper", title: "Final exam", opened: "2026-12-01", due: "2026-12-05", submitted: false, max: 100, submissionMode: "physical", physical: { timeWindow: "02:00 PM - 05:00 PM", room: "ME Seminar Hall" } },
      ],
    }),
  },
  {
    offeringId: "CS101-4-A",
    code: "CS101",
    section: "BSIET-4-A",
    sectionId: 101,
    title: "Introduction to Programming",
    department: "CS",
    instructorId: 5,
    term: "Spring 2026",
    status: "past",
    objective: "Learn programming fundamentals and problem solving.",
    timetable: "Monday 11:00-12:30 · Wednesday 09:00-10:30",
    materials: [{ name: "Course outline.pdf", size: "150 KB" }],
    announcements: [{ title: "Course completed", date: "2026-05-20", body: "Final grades have been published." }],
    weeks: weeks({
      2: [{ id: "a8", itemType: "assignment", title: "Assignment 1: Basics", opened: "2026-02-10", due: "2026-02-17", submitted: true, graded: true, score: 90, max: 100, submissionMode: "upload" }],
    }),
  },
  {
    offeringId: "EE110-3-A",
    code: "EE110",
    section: "BSEE-3-A",
    sectionId: 102,
    title: "Circuit Analysis",
    department: "EE",
    instructorId: 4,
    term: "Fall 2025",
    status: "past",
    objective: "Analyze DC and AC circuits.",
    timetable: "Tuesday 14:00-15:30 · Thursday 14:00-15:30",
    materials: [{ name: "Lab manual.pdf", size: "900 KB" }],
    announcements: [{ title: "Course completed", date: "2026-01-15", body: "Course archive available." }],
    weeks: weeks({
      4: [{ id: "a9", itemType: "assignment", title: "Lab report", opened: "2025-10-01", due: "2025-10-08", submitted: true, graded: true, score: 84, max: 100, submissionMode: "upload" }],
    }),
  },
];

export const grades: GradeRow[] = [
  { offeringId: "CS301-5-A", sectionId: 4, course: "CS301", title: "Assignment 1", kind: "Assignment", raw: 88, max: 100, weight: 10 },
  { offeringId: "CS301-5-A", sectionId: 4, course: "CS301", title: "Quiz #1", kind: "Quiz", raw: 10, max: 10, weight: 5 },
  { offeringId: "CS301-5-A", sectionId: 4, course: "CS301", title: "Assignment 4", kind: "Assignment", raw: 0, max: 100, weight: 10 },
  { offeringId: "CS301-5-A", sectionId: 4, course: "CS301", title: "Assignment 5", kind: "Assignment", raw: 80, max: 100, weight: 10 },
  { offeringId: "CS301-5-A", sectionId: 4, course: "CS301", title: "Midterm", kind: "Midterm", raw: 0, max: 100, weight: 25 },
  { offeringId: "CS301-5-A", sectionId: 4, course: "CS301", title: "Final", kind: "Final", raw: 0, max: 100, weight: 40 },
  { offeringId: "CS201-5-B", sectionId: 5, course: "CS201", title: "Assignment 2", kind: "Assignment", raw: 92, max: 100, weight: 10 },
  { offeringId: "CS201-5-B", sectionId: 5, course: "CS201", title: "Assignment: Graphs", kind: "Assignment", raw: 0, max: 100, weight: 10 },
  { offeringId: "ME101-5-A", sectionId: 13, course: "ME101", title: "Midterm", kind: "Midterm", raw: 0, max: 100, weight: 30 },
  { offeringId: "ME101-5-A", sectionId: 13, course: "ME101", title: "Final", kind: "Final", raw: 0, max: 100, weight: 50 },
];

export const quizzes: Quiz[] = [
  {
    id: "q1",
    offeringId: "CS301-5-A",
    sectionId: 4,
    sourceAssessmentId: "ta-a2",
    title: "Quiz #1",
    opened: "2026-09-15 09:00",
    closed: "2026-09-21 23:59",
    timeLimit: "30 min",
    grade: 10,
    max: 10,
    questions: [
      { id: "q1p1", text: "Which hook manages local component state?", options: ["useEffect", "useState", "useMemo", "useRef"], answer: 1, points: 5 },
      { id: "q1p2", text: "What does JSX compile to?", options: ["HTML", "CSS", "React.createElement calls", "JSON"], answer: 2, points: 5 },
    ],
    attempt: { started: "2026-09-18 10:02", completed: "2026-09-18 10:21", duration: "19 min", grade: "10.00 / 10.00", answers: { q1p1: 1, q1p2: 2 } },
  },
  {
    id: "q2",
    offeringId: "CS301-5-A",
    sectionId: 4,
    sourceAssessmentId: "ta-a7",
    title: "Quiz #2",
    opened: "2026-11-18 09:00",
    closed: "2026-11-24 23:59",
    timeLimit: "20 min",
    grade: 0,
    max: 10,
    questions: [
      { id: "q2p1", text: "Which hook runs after every render by default?", options: ["useState", "useEffect", "useId", "useContext"], answer: 1, points: 5 },
      { id: "q2p2", text: "What is the correct way to update state based on previous state?", options: ["setState(value)", "setState(prev => prev + 1)", "state++", "useRef(state)"], answer: 1, points: 5 },
    ],
  },
  {
    id: "q4",
    offeringId: "CS201-5-B",
    sectionId: 5,
    title: "Quiz: Trees",
    opened: "2026-09-22 09:00",
    closed: "2026-09-22 09:30",
    timeLimit: "30 min",
    grade: 5,
    max: 10,
    questions: [
      { id: "q4p1", text: "Which traversal visits root first?", options: ["Inorder", "Preorder", "Postorder", "Level order"], answer: 1, points: 5 },
      { id: "q4p2", text: "A BST with n nodes has what average search time?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 1, points: 5 },
    ],
    attempt: { started: "2026-09-22 09:00", completed: "2026-09-22 09:18", duration: "18 min", grade: "5.00 / 10.00", answers: { q4p1: 1, q4p2: 0 } },
  },
  {
    id: "q5",
    offeringId: "ME101-5-A",
    sectionId: 13,
    title: "Quiz: Thermo basics",
    opened: "2026-09-15 09:00",
    closed: "2026-09-15 23:59",
    timeLimit: "15 min",
    grade: 6,
    max: 10,
    questions: [
      { id: "q5p1", text: "Which law says energy cannot be created or destroyed?", options: ["Zeroth law", "First law", "Second law", "Third law"], answer: 1, points: 3 },
      { id: "q5p2", text: "What does a Carnot cycle define?", options: ["Maximum heat-engine efficiency", "Minimum boiler pressure", "Specific heat capacity", "Rate of heat transfer"], answer: 0, points: 3 },
      { id: "q5p3", text: "What is the SI unit of specific heat capacity?", options: ["J/kg·K", "J/K", "kJ/kg", "W/m·K"], answer: 0, points: 4 },
    ],
    attempt: { started: "2026-09-15 10:02", completed: "2026-09-15 10:14", duration: "12 min", grade: "6.00 / 10.00", answers: { q5p1: 1, q5p2: 0, q5p3: 1 } },
  },
  {
    id: "q6",
    offeringId: "CS301-5-A",
    sectionId: 4,
    title: "Quiz #3: Hooks",
    opened: "2026-10-27 09:00",
    closed: "2026-10-30 23:59",
    timeLimit: "15 min",
    grade: 10,
    max: 10,
    questions: [
      { id: "q6p1", text: "Which hook reads a context value?", options: ["useContext", "useEffect", "useReducer", "useRef"], answer: 0, points: 2 },
      { id: "q6p2", text: "When does a useEffect cleanup function run?", options: ["On every parent render", "Before the next effect and on unmount", "Only on first mount", "Never"], answer: 1, points: 3 },
      { id: "q6p3", text: "Which hook memoizes a callback?", options: ["useMemo", "useCallback", "useState", "useLayoutEffect"], answer: 1, points: 5 },
    ],
    attempt: { started: "2026-10-29 16:25", completed: "2026-10-29 16:40", duration: "15 min", grade: "10.00 / 10.00", answers: { q6p1: 0, q6p2: 1, q6p3: 1 } },
  },
  {
    id: "q7",
    offeringId: "CS301-5-A",
    sectionId: 4,
    title: "Quiz #4: Rendering",
    opened: "2026-11-20 09:00",
    closed: "2026-11-27 23:59",
    timeLimit: "25 min",
    grade: 0,
    max: 10,
    questions: [
      { id: "q7p1", text: "What triggers a React re-render?", options: ["State or prop change", "A CSS class change", "A timer outside React", "A DOM attribute edit"], answer: 0, points: 3 },
      { id: "q7p2", text: "What does React.memo do?", options: ["Caches a callback", "Skips re-render when props are unchanged", "Keeps a ref across renders", "Creates a context"], answer: 1, points: 3 },
      { id: "q7p3", text: "Which hook runs synchronously after DOM mutations?", options: ["useEffect", "useLayoutEffect", "useId", "useTransition"], answer: 1, points: 4 },
    ],
  },
  {
    id: "q8",
    offeringId: "CS201-5-B",
    sectionId: 5,
    title: "Quiz: Graphs",
    opened: "2026-11-19 09:00",
    closed: "2026-11-28 23:59",
    timeLimit: "20 min",
    grade: 0,
    max: 10,
    questions: [
      { id: "q8p1", text: "Which traversal uses a queue?", options: ["DFS", "BFS", "Preorder", "Postorder"], answer: 1, points: 3 },
      { id: "q8p2", text: "How many edges does a tree with n nodes have?", options: ["n", "n - 1", "n + 1", "2n"], answer: 1, points: 3 },
      { id: "q8p3", text: "Which structure detects a cycle in an undirected graph?", options: ["Stack", "Union-find", "Priority queue", "Hash map"], answer: 1, points: 4 },
    ],
  },
];

export interface StudentQuestion {
  id: string;
  question: string;
  askedAt: string;
  contextType: "event" | "course";
  contextLabel: string;
  contextTo: string;
  status: QuestionStatus;
  visibility: QuestionVisibility;
  answer?: string;
  answeredAt?: string;
  responderName?: string;
  readAt?: string;
  resolvedAt?: string;
}

export function studentQuestionStatusLabel(q: StudentQuestion): string {
  if (q.status === "resolved") return "Resolved";
  if (q.answer && !q.readAt) return "Answered (new)";
  if (q.answer) return "Read";
  return "Pending";
}

export const studentQuestions: StudentQuestion[] = [
  {
    id: "sq1",
    question: "For Assignment 4, should the state diagram be included in the PDF or as a separate image?",
    askedAt: "2026-11-08 14:20",
    contextType: "event",
    contextLabel: "Assignment 4: State management",
    contextTo: "/student/assignments/a4",
    status: "resolved",
    visibility: "public",
    answer: "Include it in the PDF. If the diagram is large, you can also attach the source image, but the PDF must be readable on its own.",
    answeredAt: "2026-11-09 09:15",
    responderName: "Imran Razzaq",
    resolvedAt: "2026-11-09 09:15",
  },
  {
    id: "sq2",
    question: "Will the viva cover only Milestone 1 scope or the full project proposal?",
    askedAt: "2026-11-10 11:00",
    contextType: "event",
    contextLabel: "Project Viva",
    contextTo: "/student/assignments/p2",
    status: "open",
    visibility: "private",
  },
  {
    id: "sq3",
    question: "Can I get clarification on the grading breakdown for the DSA project viva?",
    askedAt: "2026-11-07 16:40",
    contextType: "event",
    contextLabel: "DSA Project Viva",
    contextTo: "/student/assignments/p3",
    status: "resolved",
    visibility: "public",
    answer: "The viva is 40 marks: 15 for problem understanding, 15 for implementation explanation, and 10 for Q&A.",
    answeredAt: "2026-11-07 18:05",
    responderName: "Erin",
    readAt: "2026-11-08 08:10",
    resolvedAt: "2026-11-08 08:10",
  },
  {
    id: "sq4",
    question: "Is there a recommended reference book for the thermodynamics section after midterm?",
    askedAt: "2026-11-11 10:30",
    contextType: "course",
    contextLabel: "ME101-5A - Introduction to Thermodynamics",
    contextTo: "/student/courses/ME101-5-A",
    status: "open",
    visibility: "public",
  },
];

export const teachers: TeacherProfile[] = [
  { id: 3, name: "Imran Razzaq", email: "imran.razzaq@tech.uol.edu.pk", department: "CS", location: "Room C-304, Tech Block", lastAccess: "Today, 09:42", courseIds: ["CS301-5-A", "CS201-5-B"] },
  { id: 4, name: "Dan", email: "dan@tech.uol.edu.pk", department: "ME", location: "Room M-112", lastAccess: "Yesterday, 16:10", courseIds: ["ME101-5-A"] },
  { id: 5, name: "Erin", email: "erin@tech.uol.edu.pk", department: "CS", location: "Room C-201", lastAccess: "2026-11-20, 11:05", courseIds: ["CS201-5-B"] },
];

export interface CourseResult {
  semester: number;
  offeringId: string;
  sectionId: number;
  code: string;
  title: string;
  credits: number;
  percentage: number | null;
  letter: string;
  gradePoints: number | null;
  status: "completed" | "in-progress";
}

export const courseResults: CourseResult[] = [
  { semester: 3, offeringId: "CS301-5-A", sectionId: 4, code: "CS301", title: "Advanced Front-End Development", credits: 3, percentage: null, letter: "IP", gradePoints: null, status: "in-progress" },
  { semester: 3, offeringId: "CS201-5-B", sectionId: 5, code: "CS201", title: "Data Structures & Algorithms", credits: 3, percentage: null, letter: "IP", gradePoints: null, status: "in-progress" },
  { semester: 3, offeringId: "ME101-5-A", sectionId: 13, code: "ME101", title: "Thermodynamics - I", credits: 3, percentage: null, letter: "IP", gradePoints: null, status: "in-progress" },
  { semester: 2, offeringId: "CS101-4-A", sectionId: 101, code: "CS101", title: "Introduction to Programming", credits: 3, percentage: 86, letter: "A", gradePoints: 4.0, status: "completed" },
  { semester: 2, offeringId: "MATH102-4-A", sectionId: 103, code: "MATH102", title: "Calculus II", credits: 3, percentage: 79, letter: "B+", gradePoints: 3.5, status: "completed" },
  { semester: 2, offeringId: "ENG101-4-A", sectionId: 104, code: "ENG101", title: "Academic Writing", credits: 2, percentage: 91, letter: "A", gradePoints: 4.0, status: "completed" },
  { semester: 1, offeringId: "EE110-3-A", sectionId: 102, code: "EE110", title: "Circuit Analysis", credits: 3, percentage: 82, letter: "A-", gradePoints: 3.75, status: "completed" },
  { semester: 1, offeringId: "CS100-3-A", sectionId: 105, code: "CS100", title: "Computing Fundamentals", credits: 3, percentage: 88, letter: "A", gradePoints: 4.0, status: "completed" },
  { semester: 1, offeringId: "MATH101-3-A", sectionId: 106, code: "MATH101", title: "Calculus I", credits: 3, percentage: 74, letter: "B", gradePoints: 3.0, status: "completed" },
];

// Past sections have no teacher workspace state; their results are published seeds.
export const publishedArchiveSectionIds = [101, 102, 103, 104, 105, 106];

export function calculateSemesterGpa(semester: number): number | null {
  const rows = courseResults.filter((r) => r.semester === semester && r.status === "completed" && r.gradePoints !== null);
  if (!rows.length) return null;
  const totalCredits = rows.reduce((sum, r) => sum + r.credits, 0);
  const totalPoints = rows.reduce((sum, r) => sum + r.credits * (r.gradePoints ?? 0), 0);
  return totalCredits ? totalPoints / totalCredits : null;
}

export function calculateCgpa(): number | null {
  const rows = courseResults.filter((r) => r.status === "completed" && r.gradePoints !== null);
  if (!rows.length) return null;
  const totalCredits = rows.reduce((sum, r) => sum + r.credits, 0);
  const totalPoints = rows.reduce((sum, r) => sum + r.credits * (r.gradePoints ?? 0), 0);
  return totalCredits ? totalPoints / totalCredits : null;
}

export function resultSemesters(): number[] {
  return [...new Set(courseResults.map((r) => r.semester))].sort((a, b) => a - b);
}

export const currentStudentId = 7; // David in src/mock/people.ts

export function allActivities(): Activity[] {
  return offerings.flatMap((offering) =>
    offering.weeks.flatMap((week) => week.activities),
  );
}

export function findOffering(id: string | undefined): CourseOffering | undefined {
  return offerings.find((offering) => offering.offeringId === id);
}

export function findActivity(id: string | undefined): Activity | undefined {
  return allActivities().find((activity) => activity.id === id);
}

// Course-week items and their detail pages share one lookup so the same id
// always resolves to the same offering.
export function findOfferingForActivity(id: string | undefined): CourseOffering | undefined {
  return offerings.find((offering) =>
    offering.weeks.some((week) => week.activities.some((activity) => activity.id === id)),
  );
}

export const MOCK_TODAY = "2026-11-22";

export type AvailabilityStatus = "upcoming" | "open" | "closed";

export function availabilityStatus(opened: string, deadline?: string, today = MOCK_TODAY): AvailabilityStatus {
  if (today < opened.slice(0, 10)) return "upcoming";
  if (deadline && today > deadline.slice(0, 10)) return "closed";
  return "open";
}

export function activityPath(activity: Activity): string {
  if (activity.itemType === "assessment" && (activity.kind === "midterm" || activity.kind === "final")) {
    return `/student/exams/${activity.id}`;
  }
  if (activity.itemType === "assessment" && activity.kind === "quiz") {
    return `/student/quizzes/${activity.id}`;
  }
  return `/student/assignments/${activity.id}`;
}

export function activityLabel(activity: Activity): string {
  if (activity.itemType !== "assessment") return "Assignment";
  if (activity.kind === "midterm") return "Midterm exam";
  if (activity.kind === "final") return "Final exam";
  if (activity.kind === "quiz") return "Quiz";
  return "Project";
}
