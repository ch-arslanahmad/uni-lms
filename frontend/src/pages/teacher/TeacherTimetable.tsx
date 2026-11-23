import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections } from "../../mock/teacher";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function parseDate(s: string) {
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtTime(s: string) {
  const d = parseDate(s);
  return d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : s;
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function TeacherTimetable() {
  const { events, activities } = useOutletContext<TeacherContext>();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date("2026-11-23T00:00:00")));

  const weekDays = useMemo(() => DAYS.map((name, i) => ({ name, date: addDays(weekStart, i) })), [weekStart]);
  const weekEnd = addDays(weekStart, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Timetable" }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-muted-foreground">Weekly assigned schedule and section events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setWeekStart((w) => addDays(w, -7))}><ChevronLeft className="size-4" /></Button>
          <div className="min-w-44 text-center text-sm font-medium">{fmtDay(weekStart)} - {fmtDay(weekEnd)}, {weekEnd.getFullYear()}</div>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setWeekStart((w) => addDays(w, 7))}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Weekly schedule</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {weekDays.map((d) => (
                  <TableHead key={d.name}>
                    <div>{d.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">{fmtDay(d.date)}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="align-top hover:bg-transparent">
                {weekDays.map(({ name, date }) => {
                  const slots = teacherSections.filter((s) => s.schedule.toLowerCase().includes(name.slice(0, 3).toLowerCase()));
                  const dayEvents = events.filter((e) => {
                    if (!teacherSections.some((s) => s.id === e.sectionId)) return false;
                    const d = parseDate(e.startAt);
                    return d ? sameDate(d, date) : false;
                  });
                  return (
                    <TableCell key={name} className="align-top">
                      <div className="space-y-2 min-w-36">
                        {slots.map((s) => (
                          <div key={`${name}-${s.id}`} className="rounded-md border bg-blue-50 p-2">
                            <p className="font-medium text-blue-700">{s.section.subjectCode} - {s.section.code}</p>
                            <p className="text-xs text-muted-foreground">{s.schedule}</p>
                            <p className="text-xs text-muted-foreground">{s.section.programCode}</p>
                          </div>
                        ))}
                        {dayEvents.map((ev) => {
                          const linked = activities.find((a) => a.id === ev.linkedActivityId);
                          const sec = teacherSections.find((s) => s.id === ev.sectionId);
                          return (
                            <div key={ev.id} className="rounded-md border bg-amber-50 p-2">
                              <p className="font-medium text-amber-800 flex items-center gap-1 flex-wrap">{ev.title} <Badge variant="outline" className="capitalize">{ev.type}</Badge></p>
                              <p className="text-xs text-muted-foreground">{sec ? `${sec.section.subjectCode}-${sec.section.code} · ` : ""}{fmtTime(ev.startAt)}{ev.endAt && ev.endAt !== ev.startAt ? `-${fmtTime(ev.endAt)}` : ""}{ev.room ? ` · ${ev.room}` : ""}</p>
                              {linked && <p className="text-xs text-muted-foreground">Linked: {linked.title}</p>}
                            </div>
                          );
                        })}
                        {slots.length === 0 && dayEvents.length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeacherTimetable;
