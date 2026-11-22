import { AlertCircle, CalendarClock, FileText, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import Tabs from "../../components/Tabs";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { getSectionStudents, getTeacherSection, type AssessmentQuestion, type TeacherActivity, type TeacherEvent } from "../../mock/teacher";
import { students } from "../../models";

const CATEGORY_OPTIONS = ["Assignments", "Quizzes", "Project", "Midterm", "Final", "Lab", "Participation"] as const;

function err(v: string, msg: string) { return v.trim() ? "" : msg; }

function ClassDetail() {
  const { sectionId } = useParams();
  const section = getTeacherSection(sectionId);
  const ctx = useOutletContext<TeacherContext>();
  const [tab, setTab] = useState<"overview" | "classwork" | "people" | "grades">("overview");

  const sid = section?.id;
  const activities = useMemo(() => ctx.activities.filter((a) => a.sectionId === sid), [ctx.activities, sid]);
  const materials = useMemo(() => ctx.materials.filter((m) => m.sectionId === sid), [ctx.materials, sid]);
  const announcements = useMemo(() => ctx.announcements.filter((a) => a.sectionId === sid), [ctx.announcements, sid]);
  const questions = useMemo(() => ctx.questions.filter((q) => q.sectionId === sid), [ctx.questions, sid]);
  const events = useMemo(() => ctx.events.filter((e) => e.sectionId === sid), [ctx.events, sid]);
  const categories = useMemo(() => ctx.categories.filter((c) => c.sectionId === sid), [ctx.categories, sid]);
  const resultState = ctx.resultStates.find((r) => r.sectionId === sid);
  const roster = sid ? getSectionStudents(sid) : [];

  // material form
  const [matName, setMatName] = useState(""); const [matUrl, setMatUrl] = useState(""); const [matErr, setMatErr] = useState("");
  // announcement form
  const [annTitle, setAnnTitle] = useState(""); const [annBody, setAnnBody] = useState(""); const [annErr, setAnnErr] = useState("");
  // activity form
  const [act, setAct] = useState({
    title: "", kind: "assignment" as TeacherActivity["kind"], category: "Assignments", maxMarks: "100",
    openAt: "", dueAt: "", instructions: "", reviewPolicy: "after_graded" as "immediate" | "after_close" | "after_graded" | "never",
    submissionMode: "upload" as "upload" | "physical", documentName: "", physicalRoom: "",
  });
  const [actErr, setActErr] = useState("");
  // category form
  const [catName, setCatName] = useState("Assignments"); const [catWeight, setCatWeight] = useState(""); const [catErr, setCatErr] = useState("");
  // event form
  const [ev, setEv] = useState({ title: "", type: "other" as TeacherEvent["type"], startAt: "", endAt: "", linkedActivityId: "" });
  const [evErr, setEvErr] = useState("");
  // assessment question form
  const [qActId, setQActId] = useState<string>("");
  const [aq, setAq] = useState({ type: "mcq" as AssessmentQuestion["type"], text: "", options: "A,B,C,D", correctOption: "0", marks: "5" });
  const [aqErr, setAqErr] = useState("");

  if (!section || !sid) return <div className="mx-auto max-w-5xl px-4 py-8">Class not found.</div>;

  const requiredExams = activities.filter((a) => a.required && (a.category === "Midterm" || a.category === "Final"));

  function addMaterial() {
    const e = err(matName, "Material name is required."); if (e) { setMatErr(e); return; }
    ctx.setMaterials((prev) => [{ id: `tm-${Date.now()}`, sectionId: section!.id, name: matName.trim(), type: matUrl ? "link" : "file", size: matUrl ? undefined : "mock", url: matUrl.trim() || undefined, uploadedAt: "2026-11-22" }, ...prev]);
    setMatName(""); setMatUrl(""); setMatErr("");
  }
  function addAnnouncement() {
    const e = err(annTitle, "Title is required.") || err(annBody, "Body is required."); if (e) { setAnnErr(e); return; }
    ctx.setAnnouncements((prev) => [{ id: `tan-${Date.now()}`, sectionId: section!.id, title: annTitle.trim(), body: annBody.trim(), date: "2026-11-22" }, ...prev]);
    setAnnTitle(""); setAnnBody(""); setAnnErr("");
  }
  function addActivity() {
    const e = err(act.title, "Title is required.") || err(act.openAt, "Open date is required.") || err(act.dueAt, "Due date is required.")
      || err(act.instructions, "Instructions are required.") || err(act.documentName, "A relevant document is required.")
      || ((!Number(act.maxMarks) || Number(act.maxMarks) <= 0) ? "Max marks must be > 0." : "")
      || (act.submissionMode === "physical" ? err(act.physicalRoom, "Room/location is required for physical activities.") : "");
    if (e) { setActErr(e); return; }
    const submissionModes = act.kind === "quiz" || act.kind === "exam"
      ? (act.submissionMode === "physical" ? ["physical"] as ("upload" | "physical")[] : [])
      : [act.submissionMode];
    const newAct: TeacherActivity = {
      id: `act-${Date.now()}`, sectionId: section!.id, kind: act.kind, title: act.title.trim(), instructions: act.instructions.trim(),
      category: act.category, maxMarks: Number(act.maxMarks), openAt: act.openAt, dueAt: act.dueAt, submissionModes,
      physicalRoom: act.submissionMode === "physical" ? act.physicalRoom.trim() : undefined,
      hasMcq: act.kind === "quiz", reviewPolicy: act.kind === "quiz" || act.kind === "exam" ? act.reviewPolicy : undefined,
      documentName: act.documentName.trim(), required: act.category === "Midterm" || act.category === "Final", published: true,
    };
    ctx.setActivities((prev) => [newAct, ...prev]);
    setAct({ title: "", kind: "assignment", category: "Assignments", maxMarks: "100", openAt: "", dueAt: "", instructions: "", reviewPolicy: "after_graded", submissionMode: "upload", documentName: "", physicalRoom: "" });
    setActErr("");
  }
  function saveCategory() {
    if (resultState?.frozenWeights) { setCatErr("Weights are frozen after publishing results."); return; }
    const e = err(catName, "Category name is required."); const w = Number(catWeight);
    if (e || !w || w <= 0 || w > 100) { setCatErr(e || "Weight must be 1-100."); return; }
    if (categories.some((c) => c.name.toLowerCase() === catName.trim().toLowerCase())) { setCatErr("Category already exists."); return; }
    ctx.setCategories((prev) => [...prev, { id: `gc-${Date.now()}`, sectionId: section!.id, name: catName.trim(), weight: w }]);
    setCatName("Assignments"); setCatWeight(""); setCatErr("");
  }
  function publishResults() {
    const total = categories.reduce((s, c) => s + c.weight, 0);
    if (total !== 100) { alert("Category weights must total 100% before publishing."); return; }
    const hasMid = activities.some((a) => a.category === "Midterm");
    const hasFinal = activities.some((a) => a.category === "Final");
    if (!hasMid || !hasFinal) { alert("Midterm and Final assessment results must exist before publishing."); return; }
    ctx.setResultStates((prev) => prev.map((r) => r.sectionId === sid ? { ...r, published: true, frozenWeights: true } : r));
  }
  function addEvent() {
    const e = err(ev.title, "Event title is required.") || err(ev.startAt, "Start time is required.") || err(ev.endAt, "End time is required.");
    if (e) { setEvErr(e); return; }
    if (ev.linkedActivityId && !activities.some((a) => a.id === ev.linkedActivityId)) { setEvErr("Linked activity must belong to this section."); return; }
    ctx.setEvents((prev) => [{ id: `ev-${Date.now()}`, sectionId: section!.id, title: ev.title.trim(), type: ev.type, startAt: ev.startAt, endAt: ev.endAt, linkedActivityId: ev.linkedActivityId || undefined }, ...prev]);
    setEv({ title: "", type: "other", startAt: "", endAt: "", linkedActivityId: "" }); setEvErr("");
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
  const actCols: Column<TeacherActivity>[] = [
    { key: "title", label: "Activity", render: (a) => <div><p className="font-medium flex items-center gap-2">{a.title}{a.required && <Badge variant="secondary">Required</Badge>}</p><p className="text-xs text-muted-foreground capitalize">{a.kind} · {a.category}{a.documentName ? ` · ${a.documentName}` : " · Document pending"}</p></div> },
    { key: "dueAt", label: "Due" },
    { key: "maxMarks", label: "Max" },
    { key: "id", label: "Actions", render: (a) => <div className="flex gap-2"><Link to={`/teacher/grading?activity=${a.id}`} className="text-blue-600 hover:underline">Queue</Link>{(a.kind === "quiz" || a.kind === "exam") && <button type="button" className="text-blue-600 hover:underline" onClick={() => { setQActId(a.id); setTab("classwork"); }}>Questions</button>}<button type="button" className="text-red-600 hover:underline" onClick={() => ctx.setActivities((prev) => prev.filter((x) => x.id !== a.id))}>Delete</button></div> },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My classes", to: "/teacher/classes" }, { label: `${section.section.subjectCode} - ${section.section.code}` }]} />
      <div>
        <h1 className="text-2xl font-bold">{section.section.subjectCode} - Section {section.section.code}</h1>
        <p className="text-sm text-muted-foreground">{section.subjectTitle} · {section.term} · {section.schedule}</p>
      </div>

      <Tabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview", content: (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Section info</CardTitle></CardHeader><CardContent className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Program:</span> {section.section.programCode}</p>
                <p><span className="font-medium text-foreground">Enrolled:</span> {section.section.enrolledCount} (admin-managed)</p>
                <p><span className="font-medium text-foreground">Credits:</span> {section.creditHours}</p>
                <p><span className="font-medium text-foreground">Results:</span> {resultState?.published ? "Published" : "Not published"}</p>
              </CardContent></Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="size-4" />Required assessments</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {requiredExams.length === 0 ? <p className="text-sm text-muted-foreground">No required midterm/final configured.</p> : requiredExams.map((a) => (
                    <div key={a.id} className="rounded border p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.dueAt}{a.physicalRoom ? ` · Physical · ${a.physicalRoom}` : ""}</p>
                        </div>
                        {a.documentName ? <Badge variant="outline">Document uploaded</Badge> : <Badge variant="secondary" className="gap-1"><AlertCircle className="size-3" />Pending document</Badge>}
                      </div>
                      {!a.documentName && <Button size="sm" variant="outline" className="mt-2" onClick={() => attachRequiredDoc(a.id)}>Upload required document</Button>}
                      {a.documentName && <p className="mt-1 text-xs text-muted-foreground"><FileText className="inline size-3 mr-1" />{a.documentName}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card><CardHeader><CardTitle className="text-base">Announcements</CardTitle></CardHeader><CardContent className="space-y-3">
                {announcements.length === 0 ? <p className="text-sm text-muted-foreground">No announcements.</p> : announcements.slice(0, 3).map(a => <div key={a.id} className="rounded border p-2"><div className="flex justify-between gap-2"><p className="font-medium text-sm">{a.title}</p><Button variant="ghost" size="sm" onClick={() => ctx.setAnnouncements(prev => prev.filter(x => x.id !== a.id))}>Remove</Button></div><p className="text-xs text-muted-foreground">{a.date}</p><p className="text-sm mt-1">{a.body}</p></div>)}
                <div className="space-y-2 rounded border p-3">
                  <Label htmlFor="ann-title">Title</Label><Input id="ann-title" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} />
                  <Label htmlFor="ann-body">Body</Label><Textarea id="ann-body" value={annBody} onChange={e=>setAnnBody(e.target.value)} />
                  {annErr && <p className="text-xs text-red-600">{annErr}</p>}
                  <Button size="sm" onClick={addAnnouncement}>Post announcement</Button>
                </div>
              </CardContent></Card>

              <Card><CardHeader><CardTitle className="text-base">Questions</CardTitle></CardHeader><CardContent className="space-y-2">
                {questions.length === 0 ? <p className="text-sm text-muted-foreground">No questions yet.</p> : questions.slice(0, 4).map((q) => (
                  <Link key={q.id} to="/teacher/questions" className="block rounded border p-2 text-sm hover:bg-muted/40">
                    <p className="font-medium line-clamp-1">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{students.find(s=>s.id===q.studentId)?.name ?? q.studentId} · <span className="capitalize">{q.status}</span></p>
                  </Link>
                ))}
                <Link to="/teacher/questions" className="text-sm text-blue-600 hover:underline">View all questions</Link>
              </CardContent></Card>
            </div>
          )},

          { id: "classwork", label: "Classwork", content: (
            <div className="space-y-4">
              <Card><CardHeader><CardTitle className="text-base">Materials</CardTitle></CardHeader><CardContent className="space-y-3">
                {materials.map(m => <div key={m.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm"><div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.type}{m.size ? ` · ${m.size}` : ""} · {m.uploadedAt}</p></div><Button variant="ghost" size="sm" onClick={() => ctx.setMaterials(prev => prev.filter(x => x.id !== m.id))}>Remove</Button></div>)}
                <div className="space-y-2 rounded border p-3">
                  <Label htmlFor="mat-name">Material name</Label><Input id="mat-name" value={matName} onChange={e=>setMatName(e.target.value)} />
                  <Label htmlFor="mat-url">Link URL (optional)</Label><Input id="mat-url" value={matUrl} onChange={e=>setMatUrl(e.target.value)} placeholder="https://..." />
                  {matErr && <p className="text-xs text-red-600">{matErr}</p>}
                  <Button size="sm" onClick={addMaterial}>Add material</Button>
                </div>
              </CardContent></Card>

              <Card><CardHeader><CardTitle className="text-base">Activities</CardTitle></CardHeader><CardContent className="space-y-4">
                <SimpleTable columns={actCols} data={activities} searchable={true} searchKeys={["title", "category"]} />
                <div className="grid gap-3 rounded border p-3 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={act.title} onChange={e=>setAct({...act,title:e.target.value})} /></div>
                  <div className="space-y-2"><Label>Kind</Label><Select value={act.kind} onValueChange={v=> v && setAct({...act,kind:v as TeacherActivity["kind"]})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["assignment","quiz","project","exam"].map(k=><SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Category</Label><Select value={act.category} onValueChange={v=> v && setAct({...act,category:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Max marks</Label><Input type="number" value={act.maxMarks} onChange={e=>setAct({...act,maxMarks:e.target.value})} /></div>
                  <div className="space-y-2"><Label>Submission mode</Label><Select value={act.submissionMode} onValueChange={(v)=> v && setAct({...act,submissionMode:v as "upload"|"physical"})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upload">Upload</SelectItem><SelectItem value="physical">Physical</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Open date</Label><Input type="date" value={act.openAt} onChange={e=>setAct({...act,openAt:e.target.value})} /></div>
                  <div className="space-y-2"><Label>Due date</Label><Input type="date" value={act.dueAt} onChange={e=>setAct({...act,dueAt:e.target.value})} /></div>
                  {(act.kind === "quiz" || act.kind === "exam") && <div className="space-y-2"><Label>Review policy</Label><Select value={act.reviewPolicy} onValueChange={(v)=> v && setAct({...act,reviewPolicy:v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["immediate","after_close","after_graded","never"].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>}
                  {act.submissionMode === "physical" && <div className="space-y-2"><Label>Room / location (physical only)</Label><Input value={act.physicalRoom} onChange={e=>setAct({...act,physicalRoom:e.target.value})} placeholder="e.g. Exam Hall A" /></div>}
                  <div className="space-y-2 md:col-span-2"><Label>Relevant document (required)</Label><Input value={act.documentName} onChange={e=>setAct({...act,documentName:e.target.value})} placeholder="e.g. assignment-brief.pdf" /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Instructions</Label><Textarea value={act.instructions} onChange={e=>setAct({...act,instructions:e.target.value})} /></div>
                  {actErr && <p className="text-xs text-red-600 md:col-span-2">{actErr}</p>}
                  <div className="md:col-span-2"><Button size="sm" onClick={addActivity}>Create activity</Button></div>
                </div>
              </CardContent></Card>

              <Card><CardHeader><CardTitle className="text-base">Assessment questions</CardTitle></CardHeader><CardContent className="space-y-3">
                <div className="space-y-1"><Label>Quiz/Exam activity</Label><Select value={qActId || "none"} onValueChange={(v)=> setQActId(v === "none" ? "" : (v ?? ""))}><SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger><SelectContent><SelectItem value="none">Select activity</SelectItem>{activities.filter(a=>a.kind==="quiz"||a.kind==="exam").map(a=><SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent></Select></div>
                {qActId && <div className="space-y-2">{ctx.assessmentQuestions.filter(q=>q.activityId===qActId).map(q => <div key={q.id} className="rounded border px-3 py-2 text-sm"><div className="flex justify-between gap-2"><p className="font-medium">{q.text}</p><Button variant="ghost" size="sm" onClick={() => ctx.setAssessmentQuestions(prev => prev.filter(x=>x.id!==q.id))}>Remove</Button></div><p className="text-xs text-muted-foreground capitalize">{q.type} · {q.marks} marks{q.options ? ` · Options: ${q.options.join(", ")} · Correct: ${q.correctOption}` : ""}</p></div>)}</div>}
                <div className="grid gap-2 md:grid-cols-2 rounded border p-3">
                  <div className="space-y-1"><Label>Type</Label><Select value={aq.type} onValueChange={(v)=> v && setAq({...aq,type:v as AssessmentQuestion["type"]})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mcq">MCQ</SelectItem><SelectItem value="written">Written</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><Label>Marks</Label><Input type="number" value={aq.marks} onChange={e=>setAq({...aq,marks:e.target.value})} /></div>
                  <div className="space-y-1 md:col-span-2"><Label>Question text</Label><Textarea value={aq.text} onChange={e=>setAq({...aq,text:e.target.value})} /></div>
                  {aq.type==="mcq" && <><div className="space-y-1"><Label>Options (comma-separated)</Label><Input value={aq.options} onChange={e=>setAq({...aq,options:e.target.value})} /></div><div className="space-y-1"><Label>Correct option index (0-based)</Label><Input type="number" value={aq.correctOption} onChange={e=>setAq({...aq,correctOption:e.target.value})} /></div></>}
                  {aqErr && <p className="text-xs text-red-600 md:col-span-2">{aqErr}</p>}
                  <div className="md:col-span-2"><Button size="sm" onClick={addAssessmentQuestion}>Add question</Button></div>
                </div>
              </CardContent></Card>

              <Card><CardHeader><CardTitle className="text-base">Events</CardTitle></CardHeader><CardContent className="space-y-3">
                {events.length === 0 ? <p className="text-sm text-muted-foreground">No events scheduled.</p> : events.map((e) => {
                  const linked = activities.find((a) => a.id === e.linkedActivityId);
                  return <div key={e.id} className="flex items-start justify-between rounded border px-3 py-2 text-sm"><div><p className="font-medium">{e.title}</p><p className="text-xs text-muted-foreground capitalize">{e.type} · {e.startAt} - {e.endAt}{linked ? ` · Linked: ${linked.title}` : ""}</p></div><Button variant="ghost" size="sm" onClick={() => ctx.setEvents((prev) => prev.filter((x) => x.id !== e.id))}>Remove</Button></div>;
                })}
                <div className="grid gap-3 rounded border p-3 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2"><Label>Title</Label><Input value={ev.title} onChange={(e)=>setEv({...ev,title:e.target.value})} /></div>
                  <div className="space-y-1"><Label>Type</Label><Select value={ev.type} onValueChange={(v)=> v && setEv({...ev,type:v as TeacherEvent["type"]})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["class","exam","deadline","other"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label>Start</Label><Input type="datetime-local" value={ev.startAt} onChange={(e)=>setEv({...ev,startAt:e.target.value})} /></div>
                  <div className="space-y-1"><Label>End</Label><Input type="datetime-local" value={ev.endAt} onChange={(e)=>setEv({...ev,endAt:e.target.value})} /></div>
                  <div className="space-y-1 md:col-span-2"><Label>Linked activity (optional, same section)</Label><Select value={ev.linkedActivityId || "none"} onValueChange={(v)=> setEv({...ev,linkedActivityId: v === "none" ? "" : (v ?? "")})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{activities.map(a=><SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent></Select></div>
                  {evErr && <p className="text-xs text-red-600 md:col-span-2">{evErr}</p>}
                  <div className="md:col-span-2"><Button size="sm" onClick={addEvent}>Add event</Button></div>
                </div>
              </CardContent></Card>
            </div>
          )},

          { id: "people", label: "People", content: (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="size-4" />Enrolled students</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Roster is read-only. Enrolment is managed by admin.</p>
                <SimpleTable columns={[{key:"name",label:"Name", render: (s) => <span className="inline-flex items-center gap-2"><Users className="size-4 text-muted-foreground" />{s.name}</span>},{key:"email",label:"Email"},{key:"department",label:"Department"}]} data={roster} searchable={true} searchKeys={["name","email"]} />
              </CardContent>
            </Card>
          )},

          { id: "grades", label: "Grades", content: (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader><CardTitle className="text-base">Weight total</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${totalWeight===100?"text-emerald-600":"text-amber-600"}`}>{totalWeight}%</p><p className="text-xs text-muted-foreground">Must total 100% before publish.</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Weights</CardTitle></CardHeader><CardContent><p className="text-sm">{resultState?.frozenWeights ? "Frozen (results published)" : "Editable"}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Results</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-sm">{resultState?.published ? "Published" : "Not published"}</p><Button size="sm" onClick={publishResults} disabled={resultState?.published}>Publish results</Button></CardContent></Card>
              </div>

              <Card><CardHeader><CardTitle className="text-base">Category weights</CardTitle></CardHeader><CardContent className="space-y-3">
                {categories.map(c => <div key={c.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm"><span>{c.name}</span><span className="font-medium">{c.weight}%</span></div>)}
                {!resultState?.frozenWeights && <div className="grid gap-2 md:grid-cols-3 rounded border p-3">
                  <div className="space-y-1"><Label>Category</Label><Select value={catName} onValueChange={(v)=> v && setCatName(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label>Weight %</Label><Input type="number" value={catWeight} onChange={e=>setCatWeight(e.target.value)} /></div>
                  <div className="flex items-end"><Button size="sm" onClick={saveCategory}>Add category</Button></div>
                  {catErr && <p className="text-xs text-red-600 md:col-span-3">{catErr}</p>}
                </div>}
                <p className="text-xs text-muted-foreground">Pick categories from the standard list. Midterm and Final are required before publishing results. Weights freeze after publish.</p>
              </CardContent></Card>

              <Card><CardHeader><CardTitle className="text-base">Gradebook preview</CardTitle></CardHeader><CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Preview of current marks across activities for each student. It helps you spot missing submissions, grading progress, and how marks look before publishing final results. Missing items count as zero in category calculation; publish requires Midterm + Final and total weight 100%.</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm"><thead><tr className="border-b"><th className="p-2 text-left">Student</th>{activities.slice(0,5).map(a=><th key={a.id} className="p-2 text-left">{a.title}</th>)}</tr></thead><tbody>
                    {roster.map(stu => <tr key={stu.id} className="border-b last:border-0"><td className="p-2 font-medium">{stu.name}</td>{activities.slice(0,5).map(a => { const sub = ctx.submissions.find(s=>s.activityId===a.id && s.studentId===stu.id); return <td key={a.id} className="p-2 text-muted-foreground">{sub?.marks != null ? `${sub.marks}/${a.maxMarks}` : sub?.status === "submitted" ? "Submitted" : "—"}</td>; })}</tr>)}
                  </tbody></table>
                </div>
              </CardContent></Card>
            </div>
          )},
        ]}
      />
    </div>
  );
}

export default ClassDetail;
