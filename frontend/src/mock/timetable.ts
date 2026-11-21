export interface ScheduleSlot {
  id: number;
  sectionCode: string; // e.g. "BSCS-5A"
  subjectCode: string; // e.g. "CS-301"
  teacherName: string; // e.g. "Carol"
  room: string;        // e.g. "CS-Lab-2"
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  timeSlot: string;    // e.g. "08:30 - 10:00"
}

export const TIME_SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "11:30 - 01:00",
  "01:30 - 03:00",
  "03:00 - 04:30",
] as const;

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export const initialScheduleSlots: ScheduleSlot[] = [
  {
    id: 1,
    sectionCode: "BSCS-5A",
    subjectCode: "CS-301",
    teacherName: "Carol",
    room: "CS-Lab-1",
    dayOfWeek: "Monday",
    timeSlot: "08:30 - 10:00",
  },
  {
    id: 2,
    sectionCode: "BSCS-5A",
    subjectCode: "CS-310",
    teacherName: "Carol",
    room: "Room-204",
    dayOfWeek: "Monday",
    timeSlot: "10:00 - 11:30",
  },
  {
    id: 3,
    sectionCode: "BSCS-5A",
    subjectCode: "CS-320",
    teacherName: "Erin",
    room: "Room-205",
    dayOfWeek: "Tuesday",
    timeSlot: "10:00 - 11:30",
  },
  {
    id: 4,
    sectionCode: "BSCS-5A",
    subjectCode: "CS-330",
    teacherName: "Bob",
    room: "CS-Lab-3",
    dayOfWeek: "Wednesday",
    timeSlot: "08:30 - 10:00",
  },
  {
    id: 5,
    sectionCode: "BSCS-5A",
    subjectCode: "CS-301",
    teacherName: "Carol",
    room: "CS-Lab-1",
    dayOfWeek: "Wednesday",
    timeSlot: "11:30 - 01:00",
  },
  {
    id: 6,
    sectionCode: "BSCS-5A",
    subjectCode: "CS-310",
    teacherName: "Carol",
    room: "Room-204",
    dayOfWeek: "Thursday",
    timeSlot: "01:30 - 03:00",
  },
  {
    id: 7,
    sectionCode: "BSCS-5A",
    subjectCode: "CS-320",
    teacherName: "Erin",
    room: "Room-205",
    dayOfWeek: "Friday",
    timeSlot: "08:30 - 10:00",
  },
];
