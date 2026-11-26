import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Clock, ListTodo } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { StatMetric } from "../../components/StatMetric";
import { SearchInput } from "../../components/SearchInput";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  activityLabel,
  activityPath,
  allActivities,
  currentStudentId,
  offerings,
  type Activity,
} from "../../mock/student";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import { calculatePublishedCgpa } from "../../api";
import { students } from "../../models";

const MONTH = "November 2026";
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

function dueTone(a: Activity) {
  if (a.due < "2026-11-22") return { label: `Past due - ${a.due}`, className: "text-red-600" };
  if (a.due <= "2026-11-24") return { label: `Due soon - ${a.due}`, className: "text-amber-600" };
  return { label: `Due ${a.due}`, className: "text-emerald-600" };
}

function StudentDashboard() {
  const { questions } = useOutletContext<StudentQuestionsContext>();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Due date");
  const [timeframe, setTimeframe] = useState("Next 7 days");
  const [courseFilter, setCourseFilter] = useState("All courses");
  const [calendarView, setCalendarView] = useState<"month" | "full">("month");
  const [showAll, setShowAll] = useState(false);

  const student = students.find((s) => s.id === currentStudentId);

  const activities = useMemo(() => {
    const today = "2026-11-22";
    const cutoff = timeframe === "Next 7 days" ? "2026-11-29" : timeframe === "Next 30 days" ? "2026-12-22" : null;
    const filtered = allActivities().filter(
      (a) =>
        !a.submitted &&
        a.title.toLowerCase().includes(query.toLowerCase()) &&
        (!cutoff || (a.due >= today && a.due <= cutoff)) &&
        (courseFilter === "All courses" ||
          offerings.some(
            (o) =>
              o.weeks.some((w) => w.activities.some((x) => x.id === a.id)) &&
              o.code === courseFilter,
          )),
    );
    return sort === "Title"
      ? [...filtered].sort((a, b) => a.title.localeCompare(b.title))
      : [...filtered].sort((a, b) => a.due.localeCompare(b.due));
  }, [query, sort, courseFilter, timeframe]);

  const owned = allActivities().filter((a) => !a.submitted);
  const done = allActivities().filter((a) => a.submitted);
  const enrolled = new Set(
    offerings.flatMap((o) => o.weeks.flatMap((w) => w.activities.map((a) => a.id))),
  ).size;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Hello <span className="text-blue-500">{student?.name ?? "Student"}</span>
          </h1>
          <p className="text-sm text-muted-foreground">Fall 2026 - Your work at a glance</p>
        </div>
        <Link to="/student/results">
          <Button variant="outline" size="sm">View results</Button>
        </Link>
      </div>

      {offerings.length === 0 && (
        <Card>
          <CardHeader><CardTitle>No courses enrolled</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You are not enrolled in any course offerings yet. Once enrollment is published, your activities, grades and calendar will appear here.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link to="/student/courses">
          <StatMetric label="Courses Enrolled" value={offerings.length} />
        </Link>
        <Link to="/student/results">
          <StatMetric label="CGPA" value={calculatePublishedCgpa()?.toFixed(2) ?? "—"} />
        </Link>
        <StatMetric label="Activities Completed" value={done.length} />
        <StatMetric label="Activities Due" value={owned.length} highlight />
      </div>

      <div className="space-y-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="size-4" /> Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Select value={timeframe} onValueChange={(v) => v && setTimeframe(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Next 7 days", "Next 30 days", "All"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => v && setSort(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Due date", "Title"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SearchInput value={query} onChange={setQuery} placeholder="Search activities" />
            </div>

            {activities.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activities match this view.
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {(showAll ? activities : activities.slice(0, 5)).map((a) => {
                    const to = activityPath(a);
                    const hasResponse = questions.some((q) => q.contextTo === to && q.answer && !q.readAt);
                    return (
                      <li key={a.id}>
                        <Link
                          to={to}
                          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 hover:bg-muted/50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{a.title}</p>
                            <p className="text-xs text-muted-foreground">{activityLabel(a)}</p>
                            <p className={`flex items-center gap-1 text-xs ${dueTone(a).className}`}>
                              <Clock className="size-3" /> {dueTone(a).label}
                            </p>
                            {hasResponse && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-blue-600">
                                <span className="size-1.5 rounded-full bg-blue-500" /> Response received
                              </p>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${dueTone(a).className}`}>Pending</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {activities.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? <>Show less <ChevronUp className="size-4" /></> : <>Show all ({activities.length}) <ChevronDown className="size-4" /></>}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4" /> Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={courseFilter} onValueChange={(v) => v && setCourseFilter(v)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["All courses", ...offerings.map((o) => o.code)].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center gap-1 text-sm font-medium">
                <Button variant="ghost" size="icon-sm" aria-label="Previous month" disabled title="Mock data: November 2026 only">
                  &lt;
                </Button>
                {MONTH}
                <Button variant="ghost" size="icon-sm" aria-label="Next month" disabled title="Mock data: November 2026 only">
                  &gt;
                </Button>
              </div>
            </div>
            <div className="flex gap-1">
              {(["month", "full"] as const).map((view) => (
                <Button
                  key={view}
                  size="xs"
                  variant={calendarView === view ? "default" : "outline"}
                  onClick={() => setCalendarView(view)}
                >
                  {view === "month" ? "Month" : "Full view"}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="font-semibold text-muted-foreground">{d}</span>
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {DAYS.map((day) => {
                const events = allActivities().filter((a) => a.due.endsWith(`-11-${String(day).padStart(2, "0")}`));
                const visible = courseFilter === "All courses"
                  ? events
                  : events.filter((a) =>
                      offerings.some((o) => o.code === courseFilter && o.weeks.some((w) => w.activities.some((x) => x.id === a.id))),
                    );
                return (
                  <div key={day} className="min-h-14 rounded border p-1 text-left">
                    <span className="text-xs font-medium">{day}</span>
                    {(calendarView === "month" ? visible.slice(0, 2) : visible).map((a) => (
                      <Link
                        key={a.id}
                        to={activityPath(a)}
                        title={a.title}
                        className="mt-0.5 block truncate rounded bg-blue-500/15 px-1 text-[10px] text-blue-700"
                      >
                        {a.title}
                      </Link>
                    ))}
                    {calendarView === "month" && visible.length > 2 && (
                      <p className="mt-0.5 px-1 text-[10px] text-muted-foreground">+{visible.length - 2} more</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        {enrolled} distinct activity links seeded from mock data.
      </p>
    </div>
  );
}

export default StudentDashboard;
