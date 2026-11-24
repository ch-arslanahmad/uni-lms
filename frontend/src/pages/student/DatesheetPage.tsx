import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAdminStore } from "../../lib/adminStore";
import type { ExamDatesheetEntry } from "../../mock/calendar";
import { studentPlacement } from "../../mock/people";
import { currentStudentId } from "../../mock/student";

const columns: Column<ExamDatesheetEntry>[] = [
  { key: "examType", label: "Exam" },
  { key: "subjectCode", label: "Course" },
  { key: "subjectTitle", label: "Title" },
  { key: "examDate", label: "Date" },
  { key: "dayOfWeek", label: "Day" },
  { key: "timeSlot", label: "Time" },
  { key: "classSection", label: "Class" },
];

export default function DatesheetPage({ standalone = false }: { standalone?: boolean }) {
  const store = useAdminStore();
  const section = studentPlacement[currentStudentId]?.section ?? "A";
  const entries = store.examDatesheet.filter((entry) => entry.classSection.endsWith(section));

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
      {!standalone && <Breadcrumbs items={[{ label: "Exam datesheet" }]} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Midterm & final datesheet</h1>
          <p className="text-sm text-muted-foreground">
            {store.datesheetPublished
              ? "Published by the administrator. Teachers use the same dates as preparation deadlines."
              : "The administrator has not published the datesheet yet."}
          </p>
        </div>
        {standalone && (
          <Link to="/student/datesheet" className="text-sm text-blue-600 hover:underline">
            Open student area
          </Link>
        )}
      </div>

      {!store.datesheetPublished ? (
        <Card>
          <CardHeader><CardTitle>Not published yet</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Check back once the administrator releases the midterm and final schedule.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Scheduled papers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No papers scheduled for your class yet.</p>
            ) : (
              <SimpleTable columns={columns} data={entries} paginated={false} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
