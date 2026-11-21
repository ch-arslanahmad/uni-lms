// Admin dashboard — composes the generic Dashboard shell with admin-specific data.

import Dashboard from "../../components/Dashboard";
import type { QuickAction } from "../../models";
import {
  adminStats,
  users,
  departments,
  type DepartmentRow,
} from "../../models";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Building2, BookOpen, Upload, Users } from "lucide-react";

// Icons live here, not in models.ts (models stays icon-free)
const quickActions: QuickAction[] = [
  { label: "Courses", icon: BookOpen, href: "/admin/academics" },
  { label: "Departments", icon: Building2, href: "/admin/academics" },
  { label: "All Users", icon: Users, href: "/admin/users" },
  { label: "Import & Export", icon: Upload, href: "/admin/data-transfer" },
];

const admin = users.find((u) => u.role === "admin") ?? users[0];

// Department table columns — declared here since only this page uses them
const departmentColumns: Column<DepartmentRow>[] = [
  { key: "code", label: "Department Code" },
  { key: "name", label: "Department" },
  { key: "courses", label: "Total Courses" },
  { key: "teachers", label: "Teachers" },
  { key: "students", label: "Students" },
];

function AdminDashboard() {
  return (
    <Dashboard
      name={admin.name}
      subtitle="Admin Dashboard"
      stats={adminStats}
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
