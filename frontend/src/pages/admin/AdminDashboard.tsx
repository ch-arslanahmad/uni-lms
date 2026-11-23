// Admin dashboard — composes the generic Dashboard shell with admin-specific data.

import Dashboard from "../../components/Dashboard";
import type { QuickAction, StatCardInfo, DepartmentRow } from "../../models";
import { useAdminStore, departmentRowsWithCounts, teacherRows, studentRows } from "../../lib/adminStore";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Building2, BookOpen, Upload, Users } from "lucide-react";

// Icons live here, not in models.ts (models stays icon-free)
const quickActions: QuickAction[] = [
  { label: "Courses", icon: BookOpen, href: "/admin/academics?tab=courses" },
  { label: "Departments", icon: Building2, href: "/admin/academics?tab=departments" },
  { label: "All Users", icon: Users, href: "/admin/users" },
  { label: "Import & Export", icon: Upload, href: "/admin/data-transfer" },
];

// Department table columns — declared here since only this page uses them
const departmentColumns: Column<DepartmentRow>[] = [
  { key: "code", label: "Department Code" },
  { key: "name", label: "Department" },
  { key: "courses", label: "Total Courses" },
  { key: "teachers", label: "Teachers" },
  { key: "students", label: "Students" },
];

function AdminDashboard() {
  const store = useAdminStore();
  const departments = departmentRowsWithCounts(store);
  const admin = store.users.find((u) => u.role === "admin") ?? store.users[0];

  const stats: StatCardInfo[] = [
    { value: departments.length, label: "Departments", href: "/admin/academics?tab=departments" },
    { value: store.subjects.length, label: "Courses", href: "/admin/academics?tab=courses" },
    { value: teacherRows(store).length, label: "Teachers", href: "/admin/teachers" },
    { value: studentRows(store).length, label: "Students", href: "/admin/students" },
  ];

  return (
    <Dashboard
      name={admin.name}
      subtitle="Admin Dashboard"
      stats={stats}
      quickActions={quickActions}
      tableSlot={
        <>
          <h2 className="text-xl font-bold">Departments</h2>
          <SimpleTable
            columns={departmentColumns}
            data={departments.slice(0, 5)}
            searchable={false}
            searchKeys={["name"]}
          />
        </>
      }
    />
  );
}

export default AdminDashboard;
