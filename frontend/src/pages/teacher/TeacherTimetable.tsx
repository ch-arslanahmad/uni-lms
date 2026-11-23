import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections } from "../../mock/teacher";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function parseDate(s: string) {
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // Mon=0
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ date: new Date(year, month, -i), inMonth: false });
  for (let d = 1; d <= last.getDate(); d++) cells.push({ date: new Date(year, month, d), inMonth: true });
  while (cells.length % 7 !== 0) {
    const d = cells.length - startOffset - last.getDate() + 1;
    cells.push({ date: new Date(year, month + 1, d), inMonth: false });
  }
  return cells;
}

function fmtTime(s: string) {
  const d = parseDate(s);
  return d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : s;
}

function TeacherTimetable() {
  const { events, assessments } = useOutletContext<TeacherContext>();
  const [cursor, setCursor] = useState(() => new Date(2026, 10, 1)); // Nov 2026

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Timetable" }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-muted-foreground">Monthly schedule. Recurring class slots repeat on weekdays; assessments and section events appear on their dates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="size-4" /></Button>
          <div className="min-w-40 text-center text-sm font-medium">{monthLabel}</div>
          <Button variant="outline" size="icon" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">{monthLabel}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 border-l border-t">
            {WEEKDAYS.map((d) => (
              <div key={d} className="border-b border-r bg-muted/30 px-2 py-2 text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {cells.map(({ date, inMonth }) => {
              const dayIdx = (date.getDay() + 6) % 7;
              const dayName = FULL_DAYS[dayIdx];
              const slots = teacherSections.filter((s) => s.schedule.toLowerCase().includes(dayName.slice(0, 3).toLowerCase()));
              const dayEvents = events.filter((e) => {
                if (!teacherSections.some((s) => s.id === e.sectionId)) return false;
                const d = parseDate(e.startAt);
                return d ? sameDate(d, date) : false;
              });
              const dayAssessments = assessments.filter((a) => {
                if (!teacherSections.some((s) => s.id === a.sectionId)) return false;
                const d = parseDate(a.dueAt);
                return d ? sameDate(d, date) : false;
              });
              return (
                <div key={date.toISOString()} className={`min-h-28 border-b border-r p-1.5 ${inMonth ? "bg-background" : "bg-muted/10 text-muted-foreground"}`}>
                  <div className={`mb-1 text-xs font-medium ${inMonth ? "" : "opacity-50"}`}>{date.getDate()}</div>
                  <div className="space-y-1">
                    {slots.map((s) => (
                      <div key={`${date.toISOString()}-${s.id}`} className="rounded border bg-blue-50 px-1.5 py-0.5 text-[11px] leading-tight text-blue-700" title={`${s.section.subjectCode}-${s.section.code} ${s.schedule}`}>
                        <span className="font-medium">{s.section.subjectCode}-{s.section.code}</span>
                        <span className="hidden sm:inline"> · {s.schedule.split(" ")[1]}</span>
                      </div>
                    ))}
                    {dayAssessments.map((a) => {
                      const sec = teacherSections.find((s) => s.id === a.sectionId);
                      return (
                        <div key={a.id} className="rounded border bg-emerald-50 px-1.5 py-0.5 text-[11px] leading-tight text-emerald-800" title={`${a.title}${a.physicalRoom ? ` (${a.physicalRoom})` : ""}`}>
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-emerald-700/80 truncate">{sec ? `${sec.section.subjectCode}-${sec.section.code}` : ""}{a.physicalRoom ? ` · ${a.physicalRoom}` : ""}</div>
                          <Badge variant="outline" className="mt-0.5 h-4 px-1 text-[10px] capitalize">{a.category}</Badge>
                        </div>
                      );
                    })}
                    {dayEvents.map((ev) => {
                      const linked = assessments.find((a) => a.id === ev.linkedAssessmentId);
                      const sec = teacherSections.find((s) => s.id === ev.sectionId);
                      return (
                        <div key={ev.id} className="rounded border bg-amber-50 px-1.5 py-0.5 text-[11px] leading-tight text-amber-800" title={`${ev.title}${linked ? ` (Linked: ${linked.title})` : ""}`}>
                          <div className="font-medium truncate">{ev.title}</div>
                          <div className="text-amber-700/80 truncate">{sec ? `${sec.section.subjectCode}-${sec.section.code} · ` : ""}{fmtTime(ev.startAt)}</div>
                          <Badge variant="outline" className="mt-0.5 h-4 px-1 text-[10px] capitalize">{ev.type}</Badge>
                        </div>
                      );
                    })}
                    {slots.length === 0 && dayEvents.length === 0 && dayAssessments.length === 0 && <span className="text-[11px] text-muted-foreground">-</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeacherTimetable;
