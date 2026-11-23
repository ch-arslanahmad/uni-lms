import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections } from "../../mock/teacher";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function dayName(dateStr: string) {
  const d = new Date(dateStr.replace(" ", "T"));
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "long" });
}

function TeacherTimetable() {
  const { events, activities } = useOutletContext<TeacherContext>();
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Timetable" }]} />
      <div>
        <h1 className="text-2xl font-bold">Timetable</h1>
        <p className="text-sm text-muted-foreground">Assigned class schedule and section events.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Weekly schedule</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>{DAYS.map((d) => <TableHead key={d}>{d}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              <TableRow className="align-top hover:bg-transparent">
                {DAYS.map((day) => {
                  const slots = teacherSections.filter((s) => s.schedule.toLowerCase().includes(day.slice(0, 3).toLowerCase()));
                  const dayEvents = events.filter((e) => teacherSections.some((s) => s.id === e.sectionId) && dayName(e.startAt) === day);
                  return (
                    <TableCell key={day} className="align-top">
                      <div className="space-y-2 min-w-36">
                        {slots.map((s) => (
                          <div key={`${day}-${s.id}`} className="rounded-md border bg-blue-50 p-2">
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
                              <p className="font-medium text-amber-800 flex items-center gap-1">{ev.title} <Badge variant="outline" className="capitalize">{ev.type}</Badge></p>
                              <p className="text-xs text-muted-foreground">{sec ? `${sec.section.subjectCode}-${sec.section.code} · ` : ""}{ev.startAt}{ev.room ? ` · ${ev.room}` : ""}</p>
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
