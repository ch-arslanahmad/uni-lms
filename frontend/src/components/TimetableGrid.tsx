import { Plus, User as UserIcon } from "lucide-react";
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  type ScheduleSlot,
} from "../mock/timetable";
import type { SubjectRow } from "../models";

export interface TimetableGridProps {
  slots: ScheduleSlot[];
  subjects: SubjectRow[];
  onCellClick: (day: string, time: string) => void;
  onSlotClick: (slot: ScheduleSlot) => void;
  readOnly?: boolean;
}

export function TimetableGrid({
  slots,
  subjects,
  onCellClick,
  onSlotClick,
  readOnly = false,
}: TimetableGridProps) {
  return (
    <div className="w-full overflow-x-auto border rounded-lg bg-card shadow-xs">
      {slots.length === 0 && (
        <p className="border-b p-3 text-center text-xs text-muted-foreground">
          {readOnly
            ? "No classes scheduled for your section yet."
            : "No classes scheduled for this section yet. Select an empty slot to add one."}
        </p>
      )}
      <table className="w-full border-collapse text-left text-xs min-w-[700px]">
        <thead>
          <tr className="border-b bg-muted/50 text-muted-foreground">
            <th className="p-3 font-semibold w-28 border-r text-center">Time Slot</th>
            {DAYS_OF_WEEK.map((day) => (
              <th key={day} className="p-3 font-semibold text-center border-r last:border-r-0">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {TIME_SLOTS.map((time) => (
            <tr key={time} className="hover:bg-muted/10 transition-colors">
              {/* Time Column */}
              <td className="p-2.5 font-medium text-muted-foreground border-r bg-muted/20 text-center whitespace-nowrap">
                {time}
              </td>

              {/* Day Columns */}
              {DAYS_OF_WEEK.map((day) => {
                const slot = slots.find(
                  (s) => s.dayOfWeek === day && s.timeSlot === time,
                );

                const subjectObj = slot
                  ? subjects.find((sub) => sub.code === slot.subjectCode)
                  : null;

                return (
                  <td
                    key={day}
                    className="p-1.5 border-r last:border-r-0 align-top h-20 w-44 relative group"
                  >
                    {slot ? (
                      <div
                        onClick={readOnly ? undefined : () => onSlotClick(slot)}
                        className={`h-full w-full p-2 rounded-md border border-primary/30 bg-primary/5 flex flex-col justify-between shadow-2xs ${readOnly ? "" : "hover:bg-primary/10 hover:border-primary/60 transition-all cursor-pointer"}`}
                      >
                        <div>
                          <span className="font-bold text-primary text-[11px]">
                            {slot.subjectCode}
                          </span>
                          <p className="text-[11px] font-medium text-foreground line-clamp-1 mt-0.5">
                            {subjectObj?.title ?? slot.subjectCode}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <UserIcon size={10} />
                          <span>{slot.teacherName}</span>
                          <span className="ml-auto font-medium">{slot.room}</span>
                        </div>
                      </div>
                    ) : readOnly ? (
                      <div className="h-full w-full" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCellClick(day, time)}
                        className="h-full w-full rounded border border-dashed border-transparent hover:border-muted-foreground/30 hover:bg-muted/30 transition-all flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100"
                        title={`Schedule class on ${day} at ${time}`}
                      >
                        <Plus size={14} className="text-muted-foreground" />
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
