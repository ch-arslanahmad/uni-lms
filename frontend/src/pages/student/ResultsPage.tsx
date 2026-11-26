import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { StatMetric } from "../../components/StatMetric";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { courseResults, resultSemesters, offerings, type CourseResult } from "../../mock/student";
import {
  areResultsPublished,
  calculatePublishedCgpa,
  calculatePublishedSemesterGpa,
  publishedCourseResults,
} from "../../api";

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
    render: (r) => (!areResultsPublished(r.sectionId) || r.percentage === null ? "—" : `${r.percentage}%`),
  },
  { key: "letter", label: "Grade", render: (r) => (areResultsPublished(r.sectionId) ? r.letter : "—") },
  {
    key: "gradePoints",
    label: "Grade points",
    render: (r) => (!areResultsPublished(r.sectionId) || r.gradePoints === null ? "—" : r.gradePoints.toFixed(2)),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => {
      if (r.status === "in-progress") return <span className="text-amber-600">In progress</span>;
      if (!areResultsPublished(r.sectionId)) return <span className="text-amber-600">Awaiting publication</span>;
      return <span className="text-emerald-600">Completed</span>;
    },
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
  const semesters = useMemo(() => resultSemesters(), []);
  const [selected, setSelected] = useState<number>(semesters[semesters.length - 1] ?? 1);
  const cgpa = calculatePublishedCgpa();
  const semesterGpa = calculatePublishedSemesterGpa(selected);
  const rows = courseResults.filter((r) => r.semester === selected);
  const published = publishedCourseResults();
  const completedCredits = published
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.credits, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Results" }]} />
      <div>
        <h1 className="text-2xl font-bold">Results</h1>
        <p className="text-sm text-muted-foreground">View your grades by semester, semester GPA, and overall CGPA.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatMetric label="CGPA" value={cgpa === null ? "—" : cgpa.toFixed(2)} highlight />
        <StatMetric label="Semester GPA" value={semesterGpa === null ? "In progress" : semesterGpa.toFixed(2)} />
        <StatMetric label="Completed courses" value={published.filter((r) => r.status === "completed").length} />
        <StatMetric label="Credits earned" value={completedCredits} />
      </div>

      <div className="flex flex-wrap gap-2">
        {semesters.map((semester) => (
          <Button
            key={semester}
            size="sm"
            variant={selected === semester ? "default" : "outline"}
            onClick={() => setSelected(semester)}
          >
            Semester {semester}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Semester {selected}</CardTitle>
          <div className="text-sm text-muted-foreground">
            GPA: <span className="font-semibold text-foreground">{semesterGpa === null ? "In progress" : semesterGpa.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <SimpleTable columns={columns} data={rows} searchable={false} searchKeys={["code", "title"]} />
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultsPage;
