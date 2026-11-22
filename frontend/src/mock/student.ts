// Student mock data for Phase 1. Pages read from here, never from a backend.
// Kept compact: derived views are computed, not duplicated.

export interface Activity {
  id: string;
  kind: "assignment" | "quiz";
  title: string;
  opened: string;
  due: string;
  closed?: string;
  submitted: boolean;
  graded?: boolean;
  score?: number;
  max: number;
}

export interface Week {
  range: string;
  current?: boolean;
  activities: Activity[];
}

export interface CourseOffering {
  offeringId: string;
  code: string;
  section: string;
  title: string;
  department: string;
  instructorId: number;
  objective: string;
  timetable: string;
  materials: { name: string; size: string }[];
  announcements: { title: string; date: string; body: string }[];
  weeks: Week[];
}

export interface GradeRow {
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
}

export interface Quiz {
  id: string;
  offeringId: string;
  title: string;
  opened: string;
  closed: string;
  timeLimit: string;
  attemptsAllowed: number;
  grade: number;
  max: number;
  questions: QuizQuestion[];
  attempts: { status: string; started: string; completed: string; duration: string; grade: string }[];
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
    title: "Advanced Front-End Development",
    department: "CS",
    instructorId: 3,
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
      1: [{ id: "a1", kind: "assignment", title: "Assignment 1: Component basics", opened: "2026-09-01", due: "2026-09-07", submitted: true, graded: true, score: 88, max: 100 }],
      3: [{ id: "q1", kind: "quiz", title: "Quiz #1", opened: "2026-09-15", due: "2026-09-21", submitted: true, graded: true, score: 10, max: 10 }],
      10: [{ id: "a4", kind: "assignment", title: "Assignment 4: State management", opened: "2026-11-03", due: "2026-11-09", closed: "2026-11-16", submitted: false, max: 100 }],
      11: [{ id: "a5", kind: "assignment", title: "DBMS Assignment_4 Fall 2026", opened: "2026-11-10", due: "2026-11-17", closed: "2026-11-24", submitted: true, max: 100 }],
      12: [{ id: "q2", kind: "quiz", title: "Quiz #2", opened: "2026-11-18", due: "2026-11-24", submitted: false, max: 10 }],
    }),
  },
  {
    offeringId: "CS201-5-B",
    code: "CS201",
    section: "BSIET-5-B",
    title: "Data Structures & Algorithms",
    department: "CS",
    instructorId: 5,
    objective: "Analyse and implement core data structures and algorithms.",
    timetable: "Tuesday 09:00-10:30 · Thursday 09:00-10:30",
    materials: [{ name: "Course outline.pdf", size: "180 KB" }],
    announcements: [{ title: "Lab make-up", date: "2026-11-12", body: "Lab shifted to Friday 10:00 this week." }],
    weeks: weeks({
      2: [{ id: "a2", kind: "assignment", title: "Assignment 2: Trees", opened: "2026-09-08", due: "2026-09-14", submitted: true, graded: true, score: 92, max: 100 }],
      11: [{ id: "a6", kind: "assignment", title: "Assignment: Graphs", opened: "2026-11-10", due: "2026-11-16", submitted: false, max: 100 }],
    }),
  },
  {
    offeringId: "ME101-5-A",
    code: "ME101",
    section: "BSME-5-A",
    title: "Thermodynamics - I",
    department: "ME",
    instructorId: 4,
    objective: "Apply the laws of thermodynamics to engineering systems.",
    timetable: "Monday 14:00-15:30 · Wednesday 14:00-15:30",
    materials: [{ name: "Steam tables.pdf", size: "540 KB" }],
    announcements: [{ title: "Midterm", date: "2026-11-09", body: "Midterm on Monday 09:00-11:00, room E-202." }],
    weeks: weeks({
      11: [{ id: "a7", kind: "assignment", title: "Midterm", opened: "2026-11-09", due: "2026-11-14", submitted: false, max: 100 }],
    }),
  },
];

export const grades: GradeRow[] = [
  { course: "CS301", title: "Assignment 1", kind: "Assignment", raw: 88, max: 100, weight: 10 },
  { course: "CS301", title: "Quiz #1", kind: "Quiz", raw: 10, max: 10, weight: 5 },
  { course: "CS301", title: "Assignment 4", kind: "Assignment", raw: 0, max: 100, weight: 10 },
  { course: "CS301", title: "Assignment 5", kind: "Assignment", raw: 80, max: 100, weight: 10 },
  { course: "CS301", title: "Midterm", kind: "Midterm", raw: 0, max: 100, weight: 25 },
  { course: "CS301", title: "Final", kind: "Final", raw: 0, max: 100, weight: 40 },
  { course: "CS201", title: "Assignment 2", kind: "Assignment", raw: 92, max: 100, weight: 10 },
  { course: "CS201", title: "Assignment: Graphs", kind: "Assignment", raw: 0, max: 100, weight: 10 },
  { course: "ME101", title: "Midterm", kind: "Midterm", raw: 0, max: 100, weight: 30 },
  { course: "ME101", title: "Final", kind: "Final", raw: 0, max: 100, weight: 50 },
];

export const quizzes: Quiz[] = [
  {
    id: "q1",
    offeringId: "CS301-5-A",
    title: "Quiz #1",
    opened: "2026-09-15 09:00",
    closed: "2026-09-21 23:59",
    timeLimit: "30 min",
    attemptsAllowed: 2,
    grade: 10,
    max: 10,
    questions: [
      { id: "q1p1", text: "Which hook manages local component state?", options: ["useEffect", "useState", "useMemo", "useRef"], answer: 1, points: 5 },
      { id: "q1p2", text: "What does JSX compile to?", options: ["HTML", "CSS", "React.createElement calls", "JSON"], answer: 2, points: 5 },
    ],
    attempts: [{ status: "Finished", started: "2026-09-18 10:02", completed: "2026-09-18 10:21", duration: "19 min", grade: "10.00 / 10.00" }],
  },
  {
    id: "q2",
    offeringId: "CS301-5-A",
    title: "Quiz #2",
    opened: "2026-11-18 09:00",
    closed: "2026-11-24 23:59",
    timeLimit: "20 min",
    attemptsAllowed: 1,
    grade: 0,
    max: 10,
    questions: [
      { id: "q2p1", text: "Which hook runs after every render by default?", options: ["useState", "useEffect", "useId", "useContext"], answer: 1, points: 5 },
      { id: "q2p2", text: "What is the correct way to update state based on previous state?", options: ["setState(value)", "setState(prev => prev + 1)", "state++", "useRef(state)"], answer: 1, points: 5 },
    ],
    attempts: [],
  },
];

export const teachers: TeacherProfile[] = [
  { id: 3, name: "Imran Razzaq", email: "imran.razzaq@tech.uol.edu.pk", department: "CS", location: "Room C-304, Tech Block", lastAccess: "Today, 09:42", courseIds: ["CS301-5-A", "CS201-5-B"] },
  { id: 4, name: "Dan", email: "dan@tech.uol.edu.pk", department: "ME", location: "Room M-112", lastAccess: "Yesterday, 16:10", courseIds: ["ME101-5-A"] },
  { id: 5, name: "Erin", email: "erin@tech.uol.edu.pk", department: "CS", location: "Room C-201", lastAccess: "2026-11-20, 11:05", courseIds: ["CS201-5-B"] },
];

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
