import { TimetableGrid } from "../../components/TimetableGrid";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { useAdminStore } from "../../lib/adminStore";
import { studentPlacement } from "../../mock/people";
import { currentStudentId } from "../../mock/student";

export default function StudentTimetablePage() {
  const store = useAdminStore();
  const section = studentPlacement[currentStudentId]?.section ?? "A";
  const slots = store.scheduleSlots.filter((slot) => slot.sectionCode.endsWith(section));

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Weekly timetable" }]} />
      <div>
        <h1 className="text-2xl font-bold">My weekly timetable</h1>
        <p className="text-sm text-muted-foreground">
          Published class schedule for your section. Class times update when the administrator changes the timetable.
        </p>
      </div>
      <TimetableGrid
        slots={slots}
        subjects={store.subjects}
        onCellClick={() => {}}
        onSlotClick={() => {}}
        readOnly
      />
    </div>
  );
}
