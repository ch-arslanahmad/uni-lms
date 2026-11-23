import { useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections, getSectionStudents } from "../../mock/teacher";
import { students } from "../../models";

type ViewMode = "student" | "assessment";
type DisplayStatus = "Submitted" | "Graded" | "Pending" | "Late";

type Row = {
  id: string;
  studentId: number;
  studentName: string;
  studentLabel: string;
  activityId: string;
  activityTitle: string;
  category: string;
  sectionLabel: string;
  dueAt: string;
  submittedAt: string;
  status: DisplayStatus;
  rawStatus: string;
  marks: number | undefined;
  maxMarks: number;
  feedback: string;
};

const TODAY = "2026-11-22";

function displayStatus(raw: string, dueAt: string): DisplayStatus {
  if (raw === "graded" || raw === "locked") return "Graded";
  if (raw === "submitted") return "Submitted";
  return dueAt < TODAY ? "Late" : "Pending";
}

function statusBadgeClass(s: DisplayStatus) {
  if (s === "Graded") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "Submitted") return "bg-blue-100 text-blue-800 border-blue-200";
  if (s === "Late") return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function GradingPage() {
  const { submissions, activities, setSubmissions } = useOutletContext<TeacherContext>();
  const [searchParams] = useSearchParams();
  const initialActivity = searchParams.get("activity") ?? "";

  const [view, setView] = useState<ViewMode>(initialActivity ? "assessment" : "student");
  const [selectedStudent, setSelectedStudent] = useState(String(students[0]?.id ?? ""));
  const [selectedActivity, setSelectedActivity] = useState(initialActivity || activities[0]?.id || "");
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<Row | null>(null);
  const [draftMarks, setDraftMarks] = useState("");
  const [draftFeedback, setDraftFeedback] = useState("");
  const [drawerErr, setDrawerErr] = useState("");

  const rows: Row[] = useMemo(() => submissions.map((sub) => {
    const act = activities.find((a) => a.id === sub.activityId);
    const section = teacherSections.find((s) => s.id === act?.sectionId);
    const stu = students.find((s) => s.id === sub.studentId);
    const dueAt = sub.extensionDueAt ?? act?.dueAt ?? "—";
    return {
      id: sub.id,
      studentId: sub.studentId,
      studentName: stu?.name ?? String(sub.studentId),
      studentLabel: `#${sub.studentId} — ${stu?.name ?? sub.studentId} (${section?.section.subjectCode ?? "—"})`,
      activityId: sub.activityId,
      activityTitle: act?.title ?? sub.activityId,
      category: act?.category ?? "—",
      sectionLabel: section ? `${section.section.subjectCode}-${section.section.code}` : "—",
      dueAt,
      submittedAt: sub.submittedAt ?? "—",
      status: displayStatus(sub.status, dueAt),
      rawStatus: sub.status,
      marks: sub.marks,
      maxMarks: act?.maxMarks ?? 100,
      feedback: sub.feedback ?? "",
    };
  }), [submissions, activities]);

  const scoped = rows.filter((r) => view === "student"
    ? String(r.studentId) === selectedStudent
    : r.activityId === selectedActivity);

  const filtered = scoped.filter((r) => {
    const statusOk = statusFilter === "All" || r.status === statusFilter;
    const q = query.toLowerCase().trim();
    const qOk = !q || (view === "student"
      ? `${r.activityTitle} ${r.sectionLabel} ${r.category}`.toLowerCase().includes(q)
      : `${r.studentName} ${r.studentId}`.toLowerCase().includes(q));
    return statusOk && qOk;
  });

  function openDrawer(row: Row) {
    setDrawer(row);
    setDraftMarks(row.marks != null ? String(row.marks) : "");
    setDraftFeedback(row.feedback);
    setDrawerErr("");
  }

  function saveGrade() {
    if (!drawer) return;
    const marks = Number(draftMarks);
    if (draftMarks.trim() === "" || Number.isNaN(marks) || marks < 0 || marks > drawer.maxMarks) {
      setDrawerErr(`Marks must be between 0 and ${drawer.maxMarks}.`);
      return;
    }
    setSubmissions((prev) => prev.map((s) => s.id === drawer.id ? {
      ...s,
      marks,
      feedback: draftFeedback.trim() || undefined,
      status: "graded",
      updatedBy: "Carol",
      updatedAt: "2026-11-22 18:00",
    } : s));
    setDrawer(null);
  }

  const cols: Column<Row>[] = view === "student"
    ? [
      { key: "activityTitle", label: "Assessment" },
      { key: "category", label: "Category", render: (r) => <Badge variant="outline">{r.category}</Badge> },
      { key: "sectionLabel", label: "Class" },
      { key: "dueAt", label: "Effective Due" },
      { key: "status", label: "Status", render: (r) => <Badge variant="outline" className={statusBadgeClass(r.status)}>{r.status}</Badge> },
      { key: "marks", label: "Marks", render: (r) => <span className="tabular-nums">{r.marks != null ? r.marks : "—"} / {r.maxMarks}</span> },
      { key: "id", label: "Action", sortable: false, headerClassName: "text-right", cellClassName: "text-right", render: (r) => (
        <Button size="sm" variant={r.status === "Graded" ? "ghost" : "outline"} onClick={() => openDrawer(r)}>{r.status === "Graded" ? "Edit" : "Grade"}</Button>
      ) },
    ]
    : [
      { key: "studentName", label: "Student", render: (r) => <div><div className="font-medium">{r.studentName}</div><div className="text-xs text-muted-foreground">#{r.studentId}</div></div> },
      { key: "submittedAt", label: "Submitted At" },
      { key: "dueAt", label: "Effective Due" },
      { key: "status", label: "Status", render: (r) => <Badge variant="outline" className={statusBadgeClass(r.status)}>{r.status}</Badge> },
      { key: "marks", label: "Marks", render: (r) => <span className="tabular-nums">{r.marks != null ? r.marks : "—"} / {r.maxMarks}</span> },
      { key: "id", label: "Action", sortable: false, headerClassName: "text-right", cellClassName: "text-right", render: (r) => (
        <Button size="sm" variant={r.status === "Graded" ? "ghost" : "outline"} onClick={() => openDrawer(r)}>{r.status === "Graded" ? "Edit" : "Grade"}</Button>
      ) },
    ];

  const entityLabel = view === "student" ? "Student" : "Assessment";
  const searchPlaceholder = view === "student" ? "Search assessments or classes..." : "Search students by name or ID...";
  const selectedEntityText = view === "student"
    ? (students.find((s) => String(s.id) === selectedStudent)?.name ?? "student")
    : (activities.find((a) => a.id === selectedActivity)?.title ?? "assessment");

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Grading" }]} />
      <div>
        <h1 className="text-2xl font-bold">Grading</h1>
        <p className="text-sm text-muted-foreground">View one assessment across all students, or all assessments for one student.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>View</Label>
          <div className="flex h-10 rounded-md border p-1 gap-1">
            <Button size="sm" variant={view === "student" ? "secondary" : "ghost"} onClick={() => setView("student")}>By Student</Button>
            <Button size="sm" variant={view === "assessment" ? "secondary" : "ghost"} onClick={() => setView("assessment")}>By Assessment</Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label>{entityLabel}</Label>
          {view === "student" ? (
            <Select value={selectedStudent} onValueChange={(v) => v && setSelectedStudent(v)}>
              <SelectTrigger className="h-10 w-72"><SelectValue /></SelectTrigger>
              <SelectContent>
                {students.map((s) => {
                  const sec = teacherSections.find((ts) => getSectionStudents(ts.id).some((x) => x.id === s.id));
                  return <SelectItem key={s.id} value={String(s.id)}>#{s.id} — {s.name} ({sec?.section.subjectCode ?? "—"})</SelectItem>;
                })}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedActivity} onValueChange={(v) => v && setSelectedActivity(v)}>
              <SelectTrigger className="h-10 w-72"><SelectValue /></SelectTrigger>
              <SelectContent>
                {activities.map((a) => {
                  const sec = teacherSections.find((s) => s.id === a.sectionId);
                  return <SelectItem key={a.id} value={a.id}>{a.title} ({sec?.section.subjectCode ?? "—"})</SelectItem>;
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="h-10 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{["All", "Submitted", "Graded", "Pending", "Late"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-1 flex-1 min-w-64">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-10 pl-9 pr-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} />
            {query && <button type="button" aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" onClick={() => setQuery("")}><X className="size-4" /></button>}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Search className="size-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No {statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}assessments found for {selectedEntityText}.</p>
            <Button variant="outline" size="sm" onClick={() => { setQuery(""); setStatusFilter("All"); }}>Clear filters</Button>
          </div>
        ) : (
          <SimpleTable columns={cols} data={filtered} searchable={false} />
        )}
      </Card>

      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawer(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l bg-background p-6 shadow-xl overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Grade submission</h2>
                <p className="text-sm text-muted-foreground">{drawer.studentName} · {drawer.activityTitle}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDrawer(null)}><X className="size-4" /></Button>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-md border p-3 space-y-1">
                <p><span className="font-medium">Student:</span> {drawer.studentLabel}</p>
                <p><span className="font-medium">Assessment:</span> {drawer.activityTitle}</p>
                <p><span className="font-medium">Class:</span> {drawer.sectionLabel}</p>
                <p><span className="font-medium">Submitted:</span> {drawer.submittedAt}</p>
                <p><span className="font-medium">Due:</span> {drawer.dueAt}</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="drawer-marks">Marks (0 - {drawer.maxMarks})</Label>
                <Input id="drawer-marks" type="number" min={0} max={drawer.maxMarks} value={draftMarks} onChange={(e) => setDraftMarks(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="drawer-feedback">Feedback (optional)</Label>
                <Textarea id="drawer-feedback" value={draftFeedback} onChange={(e) => setDraftFeedback(e.target.value)} placeholder="Optional feedback for student" />
              </div>
              {drawerErr && <p className="text-xs text-red-600">{drawerErr}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDrawer(null)}>Cancel</Button>
                <Button onClick={saveGrade}>Save Grade</Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
