import UsersPage from "./UsersPage";
import { type TableFilter } from "../../components/userTableConfig";
import { type Column } from "../../components/SimpleTable";
import { type Teacher } from "../../models";
import { useAdminStore, teacherRows } from "../../lib/adminStore";

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
  const store = useAdminStore();
  return (
    <UsersPage
      title="Teachers"
      columns={TeacherColumns}
      data={teacherRows(store)}
      searchKeys={["name", "email", "courses"]}
      filters={TeacherFilters}
    />
  );
}

export default TeachersPage;
