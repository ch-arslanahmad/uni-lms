import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections, type TeacherAssessment, type TeacherEvent } from "../../mock/teacher";

type SectionFilter = "all" | number;

interface CalendarEvent {
  id: string;
  kind: "class" | "exam-project" | "makeup-class";
  title: string;
  sectionId: number;
  sectionLabel: string;
  date: string; // YYYY-MM-DD
  timeLabel: string;
  hasTime: boolean;
  room?: string;
  typeLabel: string;
  editable: boolean;
  detailTitle: string;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseDate(s: string) {
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ date: new Date(year, month, -i), inMonth: false });
  for (let d = 1; d <= last.getDate(); d++) cells.push({ date: new Date(year, month, d), inMonth: true });
  while (cells.length % 7 !== 0) {
    const d = cells.length - startOffset - last.getDate() + 1;
    cells.push({ date: new Date(year, month + 1, d), inMonth: false });
  }
  return cells;
}

function fmtTime(s: string) {
  const d = parseDate(s);
  if (!d) return s;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function hasClockTime(s: string) {
  return /[T ]\d{1,2}:\d{2}/.test(s);
}

function sectionShortLabel(sectionId: number) {
  const sec = teacherSections.find((s) => s.id === sectionId);
  return sec ? sec.section.code : "?";
}

function sectionFullLabel(sectionId: number) {
  const sec = teacherSections.find((s) => s.id === sectionId);
  return sec ? `${sec.section.subjectCode}-${sec.section.code}` : "Unknown section";
}

function recurringEventsForDate(date: Date, sectionFilter: SectionFilter): CalendarEvent[] {
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()].slice(0, 3).toLowerCase();
  return teacherSections
    .filter((s) => sectionFilter === "all" || s.id === sectionFilter)
    .filter((s) => s.schedule.toLowerCase().includes(dayName))
    .map((s) => {
      const time = s.schedule.split(" ")[1] ?? "";
      const [start, end] = time.split("-");
      const timeLabel = start && end ? `${start}–${end}` : time || "Time not set";
      return {
        id: `slot-${s.id}-${ymd(date)}`,
        kind: "class" as const,
        title: "Class",
        sectionId: s.id,
        sectionLabel: s.section.code,
        date: ymd(date),
        timeLabel,
        hasTime: !!(start && end),
        typeLabel: "Class",
        editable: false,
        detailTitle: `${s.section.subjectCode}-${s.section.code} Class`,
      };
    });
}

function assessmentToEvent(a: TeacherAssessment): CalendarEvent | null {
  const raw = a.dueAt || a.openAt;
  const d = parseDate(raw);
  if (!d) return null;
  const hasTime = hasClockTime(raw);
  return {
    id: a.id,
    kind: "exam-project",
    title: a.title,
    sectionId: a.sectionId,
    sectionLabel: sectionShortLabel(a.sectionId),
    date: ymd(d),
    timeLabel: hasTime ? fmtTime(raw) : "Time not set",
    hasTime,
    room: a.physicalRoom,
    typeLabel: a.category === "Project" || a.kind === "project" ? "Project" : "Exam",
    editable: false,
    detailTitle: a.title,
  };
}

function makeupToEvent(e: TeacherEvent): CalendarEvent | null {
  const d = parseDate(e.startAt);
  if (!d) return null;
  const hasStart = hasClockTime(e.startAt);
  const hasEnd = hasClockTime(e.endAt);
  return {
    id: e.id,
    kind: "makeup-class",
    title: e.title,
    sectionId: e.sectionId,
    sectionLabel: sectionShortLabel(e.sectionId),
    date: ymd(d),
    timeLabel: hasStart && hasEnd ? `${fmtTime(e.startAt)}–${fmtTime(e.endAt)}` : hasStart ? fmtTime(e.startAt) : "Time not set",
    hasTime: hasStart,
    room: e.room,
    typeLabel: "Makeup / extra class",
    editable: true,
    detailTitle: e.title,
  };
}

function eventKey(ev: CalendarEvent) {
  return `${ev.kind}:${ev.id}`;
}

function EventChip({
  ev,
  onOpen,
  compact,
}: {
  ev: CalendarEvent;
  onOpen: (ev: CalendarEvent) => void;
  compact?: boolean;
}) {
  const isClass = ev.kind === "class" || ev.kind === "makeup-class";
  const base = isClass
    ? "border-l-2 border-blue-400 bg-blue-50/70 text-blue-900"
    : "border-l-2 border-emerald-400 bg-emerald-50/70 text-emerald-900";
  if (isClass) {
    return (
      <div
        className={`w-full rounded-sm px-1.5 py-1 text-left text-[11px] leading-tight ${base}`}
        title={`${ev.detailTitle} · ${sectionFullLabel(ev.sectionId)}`}
      >
        <span className="block truncate">
          {ev.hasTime ? ev.timeLabel : "Time not set"} · {ev.sectionLabel}
        </span>
        {ev.kind === "makeup-class" && !compact && <span className="block truncate text-blue-700/80">{ev.title}</span>}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen(ev); }}
      className={`w-full rounded-sm px-1.5 py-1 text-left text-[11px] leading-tight ${base} hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20`}
      title={`${ev.detailTitle} · ${sectionFullLabel(ev.sectionId)}`}
    >
      <span className="block truncate font-medium text-emerald-950">{ev.title}</span>
      <span className="block truncate text-emerald-800/80">
        {ev.sectionLabel}
        {ev.room ? ` · ${ev.room}` : ""}
      </span>
    </button>
  );
}

function DetailPanel({ ev, onClose }: { ev: CalendarEvent; onClose: () => void }) {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    panelRef.current?.focus();
  }, [ev.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Event details">
      <div className="absolute inset-0 bg-slate-900/10" onClick={onClose} />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white shadow-xl outline-none"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{ev.typeLabel}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{ev.detailTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            aria-label="Close details"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5 text-sm">
          <div>
            <p className="text-xs text-slate-400">Section</p>
            <p className="mt-0.5 text-slate-800">{sectionFullLabel(ev.sectionId)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Date</p>
            <p className="mt-0.5 text-slate-800">{ev.date}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Time</p>
            <p className="mt-0.5 text-slate-800">{ev.hasTime ? ev.timeLabel : "Time not set"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Room</p>
            <p className="mt-0.5 text-slate-800">{ev.room || "Not specified"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Type</p>
            <p className="mt-0.5 text-slate-800">{ev.typeLabel}</p>
          </div>
          {ev.editable && (
            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={onClose}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function TeacherTimetable() {
  const { events, assessments } = useOutletContext<TeacherContext>();
  const [cursor, setCursor] = useState(() => new Date(2026, 10, 1));
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [focusedDay, setFocusedDay] = useState<string>(() => ymd(new Date(2026, 10, 1)));
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const cellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayKey = ymd(new Date());

  const sectionOptions = useMemo(
    () => teacherSections.map((s) => ({ id: s.id, label: `${s.section.subjectCode}-${s.section.code}` })),
    [],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const cell of cells) {
      const key = ymd(cell.date);
      const items: CalendarEvent[] = [];
      items.push(...recurringEventsForDate(cell.date, sectionFilter));
      for (const a of assessments) {
        if (sectionFilter !== "all" && a.sectionId !== sectionFilter) continue;
        if (!teacherSections.some((s) => s.id === a.sectionId)) continue;
        const ev = assessmentToEvent(a);
        if (ev && ev.date === key) items.push(ev);
      }
      for (const e of events) {
        if (sectionFilter !== "all" && e.sectionId !== sectionFilter) continue;
        if (!teacherSections.some((s) => s.id === e.sectionId)) continue;
        const ev = makeupToEvent(e);
        if (ev && ev.date === key) items.push(ev);
      }
      items.sort((a, b) => {
        const ak = a.kind === "exam-project" ? 1 : 0;
        const bk = b.kind === "exam-project" ? 1 : 0;
        if (ak !== bk) return ak - bk;
        return a.timeLabel.localeCompare(b.timeLabel);
      });
      map.set(key, items);
    }
    return map;
  }, [cells, assessments, events, sectionFilter]);

  useEffect(() => {
    const exists = cells.some((c) => ymd(c.date) === focusedDay);
    if (!exists) {
      const firstInMonth = cells.find((c) => c.inMonth);
      if (firstInMonth) setFocusedDay(ymd(firstInMonth.date));
    }
  }, [cells, focusedDay]);

  function moveFocus(days: number) {
    const current = new Date(focusedDay + "T00:00:00");
    if (isNaN(current.getTime())) return;
    current.setDate(current.getDate() + days);
    const nextKey = ymd(current);
    if (current.getMonth() !== month || current.getFullYear() !== year) {
      setCursor(new Date(current.getFullYear(), current.getMonth(), 1));
    }
    setFocusedDay(nextKey);
    requestAnimationFrame(() => cellRefs.current[nextKey]?.focus());
  }

  function openDayEvent(dayKey: string) {
    const items = eventsByDay.get(dayKey) ?? [];
    const clickable = items.find((ev) => ev.kind === "exam-project");
    if (clickable) setSelected(clickable);
  }

  function onCellKeyDown(e: React.KeyboardEvent, dayKey: string) {
    if (e.key === "ArrowRight") { e.preventDefault(); moveFocus(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); moveFocus(-1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(7); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(-7); }
    else if (e.key === "Enter") { e.preventDefault(); openDayEvent(dayKey); }
    else if (e.key === "Escape") { e.preventDefault(); setSelected(null); }
  }

  const agendaDays = useMemo(() => {
    return cells
      .filter((c) => c.inMonth)
      .map((c) => ({ key: ymd(c.date), date: c.date, items: eventsByDay.get(ymd(c.date)) ?? [] }))
      .filter((d) => d.items.length > 0);
  }, [cells, eventsByDay]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                setFocusedDay(ymd(now));
              }}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{monthLabel}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="Calendar view">
            <button
              type="button"
              aria-pressed="true"
              className="h-8 rounded-md bg-slate-100 px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              Month
            </button>
          </div>

          <div className="w-44">
            <label className="sr-only" htmlFor="section-filter">Section filter</label>
            <Select
              value={sectionFilter === "all" ? "all" : String(sectionFilter)}
              onValueChange={(v) => setSectionFilter(v === "all" ? "all" : Number(v))}
            >
              <SelectTrigger id="section-filter" className="h-9 w-full rounded-lg">
                <SelectValue>{sectionFilter === "all" ? "All sections" : sectionOptions.find((s) => s.id === sectionFilter)?.label ?? "All sections"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sections</SelectItem>
                {sectionOptions.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-sm bg-blue-400" aria-hidden="true" />
          Class
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-sm bg-emerald-400" aria-hidden="true" />
          Exam / Project
        </span>
      </div>

      <div className="mt-6 hidden md:block">
        <table className="w-full table-fixed border-collapse border border-slate-200">
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d} scope="col" className="border border-slate-200 bg-slate-50/70 px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, weekIdx) => (
              <tr key={weekIdx}>
                {cells.slice(weekIdx * 7, weekIdx * 7 + 7).map(({ date, inMonth }) => {
                  const key = ymd(date);
                  const items = eventsByDay.get(key) ?? [];
                  const isFocused = focusedDay === key;
                  const isToday = key === todayKey;
                  const expanded = expandedDay === key;
                  const visible = expanded ? items : items.slice(0, 3);
                  const overflow = items.length - visible.length;
                  return (
                    <td
                      key={key}
                      ref={(el) => { cellRefs.current[key] = el; }}
                      tabIndex={isFocused ? 0 : -1}
                      onFocus={() => setFocusedDay(key)}
                      onKeyDown={(e) => onCellKeyDown(e, key)}
                      onClick={() => setFocusedDay(key)}
                      aria-label={`${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${items.length ? `, ${items.length} events` : ""}`}
                      className={`h-28 border border-slate-200 p-1.5 align-top outline-none ${inMonth ? "bg-white" : "bg-slate-50/40"} ${isFocused ? "ring-2 ring-inset ring-blue-500/20" : ""}`}
                    >
                      <div className={`mb-1 text-xs ${inMonth ? "text-slate-700" : "text-slate-400"} ${isToday ? "font-semibold text-blue-700" : "font-normal"}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {visible.map((ev) => (
                          <EventChip key={eventKey(ev)} ev={ev} onOpen={setSelected} />
                        ))}
                        {overflow > 0 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedDay(expanded ? null : key); }}
                            className="px-1 text-[11px] text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                          >
                            +{overflow} more
                          </button>
                        )}
                        {expanded && items.length > 3 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedDay(null); }}
                            className="px-1 text-[11px] text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                          >
                            Show less
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-6 md:hidden">
        {agendaDays.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No events this month.</p>
        ) : (
          agendaDays.map((day) => (
            <section key={day.key} aria-label={day.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                {day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </h2>
              <div className="space-y-2 border-t border-slate-100 pt-2">
                {day.items.map((ev) => (
                  <EventChip key={eventKey(ev)} ev={ev} onOpen={setSelected} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {selected && <DetailPanel ev={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default TeacherTimetable;
