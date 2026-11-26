import { useState, useMemo } from "react";
import FilterDropdown from "../../components/FilterDropdown";
import Tabs from "../../components/Tabs";
import { SearchInput } from "../../components/SearchInput";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Pencil, Trash2, FileSpreadsheet, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAdminStore,
  saveSlot,
  deleteSlot,
  saveDatesheetEntry,
  deleteDatesheetEntry,
  setDatesheetPublished,
  dayOfWeekFor,
} from "../../lib/adminStore";
import { type ScheduleSlot } from "../../mock/timetable";
import {
  academicCalendarMilestones,
  datesheetClassLabel,
  examTypeLabel,
  sectionClassCode,
  sectionIdFromClassCode,
  type ExamDatesheetEntry,
} from "../../mock/calendar";
import { sections } from "../../models";
import { TimetableGrid } from "../../components/TimetableGrid";
import { SlotDialog } from "../../components/SlotDialog";

const datesheetCols: Column<ExamDatesheetEntry>[] = [
  { key: "examType", label: "Exam Type", render: (entry) => examTypeLabel(entry.examType) },
  { key: "examDate", label: "Date" },
  { key: "dayOfWeek", label: "Day" },
  { key: "timeSlot", label: "Time Window" },
  { key: "subjectCode", label: "Course Code" },
  { key: "subjectTitle", label: "Course Title" },
  { key: "sectionId", label: "Class Section", render: (entry) => datesheetClassLabel(entry) },
];

export default function TimetablePage() {
  const store = useAdminStore();
  const { departments, programs } = store;

  const [activeTab, setActiveTab] = useState<"timetable" | "datesheet" | "milestones">("timetable");
  const [dept, setDept] = useState(departments[0]?.code ?? "CS");
  const filteredPrograms = useMemo(
    () => programs.filter((p) => p.departmentCode === dept),
    [dept, programs],
  );
  const [prog, setProg] = useState(filteredPrograms[0]?.code ?? "BSCS");
  const [semester, setSemester] = useState("5");
  const [section, setSection] = useState("A");

  // Datesheet search & filter
  const [datesheetSearch, setDatesheetSearch] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("ALL");

  // Slots come from the shared store, filtered to the selected class.
  const classCode = `${prog}-${semester}${section}`;
  const slots = useMemo(
    () => store.scheduleSlots.filter((s) => s.sectionCode === classCode),
    [store.scheduleSlots, classCode],
  );

  // Subjects offered to this class: its curriculum semester, plus any
  // subject already scheduled (so existing slots stay editable).
  const subjectOptions = useMemo(() => {
    const curriculumCodes = new Set(
      store.programCurriculums
        .filter((c) => c.programCode === prog && c.semesterNumber === Number(semester))
        .map((c) => c.subjectCode),
    );
    slots.forEach((s) => curriculumCodes.add(s.subjectCode));
    return store.subjects.filter((s) => curriculumCodes.has(s.code));
  }, [store.programCurriculums, store.subjects, prog, semester, slots]);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  // Datesheet editing state
  const [datesheetDialogOpen, setDatesheetDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExamDatesheetEntry | null>(null);
  const [entryForm, setEntryForm] = useState({
    examType: "midterm" as ExamDatesheetEntry["examType"],
    subjectCode: "",
    subjectTitle: "",
    sectionId: sectionIdFromClassCode(classCode) ?? sections[0]?.id ?? 0,
    examDate: "",
    timeSlot: "",
  });
  const [entryErr, setEntryErr] = useState("");

  function openEntryDialog(entry?: ExamDatesheetEntry) {
    setEditingEntry(entry ?? null);
    setEntryForm(entry ? {
      examType: entry.examType,
      subjectCode: entry.subjectCode,
      subjectTitle: entry.subjectTitle,
      sectionId: entry.sectionId,
      examDate: entry.examDate,
      timeSlot: entry.timeSlot,
    } : {
      examType: "midterm", subjectCode: "", subjectTitle: "",
      sectionId: sectionIdFromClassCode(classCode) ?? sections[0]?.id ?? 0, examDate: "", timeSlot: "",
    });
    setEntryErr("");
    setDatesheetDialogOpen(true);
  }

  function saveEntry() {
    const error = saveDatesheetEntry(entryForm, editingEntry?.id);
    if (error) { setEntryErr(error); return; }
    setDatesheetDialogOpen(false);
  }

  const entryActionsColumn: Column<ExamDatesheetEntry> = {
    key: "id",
    id: "actions",
    label: "Actions",
    render: (entry) => (
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" title="Edit exam entry" onClick={() => openEntryDialog(entry)}>
          <Pencil size={14} />
        </Button>
        <Button size="icon" variant="ghost" title="Delete exam entry" onClick={() => deleteDatesheetEntry(entry.id)}>
          <Trash2 size={14} />
        </Button>
      </div>
    ),
  };

  const filteredDatesheet = useMemo(() => {
    return store.examDatesheet
      .filter((entry) => examTypeFilter === "ALL" || entry.examType.toUpperCase() === examTypeFilter.toUpperCase())
      .filter(
        (entry) =>
          entry.subjectCode.toLowerCase().includes(datesheetSearch.toLowerCase()) ||
          entry.subjectTitle.toLowerCase().includes(datesheetSearch.toLowerCase()) ||
          datesheetClassLabel(entry).toLowerCase().includes(datesheetSearch.toLowerCase()),
      );
  }, [examTypeFilter, datesheetSearch, store.examDatesheet]);

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
            Weekly class schedule matrix, midterm & final exam datesheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "datesheet" && (
            <>
              <span className="text-xs text-muted-foreground">
                {store.datesheetPublished
                  ? "Published to teachers and students"
                  : "Draft — not visible yet"}
              </span>
              <Button
                size="sm"
                variant={store.datesheetPublished ? "outline" : "default"}
                onClick={() => setDatesheetPublished(!store.datesheetPublished)}
              >
                {store.datesheetPublished ? "Retract datesheet" : "Publish datesheet"}
              </Button>
            </>
          )}
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
                      {slots.length === 0
                        ? `No classes scheduled for ${classCode} yet — click a cell to add one`
                        : "Click on any empty cell or slot card to manage schedules"}
                    </span>
                  </div>

                  <TimetableGrid
                    slots={slots}
                    subjects={store.subjects}
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
                  <Button size="sm" className="gap-1.5" onClick={() => openEntryDialog()}>
                    <Plus size={15} /> Add exam entry
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Showing {filteredDatesheet.length} scheduled exam papers
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Edits stay in draft until you publish the datesheet.
                  </span>
                </div>

                <SimpleTable
                  columns={[...datesheetCols, entryActionsColumn]}
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

      <Dialog open={datesheetDialogOpen} onOpenChange={setDatesheetDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit exam entry" : "Add exam entry"}</DialogTitle>
            <DialogDescription>
              Set the date and window for a midterm or final paper. Teachers and students see it after the datesheet is published.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Exam type</Label>
              <Select
                value={entryForm.examType}
                onValueChange={(value) => setEntryForm((prev) => ({ ...prev, examType: value as ExamDatesheetEntry["examType"] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Class section</Label>
              <Select
                value={String(entryForm.sectionId)}
                onValueChange={(value) => setEntryForm((prev) => ({ ...prev, sectionId: Number(value) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {sectionClassCode(item)} · {item.subjectCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Course</Label>
              <Select
                value={entryForm.subjectCode}
                onValueChange={(value) => {
                  const subject = store.subjects.find((s) => s.code === value);
                  setEntryForm((prev) => ({ ...prev, subjectCode: value ?? "", subjectTitle: subject?.title ?? prev.subjectTitle }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {store.subjects.map((subject) => (
                    <SelectItem key={subject.code} value={subject.code}>
                      {subject.code} — {subject.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Course title</Label>
              <Input
                value={entryForm.subjectTitle}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, subjectTitle: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Exam date</Label>
              <Input
                type="date"
                value={entryForm.examDate}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, examDate: event.target.value }))}
              />
              {entryForm.examDate && dayOfWeekFor(entryForm.examDate) && (
                <p className="text-[11px] text-muted-foreground">{dayOfWeekFor(entryForm.examDate)}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Time window</Label>
              <Input
                value={entryForm.timeSlot}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, timeSlot: event.target.value }))}
                placeholder="09:00 - 11:00"
              />
            </div>
          </div>
          {entryErr && <p className="text-xs text-red-600">{entryErr}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDatesheetDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEntry}>{editingEntry ? "Save entry" : "Add entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* shadcn Dialog Component */}
      <SlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectionCode={classCode}
        initialDay={selectedDay}
        initialTime={selectedTime}
        editSlot={editingSlot}
        subjectOptions={subjectOptions}
        onSave={saveSlot}
        onDelete={deleteSlot}
      />
    </div>
  );
}
