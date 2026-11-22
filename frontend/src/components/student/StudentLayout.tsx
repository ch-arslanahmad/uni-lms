import { Bell, GraduationCap, Mail } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Footer from "../Footer";
import { Button } from "../ui/button";
import { currentStudentId } from "../../mock/student";
import { students } from "../../models";

function StudentLayout() {
  const student = students.find((s) => s.id === currentStudentId);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/student" className="flex items-center gap-2 font-bold">
              <GraduationCap className="size-5 text-blue-500" />
              Uni LMS
            </Link>
            <ul className="flex items-center gap-1">
              {[
                { label: "Dashboard", to: "/student" },
                { label: "My courses", to: "/student/courses" },
              ].map(({ label, to }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-500/10 text-blue-600"
                          : "text-muted-foreground hover:bg-slate-100"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title="Notifications">
              <Bell />
            </Button>
            <Button variant="ghost" size="icon" title="Messages">
              <Mail />
            </Button>
            <div className="ml-1 flex items-center gap-2 border-l pl-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {student?.name.slice(0, 2).toUpperCase() ?? "ST"}
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                {student?.name ?? "Student"}
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default StudentLayout;
