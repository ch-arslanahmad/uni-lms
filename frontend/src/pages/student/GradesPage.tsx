import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { findOffering, grades, type GradeRow } from "../../mock/student";

const columns: Column<GradeRow>[] = [
  { key: "title", label: "Assessment" },
  { key: "kind", label: "Type" },
  { key: "raw", label: "Marks obtained" },
  { key: "max", label: "Max marks" },
  { key: "weight", label: "Weightage %", render: (r) => `${r.weight}%` },
  {
    key: "raw",
    label: "Weighted marks",
    render: (r) => ((r.raw / r.max) * r.weight).toFixed(2),
  },
];

function GradesPage() {
  const { offeringId } = useParams();
  const offering = findOffering(offeringId);
  if (!offering) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Course not found.</div>;
  }
  const rows = grades.filter((g) => g.course === offering.code);
  const total = rows.reduce((sum, r) => sum + (r.raw / r.max) * r.weight, 0);
  const gpa = (total / 100) * 4;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[
        { label: "My courses", to: "/student/courses" },
        { label: offering.code, to: `/student/courses/${offering.offeringId}` },
        { label: "Grades" },
      ]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{offering.code} · Grades</h1>
          <p className="text-sm text-muted-foreground">{offering.title}</p>
        </div>
        <Link to={`/student/courses/${offering.offeringId}`}>
          <Button variant="outline" size="sm">Back to course</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Weighted total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{total.toFixed(2)}%</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">GPA contribution</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{gpa.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Credit hours</CardTitle></CardHeader><CardContent className="text-2xl font-bold">4</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Assessment breakdown</CardTitle></CardHeader>
        <CardContent>
          <SimpleTable columns={columns} data={rows} searchable={false} searchKeys={["title"]} />
          <p className="mt-3 text-xs text-muted-foreground">
            Weighted marks = (obtained / max) × weightage. GPA contribution = weighted total ÷ 25.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default GradesPage;
