export type CsvDataType = "users" | "enrolments" | "courses";

export interface DataOption {
  id: CsvDataType;
  title: string;
  description: string;
  columns: string[];
  sampleFilename: string;
}

export const csvDataOptions: DataOption[] = [
  {
    id: "users",
    title: "Users (Accounts)",
    description: "Students, Teachers, and Staff accounts with roles and departments.",
    columns: ["name", "email", "role (student|teacher|admin)", "department_code"],
    sampleFilename: "users_template.csv",
  },
  {
    id: "enrolments",
    title: "Student Section Enrolments",
    description: "Batch enrol students into cohort classes for an academic term.",
    columns: ["student_roll_no", "term_name", "cohort_section_code"],
    sampleFilename: "enrolments_template.csv",
  },
  {
    id: "courses",
    title: "Course Catalog & Subjects",
    description: "Master list of subjects, credit hours, and offering departments.",
    columns: ["subject_code", "title", "department_code", "credit_hours"],
    sampleFilename: "courses_template.csv",
  },
];
