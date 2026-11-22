import { BookOpen, ClipboardCheck, HelpCircle, CalendarDays, AlertCircle } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { getTeacherProfile, teacherSections } from "../../mock/teacher";

function TeacherDashboard() {
  const { submissions, questions, activities } = useOutletContext<TeacherContext>();
  const teacher = getTeacherProfile();
  const pendingGrading = submissions.filter((s) => s.status === "submitted").length;
  const unanswered = questions.filter((q) => q.status === "pending").length;
  const upcoming = activities
    .filter((a) => a.dueAt >= "2026-11-22" || (a.required && !a.documentName))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 6);

  const stats = [
    { value: teacherSections.length, label: "Assigned Classes", href: "/teacher/classes" },
    { value: pendingGrading, label: "Pending Grading", href: "/teacher/grading" },
    { value: unanswered, label: "Unanswered Questions", href: "/teacher/questions" },
    { value: upcoming.length, label: "Upcoming Activities" },
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
            <CardHeader><CardTitle className="text-base">Upcoming activities</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming activities.</p> : upcoming.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium flex items-center gap-2">{a.title}{a.required && <Badge variant="secondary">Required</Badge>}{a.required && !a.documentName && <Badge variant="secondary" className="gap-1"><AlertCircle className="size-3" />Pending document</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{a.kind} · due {a.dueAt}</p>
                  </div>
                  <Link to={`/teacher/classes/${a.sectionId}`} className="text-blue-600 hover:underline">Open class</Link>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Recent questions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentQuestions.length === 0 ? <p className="text-sm text-muted-foreground">No questions yet.</p> : recentQuestions.map((q) => (
                <Link key={q.id} to="/teacher/questions" className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40">
                  <p className="font-medium line-clamp-1">{q.question}</p>
                  <p className="text-xs text-muted-foreground">{q.askedAt} · <span className="capitalize">{q.status}</span></p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}

export default TeacherDashboard;