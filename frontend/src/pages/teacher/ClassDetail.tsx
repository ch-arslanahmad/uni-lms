import { AlertCircle, CalendarDays, ExternalLink, FileText, HelpCircle, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { SimpleTable } from "../../components/SimpleTable";
import { SubmissionFileUpload } from "../../components/student/SubmissionFileUpload";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import {
  calculateCourseResults,
  fileToSubmissionFile,
  nowTimestamp,
  getSectionStudents,
  getTeacherSection,
  makeAssessmentReference,
  type AssessmentQuestion,
  type RequirementType,
  type SubmissionFile,
  type SubmissionMode,
  type TeacherAssessment,
} from "../../api";

const CATEGORY_OPTIONS = ["Assignments", "Quizzes", "Project", "Midterm", "Final", "Lab"] as const;
function inferKind(category: string): TeacherAssessment["kind"] {
  if (category === "Quizzes") return "quiz";
  if (category === "Midterm" || category === "Final") return "exam";
  if (category === "Project") return "project";
  return "assignment";
}
const WEEK_RANGES = [
  "25 August - 31 August", "1 September - 7 September", "8 September - 14 September", "15 September - 21 September",
  "22 September - 28 September", "29 September - 5 October", "6 October - 12 October", "13 October - 19 October",
  "20 October - 26 October", "27 October - 2 November", "3 November - 9 November", "10 November - 16 November", "17 November - 23 November",
];
const WEEK_STARTS = ["2026-08-25","2026-09-01","2026-09-08","2026-09-15","2026-09-22","2026-09-29","2026-10-06","2026-10-13","2026-10-20","2026-10-27","2026-11-03","2026-11-10","2026-11-17"];
const WEEK_ENDS   = ["2026-08-31","2026-09-07","2026-09-14","2026-09-21","2026-09-28","2026-10-05","2026-10-12","2026-10-19","2026-10-26","2026-11-02","2026-11-09","2026-11-16","2026-11-23"];
function weekIndexFor(date: string) { const d = date.slice(0, 10); const i = WEEK_STARTS.findIndex((s, idx) => d >= s && d <= WEEK_ENDS[idx]); return i === -1 ? WEEK_RANGES.length - 1 : i; }

function err(v: string, msg: string) { return v.trim() ? "" : msg; }
function toLocalInput(value?: string) {
  if (!value) return "";
  const normalized = value.replace(" ", "T");
  return normalized.length === 10 ? `${normalized}T09:00` : normalized.slice(0, 16);
}
function IconBtn({ title, onClick, children, danger }: { title: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return <Button variant="ghost" size="icon" className={danger ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground"} title={title} aria-label={title} onClick={onClick}>{children}</Button>;
}

function ClassDetail() {
  const { sectionId } = useParams();
  const [params] = useSearchParams();
  const section = getTeacherSection(sectionId);
  const ctx = useOutletContext<TeacherContext>();
  const view = params.get("view") ?? "course";

  const sid = section?.id;
  const assessments = useMemo(() => ctx.assessments.filter((a) => a.sectionId === sid), [ctx.assessments, sid]);
  const materials = useMemo(() => ctx.materials.filter((m) => m.sectionId === sid), [ctx.materials, sid]);
  const announcements = useMemo(() => ctx.announcements.filter((a) => a.sectionId === sid), [ctx.announcements, sid]);
  const events = useMemo(() => ctx.events.filter((e) => e.sectionId === sid).sort((a, b) => a.startAt.localeCompare(b.startAt)), [ctx.events, sid]);

  const categories = useMemo(() => ctx.categories.filter((c) => c.sectionId === sid), [ctx.categories, sid]);
  const resultState = ctx.resultStates.find((r) => r.sectionId === sid);
  const roster = sid ? getSectionStudents(sid) : [];
  const results = useMemo(() => sid ? calculateCourseResults({
    sectionId: sid,
    categories,
    assessments,
    submissions: ctx.submissions,
    questions: ctx.assessmentQuestions,
    attempts: ctx.assessmentAttempts,
    answers: ctx.assessmentAnswers,
  }) : [], [sid, categories, assessments, ctx.submissions, ctx.assessmentQuestions, ctx.assessmentAttempts, ctx.assessmentAnswers]);

  const [annTitle, setAnnTitle] = useState(""); const [annBody, setAnnBody] = useState(""); const [annErr, setAnnErr] = useState("");
  const [editAnnId, setEditAnnId] = useState<string | null>(null);
  const [matName, setMatName] = useState(""); const [matUrl, setMatUrl] = useState(""); const [matSize, setMatSize] = useState(""); const [matErr, setMatErr] = useState("");
  const [matFile, setMatFile] = useState<SubmissionFile | null>(null);
  const [actFile, setActFile] = useState<SubmissionFile | null>(null);
  const emptyAct = () => ({
    category: "Assignments", maxMarks: "100", openAt: "", dueAt: "", closeAt: "",
    instructions: "", reviewPolicy: "after_graded" as "immediate" | "after_close" | "after_graded" | "never",
    submissionModes: ["upload"] as SubmissionMode[],
    requirements: [{ type: "attachment" as RequirementType, isRequired: true }],
    hasViva: false, documentName: "", physicalRoom: "", projectId: "", stageNumber: "1", newProjectTitle: "",
  });
  const [act, setAct] = useState(emptyAct);
  const paperOnly = act.category === "Midterm" || act.category === "Final";
  const [actErr, setActErr] = useState(""); const [showAddForm, setShowAddForm] = useState(false);
  const [editActId, setEditActId] = useState<string | null>(null);
  const [addType, setAddType] = useState<"assessment" | "class">("assessment");
  const addFormRef = useRef<HTMLDivElement>(null);
  function openAddForm(type: "assessment" | "class") { setAddType(type); setShowAddForm(true); setEditEvtId(null); setEvtErr(""); setActErr(""); if (type === "class") setEvt({ title: "", startAt: "", endAt: "", room: "" }); requestAnimationFrame(() => addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }
  const [catName, setCatName] = useState("Assignments"); const [catWeight, setCatWeight] = useState(""); const [catCount, setCatCount] = useState("1"); const [catErr, setCatErr] = useState("");
  const [editCatId, setEditCatId] = useState<string | null>(null);
  // One-off makeup/extra class sessions. Recurring schedule is admin-owned (FR19); exam dates come from assessments.
  const [evt, setEvt] = useState({ title: "", startAt: "", endAt: "", room: "" });
  const [evtErr, setEvtErr] = useState(""); const [editEvtId, setEditEvtId] = useState<string | null>(null);
  const [publishErr, setPublishErr] = useState("");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectError, setNewProjectError] = useState("");
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [projectDraft, setProjectDraft] = useState("");

  function suggestTitle(category: string) {
    const sameCat = assessments.filter((a) => a.category === category);
    const n = sameCat.length + 1;
    if (category === "Midterm") return "Midterm";
    if (category === "Final") return "Final";
    if (category === "Project") return (categories.find((c) => c.name === "Project")?.count === 1 ? "Final Project" : `Project ${n}`);
    return `${category} ${n}`;
  }


  const [qActId, setQActId] = useState<string>("");
  const [aq, setAq] = useState({ type: "mcq" as AssessmentQuestion["type"], text: "", options: "A,B,C,D", correctOption: "0", marks: "5" });
  const [aqErr, setAqErr] = useState("");


  if (!section || !sid) return <div className="mx-auto max-w-5xl px-4 py-8">Class not found.</div>;

  const base = `/teacher/classes/${sectionId}`;

  function saveAnnouncement() {
    const e = err(annTitle, "Title is required.") || err(annBody, "Body is required."); if (e) { setAnnErr(e); return; }
    if (editAnnId) {
      ctx.setAnnouncements((prev) => prev.map((a) => a.id === editAnnId ? { ...a, title: annTitle.trim(), body: annBody.trim() } : a));
    } else {
      ctx.setAnnouncements((prev) => [{ id: `tan-${Date.now()}`, sectionId: section!.id, title: annTitle.trim(), body: annBody.trim(), date: nowTimestamp().slice(0, 10) }, ...prev]);
    }
    setAnnTitle(""); setAnnBody(""); setAnnErr(""); setEditAnnId(null);
  }
  function addMaterial() {
    const e = err(matName, "Material name is required."); if (e) { setMatErr(e); return; }
    if (!matUrl && !matFile) { setMatErr("Choose a file or provide a link."); return; }
    ctx.setMaterials((prev) => [{
      id: `tm-${Date.now()}`, sectionId: section!.id, name: matName.trim(),
      type: matUrl ? "link" : "file", size: matUrl ? undefined : (matFile ? String(matFile.size) : matSize || "file"),
      url: matUrl.trim() || matFile?.url, fileName: matFile?.name, mimeType: matFile?.mimeType,
      uploadedAt: nowTimestamp().slice(0, 10),
    }, ...prev]);
    setMatName(""); setMatUrl(""); setMatSize(""); setMatErr(""); setMatFile(null);
  }
  function saveEvent() {
    const e = err(evt.title, "Title is required.") || err(evt.startAt, "Start is required.") || err(evt.endAt, "End is required.");
    if (e) { setEvtErr(e); return; }
    if (evt.endAt < evt.startAt) { setEvtErr("End must be after or equal to start."); return; }
    const day = evt.startAt.slice(0, 10);
    const examConflict = assessments.find((a) => a.sectionId === section!.id && (a.category === "Midterm" || a.category === "Final" || a.kind === "exam") && (a.dueAt || a.openAt).slice(0, 10) === day);
    if (examConflict) { setEvtErr(`Cannot schedule a class session on exam day (${examConflict.title}, ${examConflict.dueAt || examConflict.openAt}).`); return; }
    const norm = (v: string) => v.replace("T", " ");
    const payload = { title: evt.title.trim(), startAt: norm(evt.startAt), endAt: norm(evt.endAt), room: evt.room.trim() || undefined };
    if (editEvtId) {
      ctx.setEvents((prev) => prev.map((x) => x.id === editEvtId ? { ...x, ...payload } : x));
    } else {
      ctx.setEvents((prev) => [...prev, { id: `tev-${Date.now()}`, sectionId: section!.id, ...payload }]);
    }
    setEvt({ title: "", startAt: "", endAt: "", room: "" }); setEditEvtId(null); setEvtErr(""); setShowAddForm(false);
  }
  function openEditAssessment(assessment: TeacherAssessment) {
    setAddType("assessment");
    setEditEvtId(null);
    setEditActId(assessment.id);
    setShowAddForm(true);
    setActErr("");
    setAct({
      category: assessment.category,
      maxMarks: String(assessment.maxMarks),
      openAt: toLocalInput(assessment.openAt),
      dueAt: toLocalInput(assessment.dueAt),
      closeAt: toLocalInput(assessment.closeAt),
      instructions: assessment.instructions,
      reviewPolicy: assessment.reviewPolicy ?? "after_graded",
      submissionModes: assessment.submissionModes,
      requirements: assessment.requirements?.length ? assessment.requirements : [{ type: "attachment", isRequired: true }],
      hasViva: assessment.hasViva ?? false,
      documentName: assessment.documentName ?? "",
      physicalRoom: assessment.physicalRoom ?? "",
      projectId: assessment.projectId ?? "",
      stageNumber: String(assessment.stageNumber ?? 1),
      newProjectTitle: "",
    });
    setActFile(assessment.document ?? null);
    requestAnimationFrame(() => addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function closeAssessmentForm() {
    setShowAddForm(false);
    setEditActId(null);
    setAct(emptyAct());
    setActFile(null);
    setActErr("");
  }

  function saveAssessment() {
    const kind = inferKind(act.category);
    const submissionModes: SubmissionMode[] = paperOnly ? ["physical"] : act.submissionModes;
    const e = err(act.openAt, "Open date/time is required.") || err(act.dueAt, "Due date/time is required.")
      || err(act.closeAt, "Close date/time is required.")
      || err(act.instructions, "Instructions are required.")
      || (kind !== "quiz" ? err(act.documentName || (actFile?.name ?? ""), "A relevant document is required.") : "")
      || ((!Number(act.maxMarks) || Number(act.maxMarks) <= 0) ? "Max marks must be > 0." : "")
      || (!submissionModes.length ? "Select at least one submission mode." : "")
      || (paperOnly && act.submissionModes.some((m) => m !== "physical") ? "Midterm and Final are paper-based: only Physical submission is allowed." : "")
      || (submissionModes.includes("physical") ? err(act.physicalRoom, "Room/location is required for physical assessments.") : "")
      || (!act.requirements.length ? "Add at least one submission requirement." : "")
      || (!act.requirements.some((r) => r.isRequired) ? "At least one requirement must be marked required." : "")
      || (act.closeAt && act.dueAt && act.closeAt < act.dueAt ? "Close time must be after the due time." : "")
      || (act.dueAt && act.openAt && act.dueAt < act.openAt ? "Due time must be after the open time." : "")
      || (act.category === "Project" && Number(act.stageNumber) < 1 ? "Stage number must be at least 1." : "");
    if (e) { setActErr(e); return; }

    let projectId = act.projectId || undefined;
    if (act.category === "Project" && act.newProjectTitle.trim()) {
      projectId = `proj-${Date.now()}`;
      ctx.setProjects((prev) => [...prev, { id: projectId!, sectionId: section!.id, title: act.newProjectTitle.trim() }]);
    }
    const documentName = act.documentName.trim() || actFile?.name || undefined;
    const patch = {
      kind, instructions: act.instructions.trim(),
      category: act.category, maxMarks: Number(act.maxMarks), openAt: act.openAt, dueAt: act.dueAt, closeAt: act.closeAt,
      submissionModes, requirements: act.requirements,
      projectId, stageNumber: act.category === "Project" ? Number(act.stageNumber) : undefined,
      physicalRoom: submissionModes.includes("physical") ? act.physicalRoom.trim() : undefined,
      hasViva: submissionModes.includes("physical") ? act.hasViva : undefined,
      hasMcq: kind === "quiz" && submissionModes.includes("online"),
      reviewPolicy: kind === "quiz" || kind === "exam" ? act.reviewPolicy : undefined,
      documentName,
      document: actFile ?? (documentName ? makeAssessmentReference(documentName) : undefined),
      required: paperOnly,
    };
    if (editActId) {
      ctx.setAssessments((prev) => prev.map((item) => item.id === editActId ? { ...item, ...patch } : item));
      if (kind === "quiz" || kind === "exam") setQActId(editActId);
    } else {
      const newAct: TeacherAssessment = {
        id: `act-${Date.now()}`, sectionId: section!.id,
        title: suggestTitle(act.category), published: true, ...patch,
      };
      ctx.setAssessments((prev) => [newAct, ...prev]);
      if (newAct.kind === "quiz" || newAct.kind === "exam") setQActId(newAct.id);
    }
    closeAssessmentForm();
  }

  function saveCategory() {
    if (resultState?.frozenWeights) { setCatErr("Weights are frozen after publishing results."); return; }
    const w = Number(catWeight);
    const count = (catName === "Midterm" || catName === "Final") ? 1 : Number(catCount);
    if (!catName.trim() || !w || w <= 0 || w > 100) { setCatErr("Pick a category and weight 1-100."); return; }
    if (!Number.isInteger(count) || count < 1) { setCatErr("Count must be at least 1."); return; }
    if (categories.some((c) => c.id !== editCatId && c.name.toLowerCase() === catName.trim().toLowerCase())) { setCatErr("Category already exists."); return; }
    if (editCatId) {
      ctx.setCategories((prev) => prev.map((c) => c.id === editCatId ? { ...c, name: catName.trim(), weight: w, count } : c));
    } else {
      ctx.setCategories((prev) => [...prev, { id: `gc-${Date.now()}`, sectionId: section!.id, name: catName.trim(), weight: w, count }]);
    }
    setEditCatId(null); setCatName("Assignments"); setCatWeight(""); setCatCount("1"); setCatErr("");
  }

  function saveProjectTitle(projectId: string) {
    if (!projectDraft.trim()) return;
    ctx.setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, title: projectDraft.trim() } : p));
    setEditProjectId(null);
    setProjectDraft("");
  }
  function publishResults() {
    const total = categories.reduce((s, c) => s + c.weight, 0);
    if (total !== 100) { setPublishErr("Category weights must total 100% before publishing."); return; }
    if (!assessments.some((a) => a.category === "Midterm") || !assessments.some((a) => a.category === "Final")) {
      setPublishErr("Midterm and Final assessments must exist before publishing."); return;
    }
    if (results.length === 0 || results.some((r) => !r.complete)) {
      setPublishErr("Every student needs Midterm and Final marks before results can be published."); return;
    }
    setPublishErr("");
    ctx.setResultStates((prev) => prev.map((r) => r.sectionId === sid ? { ...r, published: true, frozenWeights: true } : r));
  }
  function addProject() {
    const e = err(newProjectTitle, "Project title is required.");
    if (e) { setNewProjectError(e); return; }
    ctx.setProjects((prev) => [...prev, { id: `proj-${Date.now()}`, sectionId: section!.id, title: newProjectTitle.trim() }]);
    setNewProjectTitle(""); setNewProjectError("");
  }
  function addAssessmentQuestion() {
    if (!qActId) { setAqErr("Select a quiz/exam assessment."); return; }
    const m = Number(aq.marks);
    if (!aq.text.trim()) { setAqErr("Question text is required."); return; }
    if (!m || m <= 0) { setAqErr("Marks must be > 0."); return; }
    const opts = aq.type === "mcq" ? aq.options.split(",").map(s => s.trim()).filter(Boolean) : undefined;
    if (aq.type === "mcq" && (!opts || opts.length < 2)) { setAqErr("MCQ needs at least 2 comma-separated options."); return; }
    const correct = aq.type === "mcq" ? Number(aq.correctOption) : undefined;
    if (aq.type === "mcq" && (correct == null || correct < 0 || correct >= (opts?.length ?? 0))) { setAqErr("Correct option index is out of range."); return; }
    ctx.setAssessmentQuestions((prev) => [...prev, { id: `aq-${Date.now()}`, assessmentId: qActId, type: aq.type, text: aq.text.trim(), options: opts, correctOption: correct, marks: m }]);
    setAq({ type: "mcq", text: "", options: "A,B,C,D", correctOption: "0", marks: "5" }); setAqErr("");
  }

  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
  const tabs = [
    { label: "Course", value: "course", to: base },
    { label: "Participants", value: "participants", to: `${base}?view=participants` },
    { label: "Grades", value: "grades", to: `${base}?view=grades` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My classes", to: "/teacher/classes" }, { label: `${section.section.subjectCode} - ${section.section.code}` }]} />
      <div>
        <h1 className="text-2xl font-bold">{section.section.subjectCode} - {section.subjectTitle}</h1>
        <p className="text-sm text-muted-foreground">{section.section.programCode}-{section.section.code} - {section.term}</p>
      </div>

      <nav className="flex flex-wrap gap-1 border-b">
        {tabs.map((tab) => (
          <Link key={tab.value} to={tab.to}>
            <Button variant={view === tab.value ? "default" : "ghost"} size="sm">{tab.label}</Button>
          </Link>
        ))}
      </nav>

      {view === "participants" ? (
        <Card>
          <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Roster is read-only. Enrolment is managed by admin.</p>
            <SimpleTable
              columns={[
                { key: "name", label: "Name", render: (s) => <span className="inline-flex items-center gap-2"><Users className="size-4 text-muted-foreground" />{s.name}</span> },
                { key: "email", label: "Email" },
                { key: "department", label: "Department" },
              ]}
              data={roster}
              searchable
              searchKeys={["name", "email"]}
            />
          </CardContent>
        </Card>
      ) : view === "grades" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-sm">Weight total</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}`}>{totalWeight}%</p><p className="text-xs text-muted-foreground">Must total 100% before publish.</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Weights</CardTitle></CardHeader><CardContent className="text-sm">{resultState?.frozenWeights ? "Frozen after publish" : "Editable"}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Results</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-sm">{resultState?.published ? "Published" : "Not published"}</p><Button size="sm" onClick={publishResults} disabled={resultState?.published}>Publish results</Button>{publishErr && <p role="alert" className="text-xs text-red-600">{publishErr}</p>}</CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle>Category weights</CardTitle></CardHeader><CardContent className="space-y-3">
            {categories.map(c => (
              <div key={c.id} className={`flex items-center justify-between rounded border px-3 py-2 text-sm ${editCatId === c.id ? "border-blue-300 bg-blue-500/5" : ""}`}>
                <span>{c.name} <span className="text-muted-foreground">({c.count} {c.count === 1 ? "item" : "items"})</span></span>
                <span className="flex items-center gap-2">
                  <span className="font-medium">{c.weight}%</span>
                  {!resultState?.frozenWeights && <IconBtn title="Edit category" onClick={() => { setEditCatId(c.id); setCatName(c.name); setCatWeight(String(c.weight)); setCatCount(String(c.count)); setCatErr(""); }}><Pencil className="size-4" /></IconBtn>}
                </span>
              </div>
            ))}
            {!resultState?.frozenWeights && <div className="grid gap-2 md:grid-cols-4 rounded border p-3">
              <div className="space-y-1"><Label>Category</Label><Select value={catName} onValueChange={(v) => { if (!v) return; setCatName(v); if (v === "Midterm" || v === "Final") setCatCount("1"); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label>Weight %</Label><Input type="number" value={catWeight} onChange={e => setCatWeight(e.target.value)} /></div>
              <div className="space-y-1"><Label>Count</Label><Input type="number" min={1} value={catName === "Midterm" || catName === "Final" ? "1" : catCount} disabled={catName === "Midterm" || catName === "Final"} onChange={e => setCatCount(e.target.value)} /></div>
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={saveCategory}>{editCatId ? "Save category" : "Add category"}</Button>
                {editCatId && <Button size="sm" variant="ghost" onClick={() => { setEditCatId(null); setCatName("Assignments"); setCatWeight(""); setCatCount("1"); setCatErr(""); }}>Cancel</Button>}
              </div>
              {catErr && <p className="text-xs text-red-600 md:col-span-4">{catErr}</p>}
            </div>}
            <p className="text-xs text-muted-foreground">Define category weight and how many items in that category. Midterm and Final are fixed to 1 item. Total weight must be 100% before publish; weights freeze after publish.</p>
          </CardContent></Card>
          <Card>
            <CardHeader><CardTitle>Course results preview</CardTitle><p className="text-sm font-normal text-muted-foreground">Calculated from category weights. Missing items count as zero; Midterm and Final must be graded before publishing.</p></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead>{categories.map((c) => <TableHead key={c.id}>{c.name} ({c.weight}%)</TableHead>)}<TableHead>Course %</TableHead><TableHead>Grade</TableHead><TableHead>Complete</TableHead></TableRow></TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.studentId}>
                      <TableCell className="font-medium">{r.studentName}</TableCell>
                      {categories.map((c) => <TableCell key={c.id}>{r.categoryPercents[c.name]?.toFixed(1) ?? "0.0"}%</TableCell>)}
                      <TableCell className="tabular-nums">{r.coursePercent.toFixed(1)}%</TableCell>
                      <TableCell>{r.complete ? <><span className="font-medium">{r.letter}</span> <span className="text-muted-foreground">({r.gradePoints})</span></> : "—"}</TableCell>
                      <TableCell>{r.complete ? <Badge className="bg-emerald-600 hover:bg-emerald-600">Ready</Badge> : <Badge variant="secondary">Missing marks</Badge>}</TableCell>
                    </TableRow>
                  ))}
                  {results.length === 0 && <TableRow><TableCell colSpan={categories.length + 4} className="text-muted-foreground">No students enrolled.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Assessment summary</CardTitle><Button variant="outline" size="sm" nativeButton={false} render={<Link to="/teacher/grading" />}>Open grading</Button></CardHeader><CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Assessment</TableHead><TableHead>Category</TableHead><TableHead>Submitted</TableHead><TableHead>Graded</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {assessments.map((a) => {
                  const subs = ctx.submissions.filter((s) => s.assessmentId === a.id);
                  const submitted = subs.filter((s) => s.status !== "not-submitted").length;
                  const graded = subs.filter((s) => s.marks != null).length;
                  return <TableRow key={a.id}><TableCell className="font-medium">{a.title}</TableCell><TableCell>{a.category}</TableCell><TableCell>{submitted}/{roster.length}</TableCell><TableCell>{graded}/{roster.length}</TableCell><TableCell><Link to={`/teacher/grading?assessment=${a.id}`} className="text-blue-600 hover:underline">Grade</Link></TableCell></TableRow>;
                })}
                {assessments.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No assessments yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? <p className="text-sm text-muted-foreground">No announcements yet.</p> : announcements.map((a) => (
                  <div key={a.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.date}</p>
                      </div>
                      <div className="flex items-center">
                        <IconBtn title="Edit announcement" onClick={() => { setEditAnnId(a.id); setAnnTitle(a.title); setAnnBody(a.body); }}><Pencil className="size-4" /></IconBtn>
                        <IconBtn title="Remove announcement" danger onClick={() => ctx.setAnnouncements(prev => prev.filter(x => x.id !== a.id))}><Trash2 className="size-4" /></IconBtn>
                      </div>
                    </div>
                    <p className="text-sm">{a.body}</p>
                  </div>
                ))}
                <div className="space-y-2 border-t pt-3">
                  <p className="text-sm font-medium">{editAnnId ? "Edit announcement" : "Post announcement"}</p>
                  <Label htmlFor="ann-title">Title</Label><Input id="ann-title" value={annTitle} onChange={e => setAnnTitle(e.target.value)} />
                  <Label htmlFor="ann-body">Body</Label><Textarea id="ann-body" value={annBody} onChange={e => setAnnBody(e.target.value)} />
                  {annErr && <p className="text-xs text-red-600">{annErr}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveAnnouncement}>{editAnnId ? "Save" : "Post"}</Button>
                    {editAnnId && <Button size="sm" variant="ghost" onClick={() => { setEditAnnId(null); setAnnTitle(""); setAnnBody(""); setAnnErr(""); }}>Cancel</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Course Objective</CardTitle></CardHeader>
                <CardContent className="text-sm">Build practical database-backed web application skills through the Uni-LMS project, covering requirements, design, implementation, and assessment workflows.</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Time Table</CardTitle></CardHeader>
                <CardContent className="text-sm">{section.schedule}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Multi-stage projects</CardTitle><p className="text-sm font-normal text-muted-foreground">Create a project, then add assessment stages to it from the assessment form.</p></CardHeader>
                <CardContent className="space-y-3">
                  {ctx.projects.filter((p) => p.sectionId === sid).map((project) => {
                    const stages = assessments.filter((a) => a.projectId === project.id).sort((a, b) => (a.stageNumber ?? 0) - (b.stageNumber ?? 0));
                    return (
                      <div key={project.id} className="rounded border p-2 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {editProjectId === project.id ? (
                              <div className="flex gap-2">
                                <Input value={projectDraft} onChange={(e) => setProjectDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveProjectTitle(project.id); }} />
                                <Button size="sm" onClick={() => saveProjectTitle(project.id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => { setEditProjectId(null); setProjectDraft(""); }}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{project.title}</p>
                                <IconBtn title="Rename project" onClick={() => { setEditProjectId(project.id); setProjectDraft(project.title); }}><Pencil className="size-4" /></IconBtn>
                              </div>
                            )}
                            {project.description && <p className="text-xs text-muted-foreground">{project.description}</p>}
                          </div>
                          <IconBtn title="Delete project" danger onClick={() => ctx.setProjects((prev) => prev.filter((p) => p.id !== project.id))}><Trash2 className="size-4" /></IconBtn>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Stages: {stages.length ? stages.map((a) => `${a.stageNumber ?? "?"}. ${a.title}`).join(" · ") : "none yet"}</p>
                        {stages.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {stages.map((stage) => (
                              <Button key={stage.id} size="sm" variant="outline" onClick={() => openEditAssessment(stage)}><Pencil className="size-3" /> Edit stage {stage.stageNumber ?? "?"}</Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {ctx.projects.filter((p) => p.sectionId === sid).length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
                  <div className="flex gap-2">
                    <Input value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} placeholder="New project title" />
                    <Button size="sm" onClick={addProject}>Add</Button>
                  </div>
                  {newProjectError && <p className="text-xs text-red-600">{newProjectError}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-4" /> Section events</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const mandatory = assessments.filter((a) => a.category === "Midterm" || a.category === "Final");
                    return mandatory.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Mandatory assessments (dates set by admin)</p>
                        {mandatory.map((a) => (
                          <div key={a.id} className="rounded border border-amber-200 bg-amber-50/50 p-2 text-sm">
                            <p className="font-medium">{a.title} <Badge variant="secondary">Required</Badge></p>
                            <p className="text-xs text-muted-foreground">{a.dueAt}{a.physicalRoom ? ` · ${a.physicalRoom}` : ""}</p>
                            <p className="text-xs text-muted-foreground">Posting deadline for teacher: prepare and post required document before this date.</p>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  {events.length === 0 ? <p className="text-sm text-muted-foreground">No makeup/extra class sessions scheduled.</p> : events.map((ev) => (
                    <div key={ev.id} className="rounded border p-2 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{ev.title} <Badge variant="outline" className="ml-1">Makeup / extra class</Badge></p>
                          <p className="text-xs text-muted-foreground">{ev.startAt} - {ev.endAt}{ev.room ? ` · ${ev.room}` : ""}</p>
                        </div>
                        <div className="flex items-center">
                          <IconBtn title="Edit event" onClick={() => { setEditEvtId(ev.id); setAddType("class"); setShowAddForm(true); setEvt({ title: ev.title, startAt: ev.startAt.slice(0,16), endAt: ev.endAt.slice(0,16), room: ev.room ?? "" }); setEvtErr(""); requestAnimationFrame(() => addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }}><Pencil className="size-4" /></IconBtn>
                          <IconBtn title="Delete event" danger onClick={() => ctx.setEvents((prev) => prev.filter((x) => x.id !== ev.id))}><Trash2 className="size-4" /></IconBtn>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <Button size="sm" variant="outline" onClick={() => openAddForm("class")}><Plus className="size-4" /> Add makeup class</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Course Outline &amp; Material</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Course outline is usually a document or text. Add supporting materials as files or links.</p>
              <div className="flex flex-wrap gap-3">
                {materials.map((m) => (
                  <div key={m.id} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                    <span>{m.name}{m.size ? <span className="text-muted-foreground"> ({m.size})</span> : null}</span>
                    <IconBtn title="Remove material" danger onClick={() => ctx.setMaterials(prev => prev.filter(x => x.id !== m.id))}><Trash2 className="size-4" /></IconBtn>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 rounded border p-3 md:grid-cols-[1fr_1fr_auto] items-end">
                <div className="md:col-span-3">
                  <SubmissionFileUpload
                    id="mat-file"
                    label="Upload attachment"
                    fileName={matName && !matUrl ? matName : ""}
                    onFileChange={(name) => { setMatName(name); setMatUrl(""); setMatSize("file"); }}
                    onFileSelected={(file) => { if (!file) { setMatFile(null); return; } void fileToSubmissionFile(file).then(setMatFile); }}
                    hint="Upload course outline or supporting material file"
                  />
                  {matFile && <p className="text-xs text-muted-foreground">Stored file: {matFile.name} · {matFile.mimeType} · {matFile.size} bytes</p>}
                </div>
                <div className="space-y-1"><Label htmlFor="mat-name">Name</Label><Input id="mat-name" value={matName} onChange={e => setMatName(e.target.value)} placeholder="Course outline / material name" /></div>
                <div className="space-y-1"><Label htmlFor="mat-url">Link URL (optional)</Label><Input id="mat-url" value={matUrl} onChange={e => { setMatUrl(e.target.value); if (e.target.value) setMatSize(""); }} placeholder="https://..." /></div>
                <Button size="sm" onClick={addMaterial}>Add</Button>
                {matErr && <p className="text-xs text-red-600 md:col-span-3">{matErr}</p>}
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Weekly sections</h2>
              <Button variant="outline" size="sm" onClick={() => { setAddType("assessment"); setEditEvtId(null); setEditActId(null); setAct(emptyAct()); setActErr(""); setShowAddForm((v) => !v); }}><Plus className="size-4" /> Assessment</Button>
            </div>

            {showAddForm && (
              <div ref={addFormRef} className="scroll-mt-4">
              <Card className="mb-3">
                <CardHeader>
                  <CardTitle>{addType === "assessment" ? (editActId ? "Edit assessment" : "Create assessment") : (editEvtId ? "Edit makeup/extra class" : "Add makeup/extra class")}</CardTitle>
                  <p className="text-sm font-normal text-muted-foreground">{addType === "assessment" ? "Assessments are graded or required classwork items such as assignments, quizzes, projects, labs, or exams." : "One-off makeup/extra class session. Exam schedule comes from assessments."}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Type</Label>
                      <Select value={addType} onValueChange={(v) => { if (v === "assessment" || v === "class") { setAddType(v); setActErr(""); setEvtErr(""); if (v === "assessment") setEditEvtId(null); } }} disabled={!!editEvtId}><SelectTrigger><SelectValue>{addType === "assessment" ? "Assessment" : "Makeup / extra class"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="assessment">Assessment</SelectItem><SelectItem value="class">Makeup / extra class</SelectItem></SelectContent></Select>
                    </div>
                    {addType === "assessment" ? (
                      <>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={act.category} onValueChange={v => {
                            if (!v) return;
                            const isPaper = v === "Midterm" || v === "Final";
                            setAct({ ...act, category: v, submissionModes: isPaper ? ["physical"] : (v === "Quizzes" ? ["online"] : ["upload"]), physicalRoom: isPaper ? act.physicalRoom : "" });
                          }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                          <p className="text-xs text-muted-foreground">Category determines grading bucket and assessment behavior. Title is auto-numbered (e.g. {suggestTitle(act.category)}).</p>
                        </div>
                        <div className="space-y-2"><Label>Max marks</Label><Input type="number" value={act.maxMarks} onChange={e => setAct({ ...act, maxMarks: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Submission modes</Label>
                          <div className="flex flex-wrap gap-4">
                            {([["online", "Online (in-app)"], ["upload", "Upload (attachment)"], ["physical", "Physical (paper)"]] as const).map(([value, label]) => (
                              <label key={value} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  disabled={paperOnly && value !== "physical"}
                                  checked={act.submissionModes.includes(value)}
                                  onChange={(e) => setAct((prev) => ({
                                    ...prev,
                                    submissionModes: e.target.checked
                                      ? [...prev.submissionModes, value]
                                      : prev.submissionModes.filter((m) => m !== value),
                                  }))}
                                />
                                {label}
                              </label>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{paperOnly ? "Midterm and Final are paper-based: only Physical is allowed." : "Attachment-based quiz: choose Upload. In-app MCQ quiz: choose Online."}</p>
                        </div>
                        <div className="space-y-2"><Label>Open at</Label><Input type="datetime-local" value={act.openAt} onChange={e => setAct({ ...act, openAt: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Due at</Label><Input type="datetime-local" value={act.dueAt} onChange={e => setAct({ ...act, dueAt: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Close at</Label><Input type="datetime-local" value={act.closeAt} onChange={e => setAct({ ...act, closeAt: e.target.value })} /></div>
                        {act.submissionModes.includes("physical") && <>
                          <div className="space-y-2"><Label>Room / location</Label><Input value={act.physicalRoom} onChange={e => setAct({ ...act, physicalRoom: e.target.value })} placeholder="e.g. Exam Hall A" /></div>
                          <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={act.hasViva} onChange={e => setAct({ ...act, hasViva: e.target.checked })} />Includes viva</label>
                          <p className="text-xs text-muted-foreground md:col-span-2 -mt-2">Physical submission means in-person assessment; enable viva if students will also be assessed orally.</p>
                        </>}
                        {act.category === "Project" && <>
                          <div className="space-y-2">
                            <Label>Project</Label>
                            <Select value={act.projectId || "__none"} onValueChange={v => v && setAct({ ...act, projectId: v === "__none" ? "" : v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">Standalone (no project)</SelectItem>
                                {ctx.projects.filter(p => p.sectionId === sid).map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label>Or new project title</Label><Input value={act.newProjectTitle} onChange={e => setAct({ ...act, newProjectTitle: e.target.value })} placeholder="Creates a project for this stage" /></div>
                          <div className="space-y-2"><Label>Stage number</Label><Input type="number" min={1} value={act.stageNumber} onChange={e => setAct({ ...act, stageNumber: e.target.value })} /></div>
                        </>}
                        <div className="md:col-span-2 space-y-2">
                          <div className="flex items-center justify-between"><Label>Submission requirements</Label><Button size="sm" variant="outline" onClick={() => setAct((prev) => ({ ...prev, requirements: [...prev.requirements, { type: "text", isRequired: false }] }))}><Plus className="size-4" /> Add requirement</Button></div>
                          {act.requirements.map((r, index) => (
                            <div key={index} className="grid items-end gap-2 sm:grid-cols-[1fr_auto_auto]">
                              <div className="space-y-1">
                                <Label>Type</Label>
                                <Select value={r.type} onValueChange={v => v && setAct((prev) => ({ ...prev, requirements: prev.requirements.map((item, i) => i === index ? { ...item, type: v as RequirementType } : item) }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="text">Text</SelectItem><SelectItem value="link">Link</SelectItem><SelectItem value="attachment">Attachment</SelectItem></SelectContent>
                                </Select>
                              </div>
                              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={r.isRequired} onChange={(e) => setAct((prev) => ({ ...prev, requirements: prev.requirements.map((item, i) => i === index ? { ...item, isRequired: e.target.checked } : item) }))} /> Required</label>
                              <IconBtn title="Remove requirement" danger onClick={() => setAct((prev) => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }))}><Trash2 className="size-4" /></IconBtn>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">At least one requirement, and at least one must be required (FR8 / I7).</p>
                        </div>
                        <div className="md:col-span-2">
                          <SubmissionFileUpload
                            id="act-doc"
                            label="Relevant document (required)"
                            fileName={act.documentName}
                            onFileChange={(name) => setAct({ ...act, documentName: name })}
                            onFileSelected={(file) => { if (!file) { setActFile(null); return; } void fileToSubmissionFile(file).then(setActFile); }}
                            hint="Upload question paper, brief, or instructions file. Required for assignments, quizzes, projects, and exams."
                          />
                          {actFile && <p className="text-xs text-muted-foreground">Stored file: {actFile.name} · {actFile.mimeType} · {actFile.size} bytes</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Instructions</Label><Textarea value={act.instructions} onChange={e => setAct({ ...act, instructions: e.target.value })} /></div>
                        {actErr && <p className="text-xs text-red-600 md:col-span-2">{actErr}</p>}
                        <div className="md:col-span-2 flex gap-2"><Button size="sm" onClick={saveAssessment}>{editActId ? "Save assessment" : "Create assessment"}</Button><Button size="sm" variant="ghost" onClick={closeAssessmentForm}>Cancel</Button></div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={evt.title} onChange={(e) => setEvt({ ...evt, title: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={evt.startAt} onChange={(e) => setEvt({ ...evt, startAt: e.target.value })} /></div>
                        <div className="space-y-2"><Label>End</Label><Input type="datetime-local" value={evt.endAt} onChange={(e) => setEvt({ ...evt, endAt: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Room (optional)</Label><Input value={evt.room} onChange={(e) => setEvt({ ...evt, room: e.target.value })} /></div>
                        {evtErr && <p className="text-xs text-red-600 md:col-span-2">{evtErr}</p>}
                        <div className="md:col-span-2 flex gap-2"><Button size="sm" onClick={saveEvent}>{editEvtId ? "Save class session" : "Add class session"}</Button><Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setEditEvtId(null); setEvt({ title: "", startAt: "", endAt: "", room: "" }); setEvtErr(""); }}>Cancel</Button></div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            )}

            <div className="space-y-2">
              {WEEK_RANGES.map((range, idx) => {
                const weekActs = assessments.filter(a => weekIndexFor(a.dueAt || a.openAt) === idx);
                const current = idx === 1;
                return (
                  <details key={range} open={current} className={`group rounded-lg border px-4 py-3 ${current ? "border-blue-300 bg-blue-500/5" : ""}`}>
                    <summary className="cursor-pointer font-medium">
                      {range} {current && <span className="ml-2 rounded bg-blue-500 px-2 py-0.5 text-xs text-white">Current week</span>}
                    </summary>
                    <div className="mt-3 space-y-2">
                      {weekActs.length === 0 && WEEK_ENDS[idx] < "2026-09-03" && (
                        <p className="text-sm text-muted-foreground">No assessments this week.</p>
                      )}
                      {weekActs.map((a) => {
                        const isQuizExam = a.kind === "quiz" || a.kind === "exam";
                        const actQuestions = ctx.assessmentQuestions.filter(q => q.assessmentId === a.id);
                        return (
                          <div key={a.id} className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-sm hover:bg-muted/50">
                              <div>
                                <p className="font-medium flex items-center gap-2">{a.title}{a.required && <Badge variant="secondary">Required</Badge>}{a.required && !a.documentName && <Badge variant="secondary" className="gap-1"><AlertCircle className="size-3" />Pending document</Badge>}</p>
                                <p className="text-xs text-muted-foreground">
                                  {a.kind} - Opened {a.openAt} - Due {a.dueAt}{a.closeAt ? ` - Closes ${a.closeAt}` : ""} - Modes: {a.submissionModes.join(", ") || "none"}{a.requirements?.length ? ` - Requires: ${a.requirements.map((r) => `${r.type}${r.isRequired ? "*" : ""}`).join(", ")}` : ""}{a.projectId ? ` - Stage ${a.stageNumber ?? "?"}` : ""}{a.documentName ? ` - ${a.documentName}` : ""}{a.physicalRoom ? ` - ${a.physicalRoom}` : ""}{a.hasViva ? " - Viva" : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Link to={`/teacher/grading?assessment=${a.id}`} title="Open grading queue" aria-label="Open grading queue" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><ExternalLink className="size-4" /></Link>
                                {isQuizExam && <IconBtn title="Manage assessment questions" onClick={() => setQActId(qActId === a.id ? "" : a.id)}><HelpCircle className="size-4" /></IconBtn>}
                                <IconBtn title="Edit assessment" onClick={() => openEditAssessment(a)}><Pencil className="size-4" /></IconBtn>
                                <IconBtn title="Delete assessment" danger onClick={() => ctx.setAssessments((prev) => prev.filter((x) => x.id !== a.id))}><Trash2 className="size-4" /></IconBtn>
                              </div>
                            </div>
                            {qActId === a.id && isQuizExam && (
                              <div className="space-y-3 rounded border p-3 text-sm">
                                <p className="font-medium">Assessment questions</p>
                                <div className="space-y-2">{actQuestions.map(q => (
                                  <div key={q.id} className="rounded border px-3 py-2"><div className="flex justify-between gap-2"><p className="font-medium">{q.text}</p><IconBtn title="Remove question" danger onClick={() => ctx.setAssessmentQuestions(prev => prev.filter(x => x.id !== q.id))}><Trash2 className="size-4" /></IconBtn></div><p className="text-xs text-muted-foreground capitalize">{q.type} · {q.marks} marks{q.options ? ` · Options: ${q.options.join(", ")} · Correct: ${q.correctOption}` : ""}</p></div>
                                ))}</div>
                                <div className="grid gap-2 md:grid-cols-2">
                                  <div className="space-y-1"><Label>Type</Label><Select value={aq.type} onValueChange={(v) => v && setAq({ ...aq, type: v as AssessmentQuestion["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mcq">MCQ</SelectItem><SelectItem value="written">Written</SelectItem></SelectContent></Select></div>
                                  <div className="space-y-1"><Label>Marks</Label><Input type="number" value={aq.marks} onChange={e => setAq({ ...aq, marks: e.target.value })} /></div>
                                  <div className="space-y-1 md:col-span-2"><Label>Question text</Label><Textarea value={aq.text} onChange={e => setAq({ ...aq, text: e.target.value })} /></div>
                                  {aq.type === "mcq" && <><div className="space-y-1"><Label>Options (comma-separated)</Label><Input value={aq.options} onChange={e => setAq({ ...aq, options: e.target.value })} /></div><div className="space-y-1"><Label>Correct option index (0-based)</Label><Input type="number" value={aq.correctOption} onChange={e => setAq({ ...aq, correctOption: e.target.value })} /></div></>}
                                  {aqErr && <p className="text-xs text-red-600 md:col-span-2">{aqErr}</p>}
                                  <div className="md:col-span-2"><Button size="sm" onClick={addAssessmentQuestion}>Add question</Button></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {WEEK_ENDS[idx] >= "2026-09-03" && (
                        <button
                          type="button"
                          title="Add assessment"
                          aria-label="Add assessment"
                          onClick={() => { setAddType("assessment"); setEditEvtId(null); setEditActId(null); setAct({ ...emptyAct(), openAt: `${WEEK_STARTS[idx]}T09:00`, dueAt: `${WEEK_ENDS[idx]}T23:59`, closeAt: `${WEEK_ENDS[idx]}T23:59` }); setActErr(""); setShowAddForm(true); }}
                          className="flex w-full items-center justify-center rounded border border-dashed px-3 py-2 text-muted-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:text-foreground focus-visible:bg-muted/50"
                        >
                          <Plus className="size-4" />
                        </button>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ClassDetail;
