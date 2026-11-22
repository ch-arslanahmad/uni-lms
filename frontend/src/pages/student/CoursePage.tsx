import { Link, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { findOffering, grades, type GradeRow } from "../../mock/student";
import { students } from "../../models";

const gradeColumns: Column<GradeRow>[] = [
  { key: "title", label: "Assessment" },
  { key: "kind", label: "Type" },
  { key: "raw", label: "Marks obtained" },
  { key: "max", label: "Max marks" },
  { key: "weight", label: "Weightage %", render: (r) => `${r.weight}%` },
  { key: "raw", label: "Weighted marks", render: (r) => ((r.raw / r.max) * r.weight).toFixed(2) },
];

function CoursePage() {
  const { offeringId } = useParams();
  const [params] = useSearchParams();
  const offering = findOffering(offeringId);
  const view = params.get("view") ?? "course";

  if (!offering) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card><CardContent className="py-12 text-center">Course not found.</CardContent></Card>
      </div>
    );
  }

  const tabs = [
    { label: "Course", value: "course", to: `/student/courses/${offering.offeringId}` },
    { label: "Participants", value: "participants", to: `/student/courses/${offering.offeringId}?view=participants` },
    { label: "Grades", value: "grades", to: `/student/courses/${offering.offeringId}?view=grades` },
  ];

  const gradeRows = grades.filter((g) => g.course === offering.code);
  const total = gradeRows.reduce((sum, r) => sum + (r.raw / r.max) * r.weight, 0);
  const gpa = (total / 100) * 4;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[
        { label: "My courses", to: "/student/courses" },
        { label: `${offering.code}-${offering.section}` },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{offering.code} - {offering.title}</h1>
        <p className="text-sm text-muted-foreground">{offering.section} - {offering.term}</p>
      </div>

      <nav className="flex flex-wrap gap-1 border-b">
        {tabs.map((tab) => (
          <Link key={tab.value} to={tab.to}>
            <Button variant={view === tab.value ? "default" : "ghost"} size="sm">
              {tab.label}
            </Button>
          </Link>
        ))}
      </nav>

      {view === "participants" ? (
        <Card>
          <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
          <CardContent>
            <SimpleTable
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "section", label: "Section" },
              ]}
              data={students.slice(0, 6)}
              searchable
              searchKeys={["name", "email"]}
            />
          </CardContent>
        </Card>
      ) : view === "grades" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-sm">Weighted total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{total.toFixed(2)}%</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">GPA contribution</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{gpa.toFixed(2)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Credit hours</CardTitle></CardHeader><CardContent className="text-2xl font-bold">4</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Assessment breakdown</CardTitle></CardHeader>
            <CardContent>
              <SimpleTable columns={gradeColumns} data={gradeRows} searchable={false} searchKeys={["title"]} />
              <p className="mt-3 text-xs text-muted-foreground">
                Weighted marks = (obtained / max) x weightage. GPA contribution = weighted total / 25.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {offering.announcements.map((a) => (
                  <div key={a.title} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                    <p className="text-sm">{a.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Course Objective</CardTitle></CardHeader>
                <CardContent className="text-sm">{offering.objective}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Time Table</CardTitle></CardHeader>
                <CardContent className="text-sm">{offering.timetable}</CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Course Outline & Material</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {offering.materials.map((m) => (
                <a
                  key={m.name}
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${m.name}\nMock file for ${offering.code}`)}`}
                  download={m.name}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                >
                  {m.name} <span className="text-muted-foreground">({m.size})</span>
                </a>
              ))}
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-lg font-bold">Weekly sections</h2>
            <div className="space-y-2">
              {offering.weeks.map((week) => (
                <details
                  key={week.range}
                  open={week.current}
                  className={`rounded-lg border px-4 py-3 ${week.current ? "border-blue-300 bg-blue-500/5" : ""}`}
                >
                  <summary className="cursor-pointer font-medium">
                    {week.range} {week.current && <span className="ml-2 rounded bg-blue-500 px-2 py-0.5 text-xs text-white">Current week</span>}
                  </summary>
                  <div className="mt-3 space-y-2">
                    {week.activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No activities this week.</p>
                    ) : week.activities.map((a) => (
                      <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium">{a.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.kind} - Opened {a.opened} - Due {a.due}{a.closed ? ` - Closes ${a.closed}` : ""}
                          </p>
                        </div>
                        <Link to={a.kind === "quiz" ? `/student/quizzes/${a.id}` : `/student/assignments/${a.id}`}>
                          <Button size="xs" variant="outline">{a.kind === "quiz" ? "View quiz" : "View activity"}</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CoursePage;
