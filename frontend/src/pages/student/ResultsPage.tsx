import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { StatMetric } from "../../components/StatMetric";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { calculateCgpa, calculateSgpa, courseResults, offerings, resultTerms, type CourseResult } from "../../mock/student";

const columns: Column<CourseResult>[] = [
  {
    key: "code",
    label: "Course",
    render: (r) => (
      <div>
        <p className="font-medium">{r.code}</p>
        <p className="text-xs text-muted-foreground">{r.title}</p>
      </div>
    ),
  },
  { key: "credits", label: "Credits" },
  {
    key: "percentage",
    label: "Total",
    render: (r) => (r.percentage === null ? "—" : `${r.percentage}%`),
  },
  { key: "letter", label: "Grade" },
  {
    key: "gradePoints",
    label: "Grade points",
    render: (r) => (r.gradePoints === null ? "—" : r.gradePoints.toFixed(2)),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <span className={r.status === "completed" ? "text-emerald-600" : "text-amber-600"}>
        {r.status === "completed" ? "Completed" : "In progress"}
      </span>
    ),
  },
  {
    key: "offeringId",
    label: "Details",
    render: (r) =>
      offerings.some((o) => o.offeringId === r.offeringId) ? (
        <Link to={`/student/courses/${r.offeringId}?view=grades`} className="text-blue-600 hover:underline">
          View
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

function ResultsPage() {
  const terms = useMemo(() => resultTerms(), []);
  const [term, setTerm] = useState("All terms");
  const visibleTerms = term === "All terms" ? terms : terms.filter((t) => t === term);
  const cgpa = calculateCgpa();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Results" }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Results</h1>
          <p className="text-sm text-muted-foreground">Semester grades, SGPA, and CGPA from your academic record.</p>
        </div>
        <Select value={term} onValueChange={(v) => v && setTerm(v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All terms">All terms</SelectItem>
            {terms.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatMetric label="CGPA" value={cgpa === null ? "—" : cgpa.toFixed(2)} highlight />
        <StatMetric label="Completed courses" value={courseResults.filter((r) => r.status === "completed").length} />
        <StatMetric label="In-progress courses" value={courseResults.filter((r) => r.status === "in-progress").length} />
        <StatMetric label="Total credits earned" value={courseResults.filter((r) => r.status === "completed").reduce((s, r) => s + r.credits, 0)} />
      </div>

      {visibleTerms.map((t) => {
        const rows = courseResults.filter((r) => r.term === t);
        const sgpa = calculateSgpa(t);
        return (
          <Card key={t}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>{t}</CardTitle>
              <div className="text-sm text-muted-foreground">
                SGPA: <span className="font-semibold text-foreground">{sgpa === null ? "In progress" : sgpa.toFixed(2)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <SimpleTable columns={columns} data={rows} searchable={false} searchKeys={["code", "title"]} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default ResultsPage;
