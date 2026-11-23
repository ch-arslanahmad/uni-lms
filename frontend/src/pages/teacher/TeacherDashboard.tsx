import { BookOpen, ClipboardCheck, HelpCircle, CalendarDays, AlertCircle } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { getTeacherProfile, teacherSections } from "../../mock/teacher";

function TeacherDashboard() {
  const { submissions, questions, assessments } = useOutletContext<TeacherContext>();
  const navigate = useNavigate();
  const teacher = getTeacherProfile();
  const pendingGrading = submissions.filter((s) => s.status === "submitted").length;
  const unanswered = questions.filter((q) => q.status === "pending").length;
  const upcoming = assessments
    .filter((a) => a.dueAt >= "2026-11-22" || (a.required && !a.documentName))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 6);

  const stats = [
    { value: teacherSections.length, label: "Assigned Classes", href: "/teacher/classes" },
    { value: pendingGrading, label: "Pending Grading", href: "/teacher/grading" },
    { value: unanswered, label: "Unanswered Questions", href: "/teacher/questions" },
    { value: upcoming.length, label: "Upcoming Assessments", href: "/teacher/classes" },
  ];

  const recentQuestions = questions.slice(0, 5);

  return (
    <Dashboard
      name={teacher?.name ?? "Teacher"}
      subtitle="Teacher Dashboard - Assigned classes overview"
      stats={stats}
      quickActions={[
        { label: "My Classes", icon: BookOpen, href: "/teacher/classes" },
        { label: "Grading Queue", icon: ClipboardCheck, href: "/teacher/grading" },
        { label: "Questions", icon: HelpCircle, href: "/teacher/questions" },
        { label: "Timetable", icon: CalendarDays, href: "/teacher/timetable" },
      ]}
      tableSlot={
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming assessments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming assessments.</p> : upcoming.map((a) => {
                const sec = teacherSections.find((s) => s.id === a.sectionId);
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/40">
                    <Link to={`/teacher/classes/${a.sectionId}`} className="min-w-0 flex-1">
                      <p className="font-medium flex items-center gap-2">{a.title}{a.required && <Badge variant="secondary">Required</Badge>}{a.required && !a.documentName && <Badge variant="secondary" className="gap-1"><AlertCircle className="size-3" />Pending document</Badge>}</p>
                      <p className="text-xs text-muted-foreground">{sec ? `${sec.section.subjectCode} - ${sec.section.code} · ` : ""}{a.kind} · due {a.dueAt}</p>
                    </Link>
                    <div className="flex items-center gap-1 ml-3">
                      <button type="button" title="Grading" aria-label="Grading" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => navigate(`/teacher/grading?assessment=${a.id}`)}><ClipboardCheck className="size-4" /></button>
                      <button type="button" title="Open class" aria-label="Open class" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => navigate(`/teacher/classes/${a.sectionId}`)}><BookOpen className="size-4" /></button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Recent questions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentQuestions.length === 0 ? <p className="text-sm text-muted-foreground">No questions yet.</p> : recentQuestions.map((q) => {
                const sec = teacherSections.find((s) => s.id === q.sectionId);
                return (
                  <Link key={q.id} to="/teacher/questions" className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40">
                    <p className="font-medium line-clamp-1">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{sec ? `${sec.section.subjectCode} - ${sec.section.code} · ` : ""}{q.askedAt} · <span className="capitalize">{q.status}</span></p>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}

export default TeacherDashboard;