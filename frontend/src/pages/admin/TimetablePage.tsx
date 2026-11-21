import { useState, useMemo } from "react";
import FilterDropdown from "../../components/FilterDropdown";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { departments, programs } from "../../models";
import {
  initialScheduleSlots,
  type ScheduleSlot,
} from "../../mock/timetable";
import { TimetableGrid } from "../../components/TimetableGrid";
import { SlotDialog } from "../../components/SlotDialog";

export default function TimetablePage() {
  const [dept, setDept] = useState(departments[0]?.code ?? "CS");
  const filteredPrograms = useMemo(
    () => programs.filter((p) => p.departmentCode === dept),
    [dept],
  );
  const [prog, setProg] = useState(filteredPrograms[0]?.code ?? "BSCS");
  const [semester, setSemester] = useState("5");
  const [section, setSection] = useState("A");

  // Slots state (preloaded with realistic sample data)
  const [slots] = useState<ScheduleSlot[]>(initialScheduleSlots);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  const cohortCode = `${prog}-${semester}${section}`;

  const handleCellClick = (day: string, time: string) => {
    setEditingSlot(null);
    setSelectedDay(day);
    setSelectedTime(time);
    setDialogOpen(true);
  };

  const handleSlotClick = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setSelectedDay(slot.dayOfWeek);
    setSelectedTime(slot.timeSlot);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingSlot(null);
    setSelectedDay(undefined);
    setSelectedTime(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 gap-4 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">Class Timetable</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Weekly class schedule matrix, room allocation, and faculty assignments (FR19)
          </p>
        </div>

        <Button size="sm" onClick={handleCreateNew} className="gap-1.5">
          <Plus size={15} />
          Schedule Class Slot
        </Button>
      </div>

      {/* Cohort Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/30 border rounded-lg text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-muted-foreground text-xs">Dept:</span>
            <FilterDropdown
              filters={departments.map((d) => d.code)}
              value={dept}
              onChange={(next) => {
                setDept(next);
                const nextP = programs.find((p) => p.departmentCode === next);
                if (nextP) setProg(nextP.code);
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-muted-foreground text-xs">Program:</span>
            <FilterDropdown
              filters={filteredPrograms.map((p) => p.code)}
              value={prog}
              onChange={setProg}
            />
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-muted-foreground text-xs">Semester:</span>
            <FilterDropdown
              filters={["1", "2", "3", "4", "5", "6", "7", "8"]}
              value={semester}
              onChange={setSemester}
            />
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-muted-foreground text-xs">Section:</span>
            <FilterDropdown
              filters={["A", "B", "C"]}
              value={section}
              onChange={setSection}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
            Active Cohort: {cohortCode}
          </span>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Weekly Schedule Matrix
          </span>
          <span className="text-[11px] text-muted-foreground">
            Click on any empty cell or slot card to manage schedules
          </span>
        </div>

        <TimetableGrid
          slots={slots}
          onCellClick={handleCellClick}
          onSlotClick={handleSlotClick}
        />
      </div>

      {/* shadcn Dialog Component */}
      <SlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectionCode={cohortCode}
        initialDay={selectedDay}
        initialTime={selectedTime}
        editSlot={editingSlot}
      />
    </div>
  );
}
