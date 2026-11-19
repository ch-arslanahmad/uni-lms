import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Brand + columns */}
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <a href="/" className="flex items-center gap-2 text-slate-900">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <span className="text-base font-bold tracking-tight">
                Uni LMS
              </span>
            </a>
            <p className="text-xs text-muted-foreground max-w-45">
              A university LMS to manage courses, departments, sections, and
              users.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-10">
            {/* Academics */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Academics
              </p>
              <ul className="flex flex-col gap-1.5">
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Courses
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Departments
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Semester
                  </a>
                </li>
              </ul>
            </div>

            {/* People */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                People
              </p>
              <ul className="flex flex-col gap-1.5">
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Teachers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Students
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Users
                  </a>
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Admin
              </p>
              <ul className="flex flex-col gap-1.5">
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Timetable
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Import CSV
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Uni LMS — University of Lahore. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
