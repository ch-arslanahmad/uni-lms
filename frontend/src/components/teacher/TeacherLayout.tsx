import { GraduationCap } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Footer from "../Footer";
import { Badge } from "../ui/badge";
import { getTeacherProfile } from "../../mock/teacher";
import {
  gradeCategories as seedCategories,
  sectionResultStates as seedResultStates,
  teacherActivities as seedActivities,
  teacherAnnouncements as seedAnnouncements,
  teacherMaterials as seedMaterials,
  teacherQuestions as seedQuestions,
  teacherSubmissions as seedSubmissions,
  type GradeCategory,
  type SectionResultState,
  type TeacherActivity,
  type TeacherAnnouncement,
  type TeacherMaterial,
  type TeacherQuestion,
  type TeacherSubmission,
} from "../../mock/teacher";

export interface TeacherContext {
  activities: TeacherActivity[];
  setActivities: React.Dispatch<React.SetStateAction<TeacherActivity[]>>;
  submissions: TeacherSubmission[];
  setSubmissions: React.Dispatch<React.SetStateAction<TeacherSubmission[]>>;
  questions: TeacherQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<TeacherQuestion[]>>;
  materials: TeacherMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<TeacherMaterial[]>>;
  announcements: TeacherAnnouncement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<TeacherAnnouncement[]>>;
  categories: GradeCategory[];
  setCategories: React.Dispatch<React.SetStateAction<GradeCategory[]>>;
  resultStates: SectionResultState[];
  setResultStates: React.Dispatch<React.SetStateAction<SectionResultState[]>>;
}

function TeacherLayout() {
  const teacher = getTeacherProfile();
  const [activities, setActivities] = useState<TeacherActivity[]>(seedActivities);
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>(seedSubmissions);
  const [questions, setQuestions] = useState<TeacherQuestion[]>(seedQuestions);
  const [materials, setMaterials] = useState<TeacherMaterial[]>(seedMaterials);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>(seedAnnouncements);
  const [categories, setCategories] = useState<GradeCategory[]>(seedCategories);
  const [resultStates, setResultStates] = useState<SectionResultState[]>(seedResultStates);

  const pendingGrading = useMemo(() => submissions.filter((s) => s.status === "submitted").length, [submissions]);
  const pendingQuestions = useMemo(() => questions.filter((q) => q.status === "pending").length, [questions]);

  const nav = [
    { label: "Dashboard", to: "/teacher", end: true, badge: 0 },
    { label: "My classes", to: "/teacher/classes", end: false, badge: 0 },
    { label: "Grading", to: "/teacher/grading", end: false, badge: pendingGrading },
    { label: "Questions", to: "/teacher/questions", end: false, badge: pendingQuestions },
    { label: "Timetable", to: "/teacher/timetable", end: false, badge: 0 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/teacher" className="flex items-center gap-2 font-bold">
              <GraduationCap className="size-5 text-blue-500" />
              Uni LMS
            </Link>
            <ul className="flex items-center gap-1">
              {nav.map(({ label, to, end, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-blue-500/10 text-blue-600" : "text-muted-foreground hover:bg-slate-100"
                      }`
                    }
                  >
                    {label}
                    {badge > 0 && <Badge className="rounded-full bg-blue-500 text-white hover:bg-blue-500">{badge}</Badge>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden text-sm font-medium sm:block">{teacher?.name ?? "Teacher"}</div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet
          context={{
            activities, setActivities,
            submissions, setSubmissions,
            questions, setQuestions,
            materials, setMaterials,
            announcements, setAnnouncements,
            categories, setCategories,
            resultStates, setResultStates,
          } satisfies TeacherContext}
        />
      </main>
      <Footer />
    </div>
  );
}

export default TeacherLayout;