import { GraduationCap, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Footer from "../Footer";
import { Badge } from "../ui/badge";
import { LoadingState, ErrorState } from "../AsyncStates";
import { useRequireRole } from "../../auth/AuthContext";
import { Role } from "../../models";
import {
  getTeacherProfile,
  mockApi,
  TEACHER_SNAPSHOT_KEY,
  useApiQuery,
  type AssessmentAnswer,
  type AssessmentAttempt,
  type AssessmentQuestion,
  type GradeCategory,
  type SectionResultState,
  type TeacherAnnouncement,
  type TeacherAssessment,
  type TeacherEvent,
  type TeacherMaterial,
  type TeacherProject,
  type TeacherQuestion,
  type TeacherSnapshot,
  type TeacherSubmission,
} from "../../api";

export interface TeacherContext {
  assessments: TeacherAssessment[];
  setAssessments: React.Dispatch<React.SetStateAction<TeacherAssessment[]>>;
  submissions: TeacherSubmission[];
  setSubmissions: React.Dispatch<React.SetStateAction<TeacherSubmission[]>>;
  questions: TeacherQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<TeacherQuestion[]>>;
  materials: TeacherMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<TeacherMaterial[]>>;
  announcements: TeacherAnnouncement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<TeacherAnnouncement[]>>;
  events: TeacherEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TeacherEvent[]>>;
  assessmentQuestions: AssessmentQuestion[];
  setAssessmentQuestions: React.Dispatch<React.SetStateAction<AssessmentQuestion[]>>;
  assessmentAttempts: AssessmentAttempt[];
  setAssessmentAttempts: React.Dispatch<React.SetStateAction<AssessmentAttempt[]>>;
  assessmentAnswers: AssessmentAnswer[];
  setAssessmentAnswers: React.Dispatch<React.SetStateAction<AssessmentAnswer[]>>;
  categories: GradeCategory[];
  setCategories: React.Dispatch<React.SetStateAction<GradeCategory[]>>;
  resultStates: SectionResultState[];
  setResultStates: React.Dispatch<React.SetStateAction<SectionResultState[]>>;
  projects: TeacherProject[];
  setProjects: React.Dispatch<React.SetStateAction<TeacherProject[]>>;
}


// Phase 1 persistence: the API returns a fresh snapshot, then local edits replay
// on top of it. Phase 2 replaces this with real API mutations.
function hydrate(fresh: TeacherSnapshot): TeacherSnapshot {
  try {
    const raw = localStorage.getItem(TEACHER_SNAPSHOT_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Partial<TeacherSnapshot>;
    const merged = { ...fresh };
    for (const key of Object.keys(fresh) as (keyof TeacherSnapshot)[]) {
      if (Array.isArray(saved[key])) (merged[key] as unknown[]) = saved[key] as unknown[];
    }
    return merged;
  } catch {
    return fresh;
  }
}

function TeacherLayout() {
  const teacher = getTeacherProfile();
  const guard = useRequireRole(Role.teacher);
  const snapshot = useApiQuery(() => mockApi.loadTeacherSnapshot());

  const [assessments, setAssessments] = useState<TeacherAssessment[]>([]);
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [materials, setMaterials] = useState<TeacherMaterial[]>([]);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>([]);
  const [events, setEvents] = useState<TeacherEvent[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentAttempts, setAssessmentAttempts] = useState<AssessmentAttempt[]>([]);
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [resultStates, setResultStates] = useState<SectionResultState[]>([]);
  const [projects, setProjects] = useState<TeacherProject[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!snapshot.data) return;
    const data = hydrate(snapshot.data);
    setAssessments(data.assessments);
    setSubmissions(data.submissions);
    setQuestions(data.questions);
    setMaterials(data.materials);
    setAnnouncements(data.announcements);
    setEvents(data.events);
    setAssessmentQuestions(data.assessmentQuestions);
    setAssessmentAttempts(data.assessmentAttempts);
    setAssessmentAnswers(data.assessmentAnswers);
    setCategories(data.categories);
    setResultStates(data.resultStates);
    setProjects(data.projects);
    setHydrated(true);
  }, [snapshot.data]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(TEACHER_SNAPSHOT_KEY, JSON.stringify({
        assessments, submissions, questions, materials, announcements, events,
        assessmentQuestions, assessmentAttempts, assessmentAnswers,
        categories, resultStates, projects,
      } satisfies TeacherSnapshot));
    } catch {
      // Storage quota can be reached by large demo attachments; keep the in-memory session usable.
    }
  }, [hydrated, assessments, submissions, questions, materials, announcements, events,
    assessmentQuestions, assessmentAttempts, assessmentAnswers, categories, resultStates, projects]);

  const pendingGrading = useMemo(() => submissions.filter((s) => s.status === "submitted").length, [submissions]);
  const pendingQuestions = useMemo(() => questions.filter((q) => q.status === "pending").length, [questions]);

  if (guard) return <>{guard}</>;
  if (snapshot.error) return <ErrorState message={snapshot.error} onRetry={snapshot.retry} />;
  if (snapshot.loading || !snapshot.data || !hydrated) return <LoadingState label="Loading teacher workspace…" />;

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
          <div className="hidden items-center gap-2 text-sm font-medium sm:flex"><UserRound className="size-4 text-muted-foreground" />{teacher?.name ?? "Teacher"}</div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet
          context={{
            assessments, setAssessments,
            submissions, setSubmissions,
            questions, setQuestions,
            materials, setMaterials,
            announcements, setAnnouncements,
            events, setEvents,
            assessmentQuestions, setAssessmentQuestions,
            assessmentAttempts, setAssessmentAttempts,
            assessmentAnswers, setAssessmentAnswers,
            categories, setCategories,
            resultStates, setResultStates,
            projects, setProjects,
          } satisfies TeacherContext}
        />
      </main>
      <Footer />
    </div>
  );
}

export default TeacherLayout;
