import UsersPage from "./UsersPage";
import { type TableFilter } from "../../components/userTableConfig";
import { type Column } from "../../components/SimpleTable";
import { type Teacher, teachers } from "../../models";

const TeacherColumns: Column<Teacher>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "courses", label: "Courses" },
];

const TeacherFilters: TableFilter<Teacher>[] = [
  { field: "department", variant: "dropdown" },
];

function TeachersPage() {
  return (
    <UsersPage
      title="Teachers"
      columns={TeacherColumns}
      data={teachers}
      searchKeys={["name", "email", "courses"]}
      filters={TeacherFilters}
    />
  );
}

export default TeachersPage;
