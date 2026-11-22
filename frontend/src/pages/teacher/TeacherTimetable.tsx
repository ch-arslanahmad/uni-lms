import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { teacherSections } from "../../mock/teacher";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function TeacherTimetable() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Timetable" }]} />
      <div>
        <h1 className="text-2xl font-bold">Timetable</h1>
        <p className="text-sm text-muted-foreground">Read-only view of your assigned class schedule.</p>
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
                  return (
                    <TableCell key={day} className="align-top">
                      <div className="space-y-2 min-w-32">
                        {slots.length === 0 ? <span className="text-xs text-muted-foreground">-</span> : slots.map((s) => (
                          <div key={`${day}-${s.id}`} className="rounded-md border bg-blue-50 p-2">
                            <p className="font-medium text-blue-700">{s.section.subjectCode} - {s.section.code}</p>
                            <p className="text-xs text-muted-foreground">{s.schedule}</p>
                            <p className="text-xs text-muted-foreground">{s.section.programCode}</p>
                          </div>
                        ))}
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
