// Admin dashboard — composes the generic Dashboard shell with admin-specific data.

import Dashboard from "../../components/Dashboard";
import type { QuickAction } from "../../models";
import { adminStats, users, departments } from "../../models";
import { DataTable } from "../../components/data-table/data-table";
import { departmentColumns } from "../../components/data-table/department-columns";
import {
  GraduationCap,
  Building2,
  BookOpen,
  Upload,
  Users,
} from "lucide-react";

// Icons live here, not in models.ts (models stays icon-free)
const quickActions: QuickAction[] = [
  { label: "Courses",            icon: BookOpen,      href: "" },
  // { label: "Sections",           icon: Layers,        href: "" }, // as sections are of students users of course you know.
  { label: "Departments",        icon: Building2,     href: "" },
  { label: "Semester",           icon: GraduationCap, href: "" }, // holds academic calender (fall, spring, summer) as there are defined start/end dates for each semester.
  { label: "All Users",          icon: Users,         href: "" }, // holds all users (students, instructors, admins) and their roles.
  { label: "Import CSV",         icon: Upload,        href: "" }, // able to import users, courses, sections, etc. from CSV files.
];

const admin = users.find((u) => u.role === "admin") ?? users[0];

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
          <DataTable
            columns={departmentColumns}
            data={departments}
            searchColumn="name"
            searchPlaceholder="Filter departments..."
          />
        </>
      }
    />
  );
}

export default AdminDashboard;
