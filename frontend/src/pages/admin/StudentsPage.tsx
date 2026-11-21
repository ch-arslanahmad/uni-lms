import UsersPage from "./UsersPage";
import { type TableFilter } from "../../components/userTableConfig";
import { type Column } from "../../components/SimpleTable";
import { type Student, students } from "../../models";

const StudentColumns: Column<Student>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "course", label: "Course" },
  { key: "semester", label: "Semester" },
  { key: "section", label: "Section" },
  { key: "department", label: "Department" },
];

const StudentFilters: TableFilter<Student>[] = [
  { field: "department", variant: "dropdown" },
  { field: "section", variant: "dropdown" },
];

function StudentsPage() {
  return (
    <UsersPage
      title="Students"
      columns={StudentColumns}
      data={students}
      searchKeys={["name", "email", "department", "course"]}
      filters={StudentFilters}
    />
  );
}

export default StudentsPage;
