import { useState, useMemo } from "react";
import FilterDropdown from "../../components/FilterDropdown";
import Tabs from "../../components/Tabs";
import { SearchInput } from "../../components/SearchInput";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Plus, FileSpreadsheet, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { departments, programs } from "../../models";
import {
  initialScheduleSlots,
  type ScheduleSlot,
} from "../../mock/timetable";
import {
  mockExamDatesheet,
  academicCalendarMilestones,
  type ExamDatesheetEntry,
} from "../../mock/calendar";
import { TimetableGrid } from "../../components/TimetableGrid";
import { SlotDialog } from "../../components/SlotDialog";

const datesheetCols: Column<ExamDatesheetEntry>[] = [
  { key: "examType", label: "Exam Type" },
  { key: "examDate", label: "Date" },
  { key: "dayOfWeek", label: "Day" },
  { key: "timeSlot", label: "Time Window" },
  { key: "subjectCode", label: "Course Code" },
  { key: "subjectTitle", label: "Course Title" },
  { key: "classSection", label: "Class Section" },
];

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState<"timetable" | "datesheet" | "milestones">("timetable");
  const [dept, setDept] = useState(departments[0]?.code ?? "CS");
  const filteredPrograms = useMemo(
    () => programs.filter((p) => p.departmentCode === dept),
    [dept],
  );
  const [prog, setProg] = useState(filteredPrograms[0]?.code ?? "BSCS");
  const [semester, setSemester] = useState("5");
  const [section, setSection] = useState("A");

  // Datesheet search & filter
  const [datesheetSearch, setDatesheetSearch] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("ALL");

  // Slots state (preloaded with realistic sample data)
  const [slots] = useState<ScheduleSlot[]>(initialScheduleSlots);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  const classCode = `${prog}-${semester}${section}`;

  const filteredDatesheet = useMemo(() => {
    return mockExamDatesheet
      .filter((entry) => examTypeFilter === "ALL" || entry.examType.toUpperCase() === examTypeFilter.toUpperCase())
      .filter(
        (entry) =>
          entry.subjectCode.toLowerCase().includes(datesheetSearch.toLowerCase()) ||
          entry.subjectTitle.toLowerCase().includes(datesheetSearch.toLowerCase()) ||
          entry.classSection.toLowerCase().includes(datesheetSearch.toLowerCase()),
      );
  }, [examTypeFilter, datesheetSearch]);

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
          <h1 className="text-2xl font-bold">Schedule & Datesheet</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Weekly class schedule matrix, midterm & final exam datesheets (FR19)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/data-transfer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileSpreadsheet size={14} />
              Import CSV
            </Button>
          </Link>
          {activeTab === "timetable" && (
            <Button size="sm" onClick={handleCreateNew} className="gap-1.5">
              <Plus size={15} />
              Schedule Class Slot
            </Button>
          )}
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={(next) => {
          setActiveTab(next);
          setDatesheetSearch("");
        }}
        tabs={[
          {
            id: "timetable",
            label: "Weekly Class Timetable",
            content: (
              <div className="flex flex-col gap-4">
                {/* Class Selectors */}
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
                      Active Class: {classCode}
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
              </div>
            ),
          },
          {
            id: "datesheet",
            label: "Exam Datesheet",
            content: (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={datesheetSearch} onChange={setDatesheetSearch} />
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <span className="text-muted-foreground text-xs">Filter Exam:</span>
                      <FilterDropdown
                        filters={["ALL", "MIDTERM", "FINAL"]}
                        value={examTypeFilter}
                        onChange={setExamTypeFilter}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Showing {filteredDatesheet.length} scheduled exam papers
                  </span>
                </div>

                <SimpleTable
                  columns={datesheetCols}
                  data={filteredDatesheet}
                  paginated={false}
                />
              </div>
            ),
          },
          {
            id: "milestones",
            label: "Semester Milestones",
            content: (
              <div className="flex flex-col gap-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {academicCalendarMilestones.map((m, idx) => (
                    <Card key={m.id} size="sm" className="bg-card shadow-xs">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Phase {idx + 1}
                          </span>
                          <span className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1">
                            <CalendarIcon size={12} />
                            {m.startDate} → {m.endDate}
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold mt-1 text-foreground">
                          {m.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 leading-relaxed">
                          {m.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* shadcn Dialog Component */}
      <SlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectionCode={classCode}
        initialDay={selectedDay}
        initialTime={selectedTime}
        editSlot={editingSlot}
      />
    </div>
  );
}
