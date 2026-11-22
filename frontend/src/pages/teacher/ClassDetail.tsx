import { AlertCircle, CalendarClock, ExternalLink, FileText, FileUp, HelpCircle, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
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
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { getSectionStudents, getTeacherSection, type AssessmentQuestion, type TeacherActivity, type TeacherEvent } from "../../mock/teacher";
import { students } from "../../models";

const CATEGORY_OPTIONS = ["Assignments", "Quizzes", "Project", "Midterm", "Final", "Lab", "Participation"] as const;
const KIND_CATEGORY: Record<TeacherActivity["kind"], string> = { assignment: "Assignments", quiz: "Quizzes", project: "Project", exam: "Midterm" };

function err(v: string, msg: string) { return v.trim() ? "" : msg; }
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
  const activities = useMemo(() => ctx.activities.filter((a) => a.sectionId === sid), [ctx.activities, sid]);
  const materials = useMemo(() => ctx.materials.filter((m) => m.sectionId === sid), [ctx.materials, sid]);
  const announcements = useMemo(() => ctx.announcements.filter((a) => a.sectionId === sid), [ctx.announcements, sid]);
  const questions = useMemo(() => ctx.questions.filter((q) => q.sectionId === sid), [ctx.questions, sid]);
  const events = useMemo(() => ctx.events.filter((e) => e.sectionId === sid), [ctx.events, sid]);
  const categories = useMemo(() => ctx.categories.filter((c) => c.sectionId === sid), [ctx.categories, sid]);
  const resultState = ctx.resultStates.find((r) => r.sectionId === sid);
  const roster = sid ? getSectionStudents(sid) : [];

  const [annTitle, setAnnTitle] = useState(""); const [annBody, setAnnBody] = useState(""); const [annErr, setAnnErr] = useState("");
  const [editAnnId, setEditAnnId] = useState<string | null>(null);
  const [matName, setMatName] = useState(""); const [matUrl, setMatUrl] = useState(""); const [matErr, setMatErr] = useState("");
  const [act, setAct] = useState({ title: "", kind: "assignment" as TeacherActivity["kind"], category: "Assignments", maxMarks: "100", openAt: "", dueAt: "", instructions: "", reviewPolicy: "after_graded" as "immediate" | "after_close" | "after_graded" | "never", submissionMode: "upload" as "upload" | "physical", documentName: "", physicalRoom: "" });
  const [actErr, setActErr] = useState(""); const [showActForm, setShowActForm] = useState(false);
  const [catName, setCatName] = useState("Assignments"); const [catWeight, setCatWeight] = useState(""); const [catErr, setCatErr] = useState("");
  const [ev, setEv] = useState({ title: "", type: "other" as TeacherEvent["type"], startAt: "", endAt: "", linkedActivityId: "" });
  const [evErr, setEvErr] = useState(""); const [showEvForm, setShowEvForm] = useState(false);
  const [qActId, setQActId] = useState<string>("");
  const [aq, setAq] = useState({ type: "mcq" as AssessmentQuestion["type"], text: "", options: "A,B,C,D", correctOption: "0", marks: "5" });
  const [aqErr, setAqErr] = useState("");

  if (!section || !sid) return <div className="mx-auto max-w-5xl px-4 py-8">Class not found.</div>;

  const requiredExams = activities.filter((a) => a.required && (a.category === "Midterm" || a.category === "Final"));
  const base = `/teacher/classes/${sectionId}`;

  function saveAnnouncement() {
    const e = err(annTitle, "Title is required.") || err(annBody, "Body is required."); if (e) { setAnnErr(e); return; }
    if (editAnnId) {
      ctx.setAnnouncements((prev) => prev.map((a) => a.id === editAnnId ? { ...a, title: annTitle.trim(), body: annBody.trim() } : a));
    } else {
      ctx.setAnnouncements((prev) => [{ id: `tan-${Date.now()}`, sectionId: section!.id, title: annTitle.trim(), body: annBody.trim(), date: "2026-11-22" }, ...prev]);
    }
    setAnnTitle(""); setAnnBody(""); setAnnErr(""); setEditAnnId(null);
  }
  function addMaterial() {
    const e = err(matName, "Material name is required."); if (e) { setMatErr(e); return; }
    ctx.setMaterials((prev) => [{ id: `tm-${Date.now()}`, sectionId: section!.id, name: matName.trim(), type: matUrl ? "link" : "file", size: matUrl ? undefined : "mock", url: matUrl.trim() || undefined, uploadedAt: "2026-11-22" }, ...prev]);
    setMatName(""); setMatUrl(""); setMatErr("");
  }
  function addActivity() {
    const e = err(act.title, "Title is required.") || err(act.openAt, "Open date is required.") || err(act.dueAt, "Due date is required.")
      || err(act.instructions, "Instructions are required.") || err(act.documentName, "A relevant document is required.")
      || ((!Number(act.maxMarks) || Number(act.maxMarks) <= 0) ? "Max marks must be > 0." : "")
      || (act.submissionMode === "physical" ? err(act.physicalRoom, "Room/location is required for physical activities.") : "");
    if (e) { setActErr(e); return; }
    const submissionModes = act.kind === "quiz" || act.kind === "exam" ? (act.submissionMode === "physical" ? ["physical"] as ("upload" | "physical")[] : []) : [act.submissionMode];
    const newAct: TeacherActivity = {
      id: `act-${Date.now()}`, sectionId: section!.id, kind: act.kind, title: act.title.trim(), instructions: act.instructions.trim(),
      category: act.category, maxMarks: Number(act.maxMarks), openAt: act.openAt, dueAt: act.dueAt, submissionModes,
      physicalRoom: act.submissionMode === "physical" ? act.physicalRoom.trim() : undefined,
      hasMcq: act.kind === "quiz", reviewPolicy: act.kind === "quiz" || act.kind === "exam" ? act.reviewPolicy : undefined,
      documentName: act.documentName.trim(), required: act.category === "Midterm" || act.category === "Final", published: true,
    };
    ctx.setActivities((prev) => [newAct, ...prev]);
    if (newAct.kind === "quiz" || newAct.kind === "exam") setQActId(newAct.id);
    setAct({ title: "", kind: "assignment", category: "Assignments", maxMarks: "100", openAt: "", dueAt: "", instructions: "", reviewPolicy: "after_graded", submissionMode: "upload", documentName: "", physicalRoom: "" });
    setActErr(""); setShowActForm(false);
  }
  function saveCategory() {
    if (resultState?.frozenWeights) { setCatErr("Weights are frozen after publishing results."); return; }
    const w = Number(catWeight);
    if (!catName.trim() || !w || w <= 0 || w > 100) { setCatErr("Pick a category and weight 1-100."); return; }
    if (categories.some((c) => c.name.toLowerCase() === catName.trim().toLowerCase())) { setCatErr("Category already exists."); return; }
    ctx.setCategories((prev) => [...prev, { id: `gc-${Date.now()}`, sectionId: section!.id, name: catName.trim(), weight: w }]);
    setCatName("Assignments"); setCatWeight(""); setCatErr("");
  }
  function publishResults() {
    const total = categories.reduce((s, c) => s + c.weight, 0);
    if (total !== 100) { alert("Category weights must total 100% before publishing."); return; }
    if (!activities.some((a) => a.category === "Midterm") || !activities.some((a) => a.category === "Final")) { alert("Midterm and Final assessment results must exist before publishing."); return; }
    ctx.setResultStates((prev) => prev.map((r) => r.sectionId === sid ? { ...r, published: true, frozenWeights: true } : r));
  }
  function addEvent() {
    const e = err(ev.title, "Event title is required.") || err(ev.startAt, "Start time is required.") || err(ev.endAt, "End time is required.");
    if (e) { setEvErr(e); return; }
    if (ev.linkedActivityId && !activities.some((a) => a.id === ev.linkedActivityId)) { setEvErr("Linked activity must belong to this section."); return; }
    ctx.setEvents((prev) => [{ id: `ev-${Date.now()}`, sectionId: section!.id, title: ev.title.trim(), type: ev.type, startAt: ev.startAt, endAt: ev.endAt, linkedActivityId: ev.linkedActivityId || undefined }, ...prev]);
    setEv({ title: "", type: "other", startAt: "", endAt: "", linkedActivityId: "" }); setEvErr(""); setShowEvForm(false);
  }
  function addAssessmentQuestion() {
    if (!qActId) { setAqErr("Select a quiz/exam activity."); return; }
    const m = Number(aq.marks);
    if (!aq.text.trim()) { setAqErr("Question text is required."); return; }
    if (!m || m <= 0) { setAqErr("Marks must be > 0."); return; }
    const opts = aq.type === "mcq" ? aq.options.split(",").map(s => s.trim()).filter(Boolean) : undefined;
    if (aq.type === "mcq" && (!opts || opts.length < 2)) { setAqErr("MCQ needs at least 2 comma-separated options."); return; }
    const correct = aq.type === "mcq" ? Number(aq.correctOption) : undefined;
    if (aq.type === "mcq" && (correct == null || correct < 0 || correct >= (opts?.length ?? 0))) { setAqErr("Correct option index is out of range."); return; }
    ctx.setAssessmentQuestions((prev) => [...prev, { id: `aq-${Date.now()}`, activityId: qActId, type: aq.type, text: aq.text.trim(), options: opts, correctOption: correct, marks: m }]);
    setAq({ type: "mcq", text: "", options: "A,B,C,D", correctOption: "0", marks: "5" }); setAqErr("");
  }
  function attachRequiredDoc(activityId: string) {
    ctx.setActivities((prev) => prev.map((a) => a.id === activityId ? { ...a, documentName: `${a.category.toLowerCase()}-document.pdf` } : a));
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{section.section.subjectCode} - {section.subjectTitle}</h1>
          <p className="text-sm text-muted-foreground">{section.section.code} · {section.term} · {section.schedule}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setShowActForm((v) => !v); setShowEvForm(false); }}><Plus className="size-4" /> Activity</Button>
          <Button variant="outline" size="sm" onClick={() => { setShowEvForm((v) => !v); setShowActForm(false); }}><CalendarClock className="size-4" /> Event</Button>
        </div>
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
            <Card><CardHeader><CardTitle className="text-sm">Results</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-sm">{resultState?.published ? "Published" : "Not published"}</p><Button size="sm" onClick={publishResults} disabled={resultState?.published}>Publish results</Button></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle>Category weights</CardTitle></CardHeader><CardContent className="space-y-3">
            {categories.map(c => <div key={c.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm"><span>{c.name}</span><span className="font-medium">{c.weight}%</span></div>)}
            {!resultState?.frozenWeights && <div className="grid gap-2 md:grid-cols-3 rounded border p-3">
              <div className="space-y-1"><Label>Category</Label><Select value={catName} onValueChange={(v) => v && setCatName(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label>Weight %</Label><Input type="number" value={catWeight} onChange={e => setCatWeight(e.target.value)} /></div>
              <div className="flex items-end"><Button size="sm" onClick={saveCategory}>Add category</Button></div>
              {catErr && <p className="text-xs text-red-600 md:col-span-3">{catErr}</p>}
            </div>}
            <p className="text-xs text-muted-foreground">Pick categories from the standard list. Midterm and Final required before publishing. Weights freeze after publish.</p>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Gradebook preview</CardTitle></CardHeader><CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Preview of current marks/submission status per student across activities before final result publish. Missing items count as zero in category calculation.</p>
            <Table><TableHeader><TableRow><TableHead>Student</TableHead>{activities.slice(0, 5).map(a => <TableHead key={a.id}>{a.title}</TableHead>)}</TableRow></TableHeader><TableBody>
              {roster.map(stu => <TableRow key={stu.id}><TableCell className="font-medium">{stu.name}</TableCell>{activities.slice(0, 5).map(a => { const sub = ctx.submissions.find(s => s.activityId === a.id && s.studentId === stu.id); return <TableCell key={a.id} className="text-muted-foreground">{sub?.marks != null ? `${sub.marks}/${a.maxMarks}` : sub?.status === "submitted" ? "Submitted" : "—"}</TableCell>; })}</TableRow>)}
            </TableBody></Table>
          </CardContent></Card>
        </div>
      ) : (
        <>
          {(showActForm || showEvForm) && (
            <Card>
              <CardHeader><CardTitle>{showActForm ? "Create activity" : "Add event"}</CardTitle></CardHeader>
              <CardContent>
                {showActForm ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={act.title} onChange={e => setAct({ ...act, title: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Kind</Label><Select value={act.kind} onValueChange={v => { if (!v) return; const k = v as TeacherActivity["kind"]; setAct({ ...act, kind: k, category: KIND_CATEGORY[k] || act.category }); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["assignment", "quiz", "project", "exam"].map(k => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Grading category</Label><Select value={act.category} onValueChange={v => v && setAct({ ...act, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Max marks</Label><Input type="number" value={act.maxMarks} onChange={e => setAct({ ...act, maxMarks: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Submission mode</Label><Select value={act.submissionMode} onValueChange={(v) => v && setAct({ ...act, submissionMode: v as "upload" | "physical" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upload">Upload</SelectItem><SelectItem value="physical">Physical</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Open date</Label><Input type="date" value={act.openAt} onChange={e => setAct({ ...act, openAt: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Due date</Label><Input type="date" value={act.dueAt} onChange={e => setAct({ ...act, dueAt: e.target.value })} /></div>
                    {(act.kind === "quiz" || act.kind === "exam") && <div className="space-y-2"><Label>Review policy</Label><Select value={act.reviewPolicy} onValueChange={(v) => v && setAct({ ...act, reviewPolicy: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["immediate", "after_close", "after_graded", "never"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>}
                    {act.submissionMode === "physical" && <div className="space-y-2"><Label>Room / location (physical only)</Label><Input value={act.physicalRoom} onChange={e => setAct({ ...act, physicalRoom: e.target.value })} placeholder="e.g. Exam Hall A" /></div>}
                    <div className="space-y-2 md:col-span-2"><Label>Relevant document (required)</Label><Input value={act.documentName} onChange={e => setAct({ ...act, documentName: e.target.value })} placeholder="e.g. assignment-brief.pdf" /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Instructions</Label><Textarea value={act.instructions} onChange={e => setAct({ ...act, instructions: e.target.value })} /></div>
                    {actErr && <p className="text-xs text-red-600 md:col-span-2">{actErr}</p>}
                    <div className="md:col-span-2 flex gap-2"><Button size="sm" onClick={addActivity}>Create activity</Button><Button size="sm" variant="ghost" onClick={() => setShowActForm(false)}>Cancel</Button></div>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2"><Label>Title</Label><Input value={ev.title} onChange={(e) => setEv({ ...ev, title: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Type</Label><Select value={ev.type} onValueChange={(v) => v && setEv({ ...ev, type: v as TeacherEvent["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["class", "exam", "deadline", "other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1"><Label>Linked activity (optional)</Label><Select value={ev.linkedActivityId || "none"} onValueChange={(v) => setEv({ ...ev, linkedActivityId: v === "none" ? "" : (v ?? "") })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{activities.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1"><Label>Start</Label><Input type="datetime-local" value={ev.startAt} onChange={(e) => setEv({ ...ev, startAt: e.target.value })} /></div>
                    <div className="space-y-1"><Label>End</Label><Input type="datetime-local" value={ev.endAt} onChange={(e) => setEv({ ...ev, endAt: e.target.value })} /></div>
                    <p className="text-xs text-muted-foreground md:col-span-2">Events are class schedule items such as deadlines, exams, or class activities. Link an event to an activity to keep them connected.</p>
                    {evErr && <p className="text-xs text-red-600 md:col-span-2">{evErr}</p>}
                    <div className="md:col-span-2 flex gap-2"><Button size="sm" onClick={addEvent}>Add event</Button><Button size="sm" variant="ghost" onClick={() => setShowEvForm(false)}>Cancel</Button></div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? <p className="text-sm text-muted-foreground">No announcements yet.</p> : announcements.map((a) => (
                  <div key={a.id} className="border-b pb-3 last:border-0 last:pb-0">
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
                    <p className="text-sm mt-1">{a.body}</p>
                  </div>
                ))}
                <div className="space-y-2 rounded border p-3">
                  <p className="text-sm font-medium">{editAnnId ? "Edit announcement" : "Post announcement"}</p>
                  <Label htmlFor="ann-title">Title</Label><Input id="ann-title" value={annTitle} onChange={e => setAnnTitle(e.target.value)} />
                  <Label htmlFor="ann-body">Body</Label><Textarea id="ann-body" value={annBody} onChange={e => setAnnBody(e.target.value)} />
                  {annErr && <p className="text-xs text-red-600">{annErr}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveAnnouncement}>{editAnnId ? "Save" : "Post announcement"}</Button>
                    {editAnnId && <Button size="sm" variant="ghost" onClick={() => { setEditAnnId(null); setAnnTitle(""); setAnnBody(""); setAnnErr(""); }}>Cancel</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Section details</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Program:</span> {section.section.programCode}</p>
                  <p><span className="text-muted-foreground">Credits:</span> {section.creditHours}</p>
                  <p><span className="text-muted-foreground">Enrolled:</span> {section.section.enrolledCount} (admin-managed)</p>
                  <p><span className="text-muted-foreground">Results:</span> {resultState?.published ? "Published" : "Not published"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
                <CardContent className="text-sm">{section.schedule}</CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="size-4" />Required assessments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {requiredExams.length === 0 ? <p className="text-sm text-muted-foreground">No required midterm/final configured.</p> : requiredExams.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.dueAt}{a.physicalRoom ? ` · Physical · ${a.physicalRoom}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.documentName ? <><Badge variant="outline">Document uploaded</Badge><span className="text-xs text-muted-foreground inline-flex items-center gap-1"><FileText className="size-3" />{a.documentName}</span></> : <><Badge variant="secondary" className="gap-1"><AlertCircle className="size-3" />Pending document</Badge><Button size="sm" variant="outline" onClick={() => attachRequiredDoc(a.id)}><FileUp className="size-4 mr-1" />Upload</Button></>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Materials</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Lecture slides, links, and reference files shared with students.</p>
              <div className="flex flex-wrap gap-2">
                {materials.map(m => (
                  <div key={m.id} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <FileText className="size-4 text-muted-foreground" />
                    <div><p className="font-medium leading-none">{m.name}</p><p className="text-xs text-muted-foreground">{m.type}{m.size ? ` · ${m.size}` : ""}</p></div>
                    <IconBtn title="Remove material" danger onClick={() => ctx.setMaterials(prev => prev.filter(x => x.id !== m.id))}><Trash2 className="size-4" /></IconBtn>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 rounded border p-3 md:grid-cols-[1fr_1fr_auto] items-end">
                <div className="space-y-1"><Label htmlFor="mat-name">Material name</Label><Input id="mat-name" value={matName} onChange={e => setMatName(e.target.value)} /></div>
                <div className="space-y-1"><Label htmlFor="mat-url">Link URL (optional)</Label><Input id="mat-url" value={matUrl} onChange={e => setMatUrl(e.target.value)} placeholder="https://..." /></div>
                <Button size="sm" onClick={addMaterial}>Add material</Button>
                {matErr && <p className="text-xs text-red-600 md:col-span-3">{matErr}</p>}
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Classwork</h2>
              <p className="text-xs text-muted-foreground">Kind sets behavior; category sets grading bucket.</p>
            </div>
            <div className="space-y-2">
              {activities.length === 0 ? <Card><CardContent className="py-6 text-sm text-muted-foreground">No activities yet.</CardContent></Card> : activities.map((a) => {
                const actQuestions = ctx.assessmentQuestions.filter(q => q.activityId === a.id);
                const isQuizExam = a.kind === "quiz" || a.kind === "exam";
                return (
                  <details key={a.id} className="rounded-lg border px-4 py-3">
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium flex items-center gap-2">{a.title}{a.required && <Badge variant="secondary">Required</Badge>}</p>
                          <p className="text-xs text-muted-foreground capitalize">{a.kind} · {a.category} · Open {a.openAt} · Due {a.dueAt}{a.documentName ? ` · ${a.documentName}` : " · Document pending"}{a.physicalRoom ? ` · ${a.physicalRoom}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                          <Link to={`/teacher/grading?activity=${a.id}`} title="Open grading queue" aria-label="Open grading queue" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><ExternalLink className="size-4" /></Link>
                          {isQuizExam && <IconBtn title="Manage assessment questions" onClick={() => setQActId(qActId === a.id ? "" : a.id)}><HelpCircle className="size-4" /></IconBtn>}
                          <IconBtn title="Delete activity" danger onClick={() => ctx.setActivities((prev) => prev.filter((x) => x.id !== a.id))}><Trash2 className="size-4" /></IconBtn>
                        </div>
                      </div>
                    </summary>
                    <div className="mt-3 space-y-3 text-sm">
                      <p className="text-muted-foreground">{a.instructions}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Max {a.maxMarks}</span>
                        {a.submissionModes.length > 0 && <span>Submission: {a.submissionModes.join(", ")}</span>}
                        {a.reviewPolicy && <span>Review: {a.reviewPolicy}</span>}
                      </div>
                      {qActId === a.id && isQuizExam && (
                        <div className="space-y-3 rounded border p-3">
                          <p className="text-sm font-medium">Assessment questions</p>
                          <p className="text-xs text-muted-foreground">Add MCQ or written questions for this quiz/exam.</p>
                          <div className="space-y-2">{actQuestions.map(q => (
                            <div key={q.id} className="rounded border px-3 py-2 text-sm"><div className="flex justify-between gap-2"><p className="font-medium">{q.text}</p><IconBtn title="Remove question" danger onClick={() => ctx.setAssessmentQuestions(prev => prev.filter(x => x.id !== q.id))}><Trash2 className="size-4" /></IconBtn></div><p className="text-xs text-muted-foreground capitalize">{q.type} · {q.marks} marks{q.options ? ` · Options: ${q.options.join(", ")} · Correct: ${q.correctOption}` : ""}</p></div>
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
                  </details>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Events</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Class schedule items such as deadlines, exams, or class activities.</p>
                {events.length === 0 ? <p className="text-sm text-muted-foreground">No events scheduled.</p> : events.map((e) => {
                  const linked = activities.find((a) => a.id === e.linkedActivityId);
                  return <div key={e.id} className="flex items-start justify-between rounded border px-3 py-2 text-sm"><div><p className="font-medium">{e.title}</p><p className="text-xs text-muted-foreground capitalize">{e.type} · {e.startAt} - {e.endAt}{linked ? ` · ${linked.title}` : ""}</p></div><IconBtn title="Remove event" danger onClick={() => ctx.setEvents((prev) => prev.filter((x) => x.id !== e.id))}><Trash2 className="size-4" /></IconBtn></div>;
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent questions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {questions.length === 0 ? <p className="text-sm text-muted-foreground">No questions yet.</p> : questions.slice(0, 4).map((q) => (
                  <Link key={q.id} to="/teacher/questions" className="block rounded border p-2 text-sm hover:bg-muted/40">
                    <p className="font-medium line-clamp-1">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{students.find(s => s.id === q.studentId)?.name ?? q.studentId} · <span className="capitalize">{q.status}</span></p>
                  </Link>
                ))}
                <Link to="/teacher/questions" className="text-sm text-blue-600 hover:underline">View all questions</Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default ClassDetail;
