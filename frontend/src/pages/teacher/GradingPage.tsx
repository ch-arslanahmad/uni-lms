import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { BookOpen, Search, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import {
  AssessmentAnswers,
  AssessmentReference,
  AttachmentCard,
} from "../../components/teacher/AssessmentEvidence";
import {
  getSectionStudents,
  teacherSections,
  type AssessmentAnswer,
  type AssessmentAttempt,
  type AssessmentQuestion,
  type SubmissionFile,
  type SubmissionType,
  type TeacherAssessment,
  type TeacherSection,
  type TeacherSubmission,
} from "../../mock/teacher";
import { programCurriculums, students, subjects } from "../../models";

type ViewMode = "student" | "assessment";
type DisplayStatus = "Submitted" | "Draft" | "Graded" | "Pending";

type Row = {
  id: string;
  studentId: number;
  studentName: string;
  assessmentId: string;
  assessmentTitle: string;
  assessment: TeacherAssessment;
  submittedAt?: string;
  status: DisplayStatus;
  marks?: number;
  feedback?: string;
  maxMarks: number;
  submissionType: SubmissionType;
  file?: SubmissionFile;
  locked: boolean;
};

const STATUS_OPTIONS = ["All statuses", "Submitted", "Draft", "Graded", "Pending"] as const;

function displayStatus(raw: TeacherSubmission["status"]): DisplayStatus {
  if (raw === "locked") return "Graded";
  if (raw === "graded") return "Draft";
  if (raw === "not-submitted") return "Pending";
  return "Submitted";
}

function courseLabel(section: TeacherSection): string {
  const subject = subjects.find((item) => item.code === section.section.subjectCode);
  const curriculum = programCurriculums.find(
    (item) =>
      item.programCode === section.section.programCode &&
      item.subjectCode === section.section.subjectCode,
  );
  const course = subject?.departmentCode ?? section.section.programCode;
  return `${course} ${section.section.subjectCode}-${curriculum?.semesterNumber ?? "?"}${section.section.code}`;
}

function StatusText({ status }: { status: DisplayStatus }) {
  const tone =
    status === "Submitted"
      ? "bg-blue-400"
      : status === "Graded"
        ? "bg-emerald-500"
        : status === "Draft"
          ? "bg-amber-400"
          : "bg-slate-300";
  return (
    <span className="inline-flex items-center gap-2 text-slate-700">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${tone}`} />
      {status}
    </span>
  );
}

type GradeDraft = { marks: number; feedback: string; publish: boolean };

type GradingDrawerProps = {
  row: Row;
  questions: AssessmentQuestion[];
  attempt?: AssessmentAttempt;
  answers: AssessmentAnswer[];
  onClose: () => void;
  onSave: (draft: GradeDraft) => void;
};

function GradingDrawer({ row, questions, attempt, answers, onClose, onSave }: GradingDrawerProps) {
  const [marks, setMarks] = useState(row.marks != null ? String(row.marks) : "");
  const [feedback, setFeedback] = useState(row.feedback ?? "");
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSave(publish: boolean) {
    const raw = marks.trim();
    const value = Number(raw);
    if (raw === "" || !Number.isFinite(value) || value < 0 || value > row.maxMarks) {
      setError(`Enter a number between 0 and ${row.maxMarks}.`);
      return;
    }
    onSave({ marks: value, feedback: feedback.trim(), publish });
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-900/10" aria-hidden="true" onClick={onClose} />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="grading-drawer-title"
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="grading-drawer-title" className="text-base font-semibold text-slate-900">
              {row.studentName} · #{row.studentId}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{row.assessmentTitle}</p>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <StatusText status={row.status} />
              <Link
                to={`/teacher/grading/${row.id}`}
                className="text-blue-600 hover:underline"
                onClick={onClose}
              >
                Open full page
              </Link>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close grading panel"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
          >
            <X className="size-4" />
          </button>
        </header>

        <AssessmentReference assessment={row.assessment} />

        {(row.assessment.hasMcq || row.assessment.kind === "quiz") && (
          <AssessmentAnswers
            questions={questions}
            answers={answers}
            submittedAt={attempt?.submittedAt}
          />
        )}

        <section className="px-6 py-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Student submission</h3>
          <div className="mt-3 border-t border-slate-100 pt-4 text-sm">
            {row.assessment.hasMcq || row.assessment.kind === "quiz" ? (
              <p className="text-slate-500">Answered in-app. See assessment answers above.</p>
            ) : row.submissionType === "digital" ? (
              row.file ? (
                <AttachmentCard file={row.file} />
              ) : (
                <p className="text-slate-500">No file recorded for this digital submission.</p>
              )
            ) : row.submissionType === "physical" ? (
              <p className="text-slate-500">Physical submission. No document attached.</p>
            ) : (
              <p className="text-slate-500">Submission type not recorded.</p>
            )}
          </div>
        </section>

        <section className="px-6 pb-8">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Grading</h3>
          <div className="mt-3 space-y-4 border-t border-slate-100 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="grading-marks">Marks</Label>
              <div className="flex items-center gap-2">
                <input
                  id="grading-marks"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  max={row.maxMarks}
                  value={marks}
                  onChange={(event) => {
                    setMarks(event.target.value);
                    setError("");
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "grading-marks-error" : undefined}
                  className="h-9 w-28 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
                <span className="text-sm text-slate-400">/ {row.maxMarks}</span>
              </div>
            </div>
            {error && (
              <p id="grading-marks-error" role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="grading-feedback">Feedback</Label>
              <Textarea
                id="grading-feedback"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Optional feedback for the student"
                className="min-h-20 rounded-lg border-slate-200 bg-white text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {row.locked ? (
                <Button size="sm" onClick={() => handleSave(true)}>
                  Save correction
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleSave(false)}>
                    Save draft
                  </Button>
                  <Button size="sm" onClick={() => handleSave(true)}>
                    Publish &amp; lock
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              {row.locked
                ? "Corrections update the current grade and latest update metadata."
                : "Drafts stay editable; publishing locks the submission."}
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}

function GradingPage() {
  const {
    submissions,
    assessments,
    setSubmissions,
    assessmentQuestions,
    assessmentAttempts,
    assessmentAnswers,
  } = useOutletContext<TeacherContext>();
  const [searchParams] = useSearchParams();
  const initialAssessment = searchParams.get("assessment") ?? "";

  const [courseId, setCourseId] = useState(teacherSections[0]?.id ?? 0);
  const [view, setView] = useState<ViewMode>("assessment");
  const [assessmentId, setAssessmentId] = useState(initialAssessment);
  const [studentId, setStudentId] = useState(students[0]?.id ?? 0);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("All statuses");
  const [query, setQuery] = useState("");
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);
  const triggerRef = useRef<HTMLTableRowElement | null>(null);

  const courseAssessments = useMemo(
    () => assessments.filter((assessment) => assessment.sectionId === courseId),
    [assessments, courseId],
  );
  const courseStudents = useMemo(() => getSectionStudents(courseId), [courseId]);

  // Derive the effective selection during render so changing the course cannot
  // leave the selectors pointing at a section they no longer belong to.
  const effectiveAssessmentId = courseAssessments.some((assessment) => assessment.id === assessmentId)
    ? assessmentId
    : courseAssessments.some((assessment) => assessment.id === initialAssessment)
      ? initialAssessment
      : courseAssessments[0]?.id ?? "";
  const effectiveStudentId = courseStudents.some((student) => student.id === studentId)
    ? studentId
    : courseStudents[0]?.id ?? 0;
  const selectedCourse = teacherSections.find((section) => section.id === courseId);
  const selectedStudent = courseStudents.find((student) => student.id === effectiveStudentId);

  const rows = useMemo<Row[]>(() => {
    const courseAssessmentIds = new Set(courseAssessments.map((assessment) => assessment.id));
    return submissions
      .filter((submission) => courseAssessmentIds.has(submission.assessmentId))
      .map((submission) => {
        const assessment = courseAssessments.find((item) => item.id === submission.assessmentId);
        return {
          id: submission.id,
          studentId: submission.studentId,
          studentName: students.find((student) => student.id === submission.studentId)?.name ?? String(submission.studentId),
          assessmentId: submission.assessmentId,
          assessmentTitle: assessment?.title ?? submission.assessmentId,
          assessment: assessment ?? courseAssessments[0],
          submittedAt: submission.submittedAt,
          status: displayStatus(submission.status),
          marks: submission.marks,
          feedback: submission.feedback,
          maxMarks: assessment?.maxMarks ?? 100,
          submissionType: submission.type ?? null,
          file: submission.file,
          locked: submission.status === "locked",
        };
      });
  }, [submissions, courseAssessments]);

  const scoped = rows.filter((row) =>
    view === "assessment" ? row.assessmentId === effectiveAssessmentId : row.studentId === effectiveStudentId,
  );
  const q = query.trim().toLowerCase().replace(/^#/, "");
  const filtered = scoped.filter((row) => {
    const statusOk = statusFilter === "All statuses" || row.status === statusFilter;
    const queryOk = !q || (view === "student"
      ? row.assessmentTitle.toLowerCase().includes(q)
      : row.studentName.toLowerCase().includes(q) || String(row.studentId).includes(q));
    return statusOk && queryOk;
  });

  const selectedAssessment = courseAssessments.find((assessment) => assessment.id === effectiveAssessmentId);
  const marksMax = view === "assessment" ? selectedAssessment?.maxMarks ?? 100 : 100;

  const closeDrawer = useCallback(() => {
    setDrawerRow(null);
    triggerRef.current?.focus();
  }, []);

  function openDrawer(row: Row, trigger: HTMLTableRowElement) {
    triggerRef.current = trigger;
    setDrawerRow(row);
  }

  function saveGrade({ marks, feedback, publish }: GradeDraft) {
    if (!drawerRow) return;
    const updatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
    setSubmissions((previous) =>
      previous.map((submission) =>
        submission.id === drawerRow.id
          ? {
              ...submission,
              marks,
              feedback: feedback || undefined,
              status: publish ? "locked" : "graded",
              updatedBy: "Carol",
              updatedAt,
            }
          : submission,
      ),
    );
    closeDrawer();
  }

  const drawerQuestions = drawerRow
    ? assessmentQuestions.filter((question) => question.assessmentId === drawerRow.assessmentId)
    : [];
  const drawerAttempt = drawerRow
    ? assessmentAttempts.find(
        (attempt) =>
          attempt.assessmentId === drawerRow.assessmentId && attempt.studentId === drawerRow.studentId,
      )
    : undefined;
  const drawerAnswers = drawerAttempt
    ? assessmentAnswers.filter((answer) => answer.attemptId === drawerAttempt.id)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Grading</h1>
          <p className="mt-1 text-sm text-slate-500">
            View one assessment across all students, or all assessments for one student.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <BookOpen aria-hidden="true" className="size-3.5" />
            Course
          </span>
          <Select value={String(courseId)} onValueChange={(value) => value && setCourseId(Number(value))}>
            <SelectTrigger className="h-9 w-64 rounded-lg border-slate-200 bg-white">
              <SelectValue>{selectedCourse ? courseLabel(selectedCourse) : "Course"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {teacherSections.map((section) => (
                <SelectItem key={section.id} value={String(section.id)}>
                  {courseLabel(section)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-end gap-4">
        <div role="group" aria-label="Grading view" className="inline-flex rounded-xl bg-slate-100 p-1">
          {(["student", "assessment"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 ${
                view === mode
                  ? "bg-white font-medium text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {mode === "student" ? "By Student" : "By Assessment"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-500">{view === "assessment" ? "Assessment" : "Student"}</span>
          {view === "assessment" ? (
            <Select value={effectiveAssessmentId} onValueChange={(value) => value && setAssessmentId(value)}>
              <SelectTrigger className="h-9 w-64 rounded-lg border-slate-200 bg-white">
                <SelectValue>{selectedAssessment?.title ?? "Assessment"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courseAssessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={String(effectiveStudentId)} onValueChange={(value) => value && setStudentId(Number(value))}>
              <SelectTrigger className="h-9 w-64 rounded-lg border-slate-200 bg-white">
                <SelectValue>
                  {selectedStudent ? `#${selectedStudent.id} — ${selectedStudent.name}` : "Student"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courseStudents.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    #{student.id} — {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-500">Status</span>
          <Select
            value={statusFilter}
            onValueChange={(value) => value && setStatusFilter(value as (typeof STATUS_OPTIONS)[number])}
          >
            <SelectTrigger className="h-9 w-44 rounded-lg border-slate-200 bg-white">
              <SelectValue>{statusFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-64 flex-1 flex-col gap-1.5">
          <Label htmlFor="grading-search" className="text-xs font-normal text-slate-500">
            Search
          </Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="grading-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={view === "student" ? "Search assessments..." : "Search students by name or #ID..."}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Grading results</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <th scope="col" className="hidden px-3 py-3 font-medium sm:table-cell">ID</th>
              <th scope="col" className="hidden px-3 py-3 font-medium sm:table-cell">Student</th>
              <th scope="col" className="px-3 py-3 font-medium sm:hidden">Student</th>
              {view === "student" && (
                <th scope="col" className="px-3 py-3 font-medium">Assessment</th>
              )}
              <th scope="col" className="hidden px-3 py-3 font-medium md:table-cell">Submitted</th>
              <th scope="col" className="px-3 py-3 font-medium">Status</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">
                Marks{view === "assessment" ? ` (out of ${marksMax})` : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={view === "student" ? 7 : 6} className="px-3 py-16 text-center text-sm text-slate-500">
                  No results for the selected filters.
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setStatusFilter("All statuses");
                    }}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  aria-label={`Open grading for ${row.studentName}, student #${row.studentId}${view === "student" ? `, ${row.assessmentTitle}` : ""}`}
                  onClick={(event) => openDrawer(row, event.currentTarget)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openDrawer(row, event.currentTarget);
                    }
                  }}
                  className="h-14 cursor-pointer border-b border-slate-100 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-slate-300"
                >
                  <td className="hidden px-3 py-3 font-mono text-xs text-slate-400 sm:table-cell">#{row.studentId}</td>
                  <td className="hidden px-3 py-3 font-medium text-slate-900 sm:table-cell">{row.studentName}</td>
                  <td className="px-3 py-3 font-medium text-slate-900 sm:hidden">
                    {row.studentName}
                    <span className="ml-2 font-mono text-xs font-normal text-slate-400">#{row.studentId}</span>
                  </td>
                  {view === "student" && (
                    <td className="px-3 py-3 text-slate-700">{row.assessmentTitle}</td>
                  )}
                  <td className="hidden px-3 py-3 font-mono text-xs text-slate-400 md:table-cell">
                    {row.submittedAt ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusText status={row.status} />
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-900">
                    {row.marks != null ? (
                      <>
                        {row.marks}
                        <span className="ml-1 text-slate-400">/ {row.maxMarks}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {drawerRow && (
        <GradingDrawer
          row={drawerRow}
          questions={drawerQuestions}
          attempt={drawerAttempt}
          answers={drawerAnswers}
          onClose={closeDrawer}
          onSave={saveGrade}
        />
      )}
    </div>
  );
}

export default GradingPage;
