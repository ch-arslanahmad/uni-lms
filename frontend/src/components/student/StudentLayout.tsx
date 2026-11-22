import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Footer from "../Footer";
import { Badge } from "../ui/badge";

import {
  currentStudentId,
  studentQuestions as seedQuestions,
  type StudentQuestion,
} from "../../mock/student";
import { students } from "../../models";

export interface StudentQuestionsContext {
  questions: StudentQuestion[];
  markRead: (id: string) => Promise<void>;
  saveQuestion: (input: {
    contextType: "event" | "course";
    contextLabel: string;
    contextTo: string;
    question: string;
  }) => void;
  unreadCount: number;
}

function StudentLayout() {
  const student = students.find((s) => s.id === currentStudentId);
  const [questions, setQuestions] = useState<StudentQuestion[]>(seedQuestions);
  const unreadCount = questions.filter((q) => q.answer && !q.readAt).length;

  async function markRead(id: string) {
    // Mock endpoint: sets read_at for this question only after "request" succeeds.
    await Promise.resolve();
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id && q.answer && !q.readAt
          ? { ...q, readAt: new Date().toISOString() }
          : q,
      ),
    );
  }

  function saveQuestion(input: {
    contextType: "event" | "course";
    contextLabel: string;
    contextTo: string;
    question: string;
  }) {
    const text = input.question.trim();
    if (!text) return;
    setQuestions((prev) => [
      {
        id: `sq-${Date.now()}`,
        question: text,
        askedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        contextType: input.contextType,
        contextLabel: input.contextLabel,
        contextTo: input.contextTo,
      },
      ...prev,
    ]);
  }

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
                { label: "Dashboard", to: "/student", end: true },
                { label: "My courses", to: "/student/courses", end: false },
                { label: "My questions", to: "/student/questions", end: false },
              ].map(({ label, to, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-500/10 text-blue-600"
                          : "text-muted-foreground hover:bg-slate-100"
                      }`
                    }
                  >
                    {label}
                    {label === "My questions" && unreadCount > 0 && (
                      <Badge className="rounded-full bg-blue-500 text-white hover:bg-blue-500">
                        {unreadCount}
                      </Badge>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-1">
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
        <Outlet
          context={
            {
              questions,
              markRead,
              saveQuestion,
              unreadCount,
            } satisfies StudentQuestionsContext
          }
        />
      </main>
      <Footer />
    </div>
  );
}

export default StudentLayout;
