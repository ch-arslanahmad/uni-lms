import { useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { SearchInput } from "../../components/SearchInput";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections } from "../../mock/teacher";
import { students } from "../../models";

type Row = { id: string; student: string; studentId: number; activity: string; category: string; section: string; dueAt: string; status: string; marks: string; activityId: string };

function GradingPage() {
  const { submissions, activities } = useOutletContext<TeacherContext>();
  const [searchParams] = useSearchParams();
  const initialActivity = searchParams.get("activity") ?? "";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialActivity ? "All" : "submitted");
  const [view, setView] = useState<"activity" | "student">(initialActivity ? "activity" : "activity");
  const [selectedActivity, setSelectedActivity] = useState(initialActivity || activities[0]?.id || "");
  const [selectedStudent, setSelectedStudent] = useState(String(students[0]?.id ?? ""));

  const rows: Row[] = useMemo(() => submissions.map((sub) => {
    const act = activities.find((a) => a.id === sub.activityId);
    const section = teacherSections.find((s) => s.id === act?.sectionId);
    const stu = students.find((s) => s.id === sub.studentId);
    return {
      id: sub.id, student: stu?.name ?? String(sub.studentId), studentId: sub.studentId, activity: act?.title ?? sub.activityId, category: act?.category ?? "—", section: section ? `${section.section.subjectCode}-${section.section.code}` : "—",
      dueAt: sub.extensionDueAt ?? act?.dueAt ?? "—", status: sub.status, marks: sub.marks != null ? `${sub.marks}/${act?.maxMarks ?? ""}` : "—", activityId: sub.activityId,
    };
  }), [submissions, activities]);

  const filtered = rows.filter((r) => {
    const q = `${r.student} ${r.activity} ${r.section} ${r.category}`.toLowerCase().includes(query.toLowerCase());
    const sOk = status === "All" || r.status === status;
    const scopeOk = view === "activity" ? r.activityId === (selectedActivity || activities[0]?.id) : String(r.studentId) === (selectedStudent || String(students[0]?.id ?? ""));
    return q && sOk && scopeOk;
  });

  const cols: Column<Row>[] = view === "activity"
    ? [
      { key: "student", label: "Student" },
      { key: "section", label: "Class" },
      { key: "dueAt", label: "Effective due" },
      { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "submitted" ? "secondary" : r.status === "locked" ? "outline" : "default"} className="capitalize">{r.status}</Badge> },
      { key: "marks", label: "Marks" },
      { key: "id", label: "", render: (r) => <Link to={`/teacher/grading/${r.id}`} className="text-blue-600 hover:underline">Open</Link> },
    ]
    : [
      { key: "activity", label: "Assessment" },
      { key: "category", label: "Category" },
      { key: "section", label: "Class" },
      { key: "dueAt", label: "Effective due" },
      { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "submitted" ? "secondary" : r.status === "locked" ? "outline" : "default"} className="capitalize">{r.status}</Badge> },
      { key: "marks", label: "Marks" },
      { key: "id", label: "", render: (r) => <Link to={`/teacher/grading/${r.id}`} className="text-blue-600 hover:underline">Open</Link> },
    ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Grading" }]} />
      <div><h1 className="text-2xl font-bold">Grading</h1><p className="text-sm text-muted-foreground">View one assessment across all students, or all assessments for one student.</p></div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label>View</Label>
          <div className="flex rounded-md border p-1 gap-1">
            <Button size="sm" variant={view === "activity" ? "secondary" : "ghost"} onClick={() => setView("activity")}>One assessment</Button>
            <Button size="sm" variant={view === "student" ? "secondary" : "ghost"} onClick={() => setView("student")}>One student</Button>
          </div>
        </div>
        {view === "activity" ? (
          <div className="space-y-1">
            <Label>Assessment</Label>
            <Select value={selectedActivity || activities[0]?.id || ""} onValueChange={(v) => v && setSelectedActivity(v)}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Select assessment" /></SelectTrigger>
              <SelectContent>{activities.map((a) => <SelectItem key={a.id} value={a.id}>{a.title} ({a.category})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1">
            <Label>Student</Label>
            <Select value={selectedStudent || String(students[0]?.id ?? "")} onValueChange={(v) => v && setSelectedStudent(v)}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>{students.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{["All", "submitted", "graded", "locked", "not-submitted"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-56"><SearchInput value={query} onChange={setQuery} placeholder="Search..." /></div>
      </div>
      <SimpleTable columns={cols} data={filtered} searchable={false} searchKeys={["student"]} />
    </div>
  );
}

export default GradingPage;