import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { teacherSections } from "../../mock/teacher";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
function TeacherTimetable() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Timetable" }]} />
      <div>
        <h1 className="text-2xl font-bold">Timetable</h1>
        <p className="text-sm text-muted-foreground">Read-only view of your assigned recurring class schedule. Schedule creation/editing is admin-owned (FR19).</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Weekly schedule</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead><tr className="border-b">{DAYS.map(d => <th key={d} className="p-2 text-left font-medium">{d}</th>)}</tr></thead>
            <tbody>
              <tr className="align-top">
                {DAYS.map((day) => {
                  const slots = teacherSections.filter((s) => s.schedule.toLowerCase().includes(day.slice(0,3).toLowerCase()));
                  return (
                    <td key={day} className="p-2 border-r last:border-r-0 min-h-24">
                      <div className="space-y-2">
                        {slots.length === 0 ? <span className="text-xs text-muted-foreground">-</span> : slots.map((s) => (
                          <div key={`${day}-${s.id}`} className="rounded-md border bg-blue-50 p-2">
                            <p className="font-medium text-blue-700">{s.section.subjectCode} - {s.section.code}</p>
                            <p className="text-xs text-muted-foreground">{s.schedule}</p>
                            <p className="text-xs text-muted-foreground">{s.section.programCode}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeacherTimetable;