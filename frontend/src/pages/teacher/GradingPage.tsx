import { useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { SearchInput } from "../../components/SearchInput";
import FilterSelect from "../../components/FilterSelect";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Badge } from "../../components/ui/badge";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections } from "../../mock/teacher";
import { students } from "../../models";

type Row = { id: string; student: string; activity: string; section: string; dueAt: string; status: string; marks: string; activityId: string };

function GradingPage() {
  const { submissions, activities } = useOutletContext<TeacherContext>();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(searchParams.get("activity") ? "All" : "submitted");
  const activityFilter = searchParams.get("activity") ?? "All";

  const rows: Row[] = useMemo(() => submissions.map((sub) => {
    const act = activities.find((a) => a.id === sub.activityId);
    const section = teacherSections.find((s) => s.id === act?.sectionId);
    const stu = students.find((s) => s.id === sub.studentId);
    return {
      id: sub.id, student: stu?.name ?? String(sub.studentId), activity: act?.title ?? sub.activityId, section: section ? `${section.section.subjectCode}-${section.section.code}` : "—",
      dueAt: sub.extensionDueAt ?? act?.dueAt ?? "—", status: sub.status, marks: sub.marks != null ? `${sub.marks}/${act?.maxMarks ?? ""}` : "—", activityId: sub.activityId,
    };
  }), [submissions, activities]);

  const filtered = rows.filter((r) => {
    const q = `${r.student} ${r.activity} ${r.section}`.toLowerCase().includes(query.toLowerCase());
    const sOk = status === "All" || r.status === status;
    const aOk = activityFilter === "All" || r.activityId === activityFilter;
    return q && sOk && aOk;
  });

  const cols: Column<Row>[] = [
    { key: "student", label: "Student" },
    { key: "activity", label: "Activity" },
    { key: "section", label: "Class" },
    { key: "dueAt", label: "Effective due" },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "submitted" ? "secondary" : r.status === "locked" ? "outline" : "default"} className="capitalize">{r.status}</Badge> },
    { key: "marks", label: "Marks" },
    { key: "id", label: "", render: (r) => <Link to={`/teacher/grading/${r.id}`} className="text-blue-600 hover:underline">Open</Link> },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Grading" }]} />
      <div><h1 className="text-2xl font-bold">Grading Queue</h1><p className="text-sm text-muted-foreground">Assigned classes only. Publish locks submission; corrections update current grade metadata only.</p></div>
      <div className="flex flex-wrap gap-3">
        <FilterSelect filters={["All", "submitted", "graded", "locked", "not-submitted"]} value={status} onChange={setStatus} />
        <SearchInput value={query} onChange={setQuery} placeholder="Search student or activity" />
      </div>
      <SimpleTable columns={cols} data={filtered} searchable={false} searchKeys={["student"]} />
    </div>
  );
}

export default GradingPage;