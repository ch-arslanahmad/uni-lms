import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  type ScheduleSlot,
} from "../mock/timetable";
import { useAdminStore } from "../lib/adminStore";
import type { SubjectRow } from "../models";

export interface SlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionCode: string;
  initialDay?: string;
  initialTime?: string;
  editSlot?: ScheduleSlot | null;
  /** Subjects offered to this class (curriculum-filtered by the page). */
  subjectOptions: SubjectRow[];
  /** Store action: returns an error string (e.g. overlap conflict) or null. */
  onSave: (slot: Omit<ScheduleSlot, "id">, id?: number) => string | null;
  onDelete: (id: number) => string | null;
}

export function SlotDialog({
  open,
  onOpenChange,
  sectionCode,
  initialDay,
  initialTime,
  editSlot,
  subjectOptions,
  onSave,
  onDelete,
}: SlotDialogProps) {
  const isEditing = !!editSlot;
  const { users } = useAdminStore();
  const teachers = users.filter((u) => u.role === "teacher");

  const [day, setDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [time, setTime] = useState<string>(TIME_SLOTS[0]);
  const [subjectCode, setSubjectCode] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset the form whenever the dialog opens for a cell or an existing slot.
  useEffect(() => {
    if (open) {
      setDay(editSlot?.dayOfWeek ?? initialDay ?? DAYS_OF_WEEK[0]);
      setTime(editSlot?.timeSlot ?? initialTime ?? TIME_SLOTS[0]);
      setSubjectCode(editSlot?.subjectCode ?? subjectOptions[0]?.code ?? "");
      setTeacherName(editSlot?.teacherName ?? teachers[0]?.name ?? "");
      setRoom(editSlot?.room ?? "");
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editSlot, initialDay, initialTime]);

  const handleSave = () => {
    const result = onSave(
      {
        sectionCode,
        subjectCode,
        teacherName,
        room,
        dayOfWeek: day as ScheduleSlot["dayOfWeek"],
        timeSlot: time,
      },
      editSlot?.id,
    );
    if (result) setError(result);
    else onOpenChange(false);
  };

  const handleDelete = () => {
    if (!editSlot) return;
    const result = onDelete(editSlot.id);
    if (result) setError(result);
    else onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Class Slot" : "Schedule Class Slot"}
          </DialogTitle>
          <DialogDescription>
            Assign a curriculum subject and faculty member for class{" "}
            <span className="font-semibold text-foreground">{sectionCode}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3.5 py-2 text-sm">
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="day" className="text-right text-xs">
              Day
            </Label>
            <select
              id="day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="col-span-3 flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="time" className="text-right text-xs">
              Time Slot
            </Label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3 flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="subject" className="text-right text-xs">
              Subject
            </Label>
            <select
              id="subject"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="col-span-3 flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
            >
              {subjectOptions.length === 0 && (
                <option value="">No curriculum subjects for this class</option>
              )}
              {subjectOptions.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} — {sub.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="teacher" className="text-right text-xs">
              Teacher
            </Label>
            <select
              id="teacher"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="col-span-3 flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="room" className="text-right text-xs">
              Room
            </Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="CS-Lab-1 / Room-204"
              className="col-span-3 h-8 text-xs"
            />
          </div>

          {error && (
            <div className="p-2.5 text-xs rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="mr-auto"
            >
              Remove
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={subjectOptions.length === 0}
          >
            {isEditing ? "Save Changes" : "Create Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
