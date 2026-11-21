export interface ExamDatesheetEntry {
  id: number;
  examType: "Midterm" | "Final";
  subjectCode: string;
  subjectTitle: string;
  classSection: string;
  examDate: string;     // e.g. "2026-11-16"
  dayOfWeek: string;    // e.g. "Monday"
  timeSlot: string;     // e.g. "09:00 - 11:00"
}

export interface AcademicCalendarMilestone {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  type: "classes" | "mids" | "finals" | "break" | "results";
  description: string;
}

export const academicCalendarMilestones: AcademicCalendarMilestone[] = [
  {
    id: 1,
    title: "Semester Classes Begin",
    startDate: "2026-09-15",
    endDate: "2026-11-06",
    type: "classes",
    description: "Weeks 1 to 8: Regular recurring weekly timetable lectures & labs.",
  },
  {
    id: 2,
    title: "Midterm Examination Week",
    startDate: "2026-11-09",
    endDate: "2026-11-14",
    type: "mids",
    description: "Week 9: Central midterm exams. Regular class lectures suspended.",
  },
  {
    id: 3,
    title: "Post-Midterm Lectures & Project Submissions",
    startDate: "2026-11-16",
    endDate: "2027-01-15",
    type: "classes",
    description: "Weeks 10 to 17: Resumption of regular timetable, assignments, and term projects.",
  },
  {
    id: 4,
    title: "Final Examination Week",
    startDate: "2027-01-18",
    endDate: "2027-01-30",
    type: "finals",
    description: "Week 18–19: Comprehensive final exams across faculties.",
  },
  {
    id: 5,
    title: "Official Result Compilation & Publication",
    startDate: "2027-02-01",
    endDate: "2027-02-07",
    type: "results",
    description: "Freezing category weights, SGPA/CGPA calculation, and result declaration.",
  },
];

export const mockExamDatesheet: ExamDatesheetEntry[] = [
  {
    id: 1,
    examType: "Midterm",
    subjectCode: "CS-301",
    subjectTitle: "Database Systems",
    classSection: "BSCS-5A",
    examDate: "2026-11-09",
    dayOfWeek: "Monday",
    timeSlot: "09:00 - 11:00",
  },
  {
    id: 2,
    examType: "Midterm",
    subjectCode: "CS-310",
    subjectTitle: "Operating Systems",
    classSection: "BSCS-5A",
    examDate: "2026-11-11",
    dayOfWeek: "Wednesday",
    timeSlot: "09:00 - 11:00",
  },
  {
    id: 3,
    examType: "Midterm",
    subjectCode: "CS-320",
    subjectTitle: "Software Engineering",
    classSection: "BSCS-5A",
    examDate: "2026-11-13",
    dayOfWeek: "Friday",
    timeSlot: "09:00 - 11:00",
  },
  {
    id: 4,
    examType: "Final",
    subjectCode: "CS-301",
    subjectTitle: "Database Systems",
    classSection: "BSCS-5A",
    examDate: "2027-01-18",
    dayOfWeek: "Monday",
    timeSlot: "09:00 - 12:00",
  },
  {
    id: 5,
    examType: "Final",
    subjectCode: "CS-310",
    subjectTitle: "Operating Systems",
    classSection: "BSCS-5A",
    examDate: "2027-01-21",
    dayOfWeek: "Thursday",
    timeSlot: "09:00 - 12:00",
  },
  {
    id: 6,
    examType: "Final",
    subjectCode: "CS-320",
    subjectTitle: "Software Engineering",
    classSection: "BSCS-5A",
    examDate: "2027-01-25",
    dayOfWeek: "Monday",
    timeSlot: "09:00 - 12:00",
  },
];
