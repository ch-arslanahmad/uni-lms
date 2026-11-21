// 24 users: 1 admin, 5 teachers, 18 students.
export const users = [
  {
    id: 1,
    name: "Arslan",
    email: "arslan@example.com",
    role: "admin",
    department: "all",
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    role: "teacher",
    department: "EE",
  },
  {
    id: 3,
    name: "Carol",
    email: "carol@example.com",
    role: "teacher",
    department: "CS",
  },
  {
    id: 4,
    name: "Dan",
    email: "dan@example.com",
    role: "teacher",
    department: "ME",
  },
  {
    id: 5,
    name: "Erin",
    email: "erin@example.com",
    role: "teacher",
    department: "CS",
  },
  {
    id: 6,
    name: "Farah",
    email: "farah@example.com",
    role: "teacher",
    department: "EE",
  },
  {
    id: 7,
    name: "David",
    email: "david@example.com",
    role: "student",
    department: "ME",
  },
  {
    id: 8,
    name: "Eve",
    email: "eve@example.com",
    role: "student",
    department: "CS",
  },
  {
    id: 9,
    name: "Frank",
    email: "frank@example.com",
    role: "student",
    department: "CS",
  },
  {
    id: 10,
    name: "Grace",
    email: "grace@example.com",
    role: "student",
    department: "EE",
  },
  {
    id: 11,
    name: "Henry",
    email: "henry@example.com",
    role: "student",
    department: "ME",
  },
  {
    id: 12,
    name: "Ivy",
    email: "ivy@example.com",
    role: "student",
    department: "CS",
  },
  {
    id: 13,
    name: "Jack",
    email: "jack@example.com",
    role: "student",
    department: "EE",
  },
  {
    id: 14,
    name: "Kate",
    email: "kate@example.com",
    role: "student",
    department: "ME",
  },
  {
    id: 15,
    name: "Liam",
    email: "liam@example.com",
    role: "student",
    department: "CS",
  },
  {
    id: 16,
    name: "Mia",
    email: "mia@example.com",
    role: "student",
    department: "EE",
  },
  {
    id: 17,
    name: "Noah",
    email: "noah@example.com",
    role: "student",
    department: "ME",
  },
  {
    id: 18,
    name: "Olivia",
    email: "olivia@example.com",
    role: "student",
    department: "CS",
  },
  {
    id: 19,
    name: "Paul",
    email: "paul@example.com",
    role: "student",
    department: "EE",
  },
  {
    id: 20,
    name: "Quinn",
    email: "quinn@example.com",
    role: "student",
    department: "ME",
  },
  {
    id: 21,
    name: "Rita",
    email: "rita@example.com",
    role: "student",
    department: "CS",
  },
  {
    id: 22,
    name: "Sam",
    email: "sam@example.com",
    role: "student",
    department: "EE",
  },
  {
    id: 23,
    name: "Tina",
    email: "tina@example.com",
    role: "student",
    department: "ME",
  },
  {
    id: 24,
    name: "Uma",
    email: "uma@example.com",
    role: "student",
    department: "CS",
  },
];

// A student's course/semester/section live outside `users`
// (enrolment -> section -> course/term), keyed by user id.
// `section` is the section letter (A-E), since it is scoped to a course.
export const studentPlacement: Record<
  number,
  { course: string; semester: string; section: string }
> = {
  7: { course: "ME-101 Thermodynamics", semester: "Fall 2026", section: "A" },
  8: { course: "CS-201 Data Structures", semester: "Fall 2026", section: "B" },
  9: { course: "CS-201 Data Structures", semester: "Fall 2026", section: "A" },
  10: {
    course: "EE-110 Circuit Analysis",
    semester: "Fall 2026",
    section: "A",
  },
  11: { course: "ME-102 Statics", semester: "Fall 2026", section: "A" },
  12: {
    course: "CS-101 Intro to Programming",
    semester: "Spring 2026",
    section: "A",
  },
  13: {
    course: "EE-210 Signals & Systems",
    semester: "Spring 2026",
    section: "A",
  },
  14: { course: "ME-201 Dynamics", semester: "Fall 2026", section: "A" },
  15: {
    course: "CS-310 Operating Systems",
    semester: "Fall 2026",
    section: "A",
  },
  16: {
    course: "EE-110 Circuit Analysis",
    semester: "Fall 2026",
    section: "B",
  },
  17: { course: "ME-101 Thermodynamics", semester: "Fall 2026", section: "B" },
  18: { course: "CS-201 Data Structures", semester: "Fall 2026", section: "C" },
  19: {
    course: "EE-210 Signals & Systems",
    semester: "Fall 2026",
    section: "B",
  },
  20: { course: "ME-102 Statics", semester: "Fall 2026", section: "B" },
  21: {
    course: "CS-101 Intro to Programming",
    semester: "Spring 2026",
    section: "B",
  },
  22: {
    course: "EE-110 Circuit Analysis",
    semester: "Spring 2026",
    section: "C",
  },
  23: { course: "ME-201 Dynamics", semester: "Fall 2026", section: "B" },
  24: {
    course: "CS-310 Operating Systems",
    semester: "Fall 2026",
    section: "B",
  },
};

// Courses a teacher is responsible for (section_teacher -> section -> course).
export const teacherCourses: Record<number, string> = {
  2: "EE-110 Circuit Analysis",
  3: "CS-201 Data Structures, CS-310 Operating Systems",
  4: "ME-101 Thermodynamics, ME-102 Statics",
  5: "CS-101 Intro to Programming",
  6: "EE-210 Signals & Systems",
};

// Mock data for Departments
export const departments = [
  { code: "CS", name: "Computer Science", courses: 12, teachers: 2, students: 10 },
  { code: "EE", name: "Electrical Engineering", courses: 9, teachers: 2, students: 4 },
  { code: "ME", name: "Mechanical Engineering", courses: 7, teachers: 1, students: 4 },
];
