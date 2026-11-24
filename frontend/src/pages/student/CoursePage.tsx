import { useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import { activityLabel, activityPath, findOffering, grades, type GradeRow } from "../../mock/student";
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
  const { questions, saveQuestion } = useOutletContext<StudentQuestionsContext>();
  const offering = findOffering(offeringId);
  const view = params.get("view") ?? "course";
  const [askOpen, setAskOpen] = useState(params.get("ask") === "1");
  const [courseNote, setCourseNote] = useState("");
  const [courseNoteSaved, setCourseNoteSaved] = useState("");

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{offering.code} - {offering.title}</h1>
          <p className="text-sm text-muted-foreground">{offering.section} - {offering.term}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAskOpen((v) => !v)}>
          <MessageCircleQuestion className="size-4" /> Ask instructor
        </Button>
      </div>

      {askOpen && (
        <Card>
          <CardHeader><CardTitle>Ask instructor</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="course-note">Your question</Label>
            <Textarea id="course-note" value={courseNote} onChange={(e) => setCourseNote(e.target.value)} placeholder="Ask one clear question, if needed" />
            <p className="text-xs text-muted-foreground">Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                const text = courseNote.trim();
                if (!text) return;
                saveQuestion({ contextType: "course", contextLabel: `${offering.code}-${offering.section} - ${offering.title}`, contextTo: `/student/courses/${offering.offeringId}`, question: text });
                setCourseNoteSaved(text);
                setCourseNote("");
              }}>Send question</Button>
              {courseNoteSaved && <span className="self-center text-xs text-muted-foreground">Question sent. Check My questions for replies.</span>}
            </div>
            {(() => {
              const courseQuestions = questions.filter((q) => q.contextTo === `/student/courses/${offering.offeringId}`);
              if (courseQuestions.length === 0) return null;
              return (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Your questions for this course</p>
                  {courseQuestions.map((q) => {
                    const status = q.answer && !q.readAt ? "Answered (new)" : q.answer ? "Read" : "Pending";
                    return (
                      <div key={q.id} className="rounded border px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{q.question}</p>
                          <span className={`shrink-0 text-xs ${status === "Answered (new)" ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>{status}</span>
                        </div>
                        {q.answer ? (
                          <div className="mt-2 text-muted-foreground">
                            <p><span className="font-medium text-foreground">{q.responderName}:</span> {q.answer}</p>
                            <p className="mt-1 text-xs">{q.answeredAt}</p>
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">No reply yet.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

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
                <CardContent className="text-sm">
                  {offering.timetable ? (
                    <ul className="space-y-1">
                      {offering.timetable.split(" · ").map((slot) => (
                        <li key={slot}>{slot}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No schedule set yet.</p>
                  )}
                </CardContent>
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
                    ) : week.activities.map((a) => {
                      const to = activityPath(a);
                      const hasResponse = questions.some((q) => q.contextTo === to && q.answer && !q.readAt);
                      const tone = a.submitted
                        ? "text-emerald-600"
                        : a.due < "2026-11-22"
                          ? "text-red-600"
                          : a.due <= "2026-11-24"
                            ? "text-amber-600"
                            : "text-muted-foreground";
                      const status = a.submitted ? "Submitted" : a.due < "2026-11-22" ? "Past due" : "Open";
                      return (
                        <Link
                          key={a.id}
                          to={to}
                          className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-sm hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{a.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activityLabel(a)} - Opened {a.opened} - Due {a.due}{a.closed ? ` - Closes ${a.closed}` : ""}
                            </p>
                            {hasResponse && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-blue-600">
                                <span className="size-1.5 rounded-full bg-blue-500" /> Response received
                              </p>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${tone}`}>{status}</span>
                        </Link>
                      );
                    })}
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
