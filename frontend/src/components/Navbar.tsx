import { useState } from "react";
import { GraduationCap, Menu, X, LogIn } from "lucide-react";
import type { User } from "../models";
import { NavLink } from "react-router-dom";

const navlinks = [
  { label: "Dashboard", href: "/" },
  { label: "Users", href: "/admin/users" },
  { label: "Academics", href: "/admin/academics" },
  { label: "Timetable & Datesheet", href: "/admin/timetable" },
  { label: "Import/Export", href: "/admin/data-transfer" },
];

function Navbar({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-blue-500">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Uni LMS
          </span>
          <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:inline">
            {user.role}
          </span>
        </NavLink>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navlinks.map((link) => (
            <li key={link.href}>
              <NavLink
                to={link.href}
                end={link.href === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop action */}
        <div className="hidden md:block">
          <NavLink
            to="/login"
            className="mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            Login
          </NavLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col items-center border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1 w-full">
            {navlinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  end={link.href === "/"}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors text-center ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <NavLink
            to="/login"
            className="mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <LogIn className="h-4 w-4" />
            Login
          </NavLink>
        </div>
      )}
    </header>
  );
}

export default Navbar;
