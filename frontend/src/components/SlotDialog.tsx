import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  type ScheduleSlot,
} from "../mock/timetable";
import { subjects, teachers } from "../models";

export interface SlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionCode: string;
  initialDay?: string;
  initialTime?: string;
  editSlot?: ScheduleSlot | null;
}

export function SlotDialog({
  open,
  onOpenChange,
  sectionCode,
  initialDay,
  initialTime,
  editSlot,
}: SlotDialogProps) {
  const isEditing = !!editSlot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Class Slot" : "Schedule Class Slot"}
          </DialogTitle>
          <DialogDescription>
            Assign a curriculum subject, faculty member, and room for cohort{" "}
            <span className="font-semibold text-foreground">{sectionCode}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Presentational Form (No functionality for now as requested) */}
        <div className="grid gap-3.5 py-2 text-sm">
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="day" className="text-right text-xs">
              Day
            </Label>
            <select
              id="day"
              defaultValue={editSlot?.dayOfWeek ?? initialDay ?? DAYS_OF_WEEK[0]}
              className="col-span-3 flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
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
              defaultValue={editSlot?.timeSlot ?? initialTime ?? TIME_SLOTS[0]}
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
              defaultValue={editSlot?.subjectCode ?? subjects[0]?.code}
              className="col-span-3 flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
            >
              {subjects.slice(0, 15).map((sub) => (
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
              defaultValue={editSlot?.teacherName ?? teachers[0]?.name}
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
              Room / Lab
            </Label>
            <Input
              id="room"
              defaultValue={editSlot?.room ?? "CS-Lab-1"}
              placeholder="e.g. CS-Lab-2 or Room-301"
              className="col-span-3 h-8 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onOpenChange(false)}
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
            onClick={() => onOpenChange(false)}
          >
            {isEditing ? "Save Changes" : "Create Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
