import { useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import Tabs from "../../components/Tabs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Badge } from "../../components/ui/badge";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { getSectionStudents, getTeacherSection, type TeacherActivity, type TeacherQuestion } from "../../mock/teacher";
import { students } from "../../models";

function err(v: string, msg: string) { return v.trim() ? "" : msg; }

function ClassDetail() {
  const { sectionId } = useParams();
  const section = getTeacherSection(sectionId);
  const ctx = useOutletContext<TeacherContext>();
  const [tab, setTab] = useState<"overview" | "content" | "activities" | "people" | "gradebook" | "questions">("overview");

  const sid = section?.id;
  const activities = useMemo(() => ctx.activities.filter((a) => a.sectionId === sid), [ctx.activities, sid]);
  const materials = useMemo(() => ctx.materials.filter((m) => m.sectionId === sid), [ctx.materials, sid]);
  const announcements = useMemo(() => ctx.announcements.filter((a) => a.sectionId === sid), [ctx.announcements, sid]);
  const questions = useMemo(() => ctx.questions.filter((q) => q.sectionId === sid), [ctx.questions, sid]);
  const categories = useMemo(() => ctx.categories.filter((c) => c.sectionId === sid), [ctx.categories, sid]);
  const resultState = ctx.resultStates.find((r) => r.sectionId === sid);
  const roster = sid ? getSectionStudents(sid) : [];

  // material form
  const [matName, setMatName] = useState(""); const [matUrl, setMatUrl] = useState(""); const [matErr, setMatErr] = useState("");
  // announcement form
  const [annTitle, setAnnTitle] = useState(""); const [annBody, setAnnBody] = useState(""); const [annErr, setAnnErr] = useState("");
  // activity form
  const [act, setAct] = useState({ title: "", kind: "assignment" as TeacherActivity["kind"], category: "Assignments", maxMarks: "100", openAt: "", dueAt: "", instructions: "" });
  const [actErr, setActErr] = useState("");
  // category form
  const [catName, setCatName] = useState(""); const [catWeight, setCatWeight] = useState(""); const [catErr, setCatErr] = useState("");

  if (!section || !sid) return <div className="mx-auto max-w-5xl px-4 py-8">Class not found.</div>;

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
    const e = err(act.title, "Title is required.") || err(act.openAt, "Open date is required.") || err(act.dueAt, "Due date is required.") || err(act.instructions, "Instructions are required.") || ((!Number(act.maxMarks) || Number(act.maxMarks) <= 0) ? "Max marks must be > 0." : "");
    if (e) { setActErr(e); return; }
    const newAct: TeacherActivity = { id: `act-${Date.now()}`, sectionId: section!.id, kind: act.kind, title: act.title.trim(), instructions: act.instructions.trim(), category: act.category, maxMarks: Number(act.maxMarks), openAt: act.openAt, dueAt: act.dueAt, submissionModes: act.kind === "quiz" ? [] : ["upload"], hasMcq: act.kind === "quiz", reviewPolicy: act.kind === "quiz" ? "after_graded" : undefined, published: true };
    ctx.setActivities((prev) => [newAct, ...prev]);
    setAct({ title: "", kind: "assignment", category: "Assignments", maxMarks: "100", openAt: "", dueAt: "", instructions: "" }); setActErr("");
  }
  function saveCategory() {
    if (resultState?.frozenWeights) { setCatErr("Weights are frozen after publishing results."); return; }
    const e = err(catName, "Category name is required."); const w = Number(catWeight);
    if (e || !w || w <= 0 || w > 100) { setCatErr(e || "Weight must be 1-100."); return; }
    ctx.setCategories((prev) => [...prev, { id: `gc-${Date.now()}`, sectionId: section!.id, name: catName.trim(), weight: w }]);
    setCatName(""); setCatWeight(""); setCatErr("");
  }
  function publishResults() {
    const total = categories.reduce((s, c) => s + c.weight, 0);
    if (total !== 100) { alert("Category weights must total 100% before publishing."); return; }
    const hasMid = activities.some((a) => a.category === "Midterm");
    const hasFinal = activities.some((a) => a.category === "Final");
    if (!hasMid || !hasFinal) { alert("Midterm and Final assessment results must exist before publishing."); return; }
    ctx.setResultStates((prev) => prev.map((r) => r.sectionId === sid ? { ...r, published: true, frozenWeights: true } : r));
  }

  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
  const qCols: Column<TeacherQuestion>[] = [
    { key: "question", label: "Question", render: (q) => <span className="line-clamp-2">{q.question}</span> },
    { key: "studentId", label: "Student", render: (q) => students.find((s) => s.id === q.studentId)?.name ?? q.studentId },
    { key: "status", label: "Status", render: (q) => <Badge variant={q.status === "pending" ? "secondary" : "outline"} className="capitalize">{q.status}</Badge> },
  ];
  const actCols: Column<TeacherActivity>[] = [
    { key: "title", label: "Activity", render: (a) => <div><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground capitalize">{a.kind} · {a.category}</p></div> },
    { key: "dueAt", label: "Due" },
    { key: "maxMarks", label: "Max" },
    { key: "id", label: "Grading", render: (a) => <Link to={`/teacher/grading?activity=${a.id}`} className="text-blue-600 hover:underline">Open queue</Link> },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My classes", to: "/teacher/classes" }, { label: `${section.section.subjectCode} - ${section.section.code}` }]} />
      <div>
        <h1 className="text-2xl font-bold">{section.section.subjectCode} - Section {section.section.code}</h1>
        <p className="text-sm text-muted-foreground">{section.subjectTitle} · {section.term} · {section.schedule} · {section.room}</p>
      </div>

      <Tabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview", content: (
            <div className="grid gap-4 md:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Section info</CardTitle></CardHeader><CardContent className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Program:</span> {section.section.programCode}</p>
                <p><span className="font-medium text-foreground">Enrolled:</span> {section.section.enrolledCount} (admin-managed)</p>
                <p><span className="font-medium text-foreground">Credits:</span> {section.creditHours}</p>
                <p><span className="font-medium text-foreground">Results:</span> {resultState?.published ? "Published" : "Not published"}</p>
              </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Recent announcements</CardTitle></CardHeader><CardContent className="space-y-2">
                {announcements.length === 0 ? <p className="text-sm text-muted-foreground">No announcements.</p> : announcements.slice(0,3).map(a => <div key={a.id} className="rounded border p-2"><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground">{a.date}</p></div>)}
              </CardContent></Card>
            </div>
          )},
          { id: "content", label: "Content", content: (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Materials</CardTitle></CardHeader><CardContent className="space-y-3">
                {materials.map(m => <div key={m.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm"><div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.type}{m.size ? ` · ${m.size}` : ""} · {m.uploadedAt}</p></div><Button variant="ghost" size="sm" onClick={() => ctx.setMaterials(prev => prev.filter(x => x.id !== m.id))}>Remove</Button></div>)}
                <div className="space-y-2 rounded border p-3">
                  <Label htmlFor="mat-name">Material name</Label><Input id="mat-name" value={matName} onChange={e=>setMatName(e.target.value)} />
                  <Label htmlFor="mat-url">Link URL (optional)</Label><Input id="mat-url" value={matUrl} onChange={e=>setMatUrl(e.target.value)} placeholder="https://..." />
                  {matErr && <p className="text-xs text-red-600">{matErr}</p>}
                  <Button size="sm" onClick={addMaterial}>Add material</Button>
                </div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Announcements</CardTitle></CardHeader><CardContent className="space-y-3">
                {announcements.map(a => <div key={a.id} className="rounded border px-3 py-2 text-sm"><div className="flex justify-between gap-2"><p className="font-medium">{a.title}</p><Button variant="ghost" size="sm" onClick={() => ctx.setAnnouncements(prev => prev.filter(x => x.id !== a.id))}>Remove</Button></div><p className="text-xs text-muted-foreground">{a.date}</p><p className="text-sm mt-1">{a.body}</p></div>)}
                <div className="space-y-2 rounded border p-3">
                  <Label htmlFor="ann-title">Title</Label><Input id="ann-title" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} />
                  <Label htmlFor="ann-body">Body</Label><Textarea id="ann-body" value={annBody} onChange={e=>setAnnBody(e.target.value)} />
                  {annErr && <p className="text-xs text-red-600">{annErr}</p>}
                  <Button size="sm" onClick={addAnnouncement}>Post announcement</Button>
                </div>
              </CardContent></Card>
            </div>
          )},
          { id: "activities", label: "Activities", content: (
            <div className="space-y-4">
              <SimpleTable columns={actCols} data={activities} searchable={true} searchKeys={["title", "category"]} />
              <Card><CardHeader><CardTitle className="text-base">Create activity</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={act.title} onChange={e=>setAct({...act,title:e.target.value})} /></div>
                <div className="space-y-2"><Label>Kind</Label><Select value={act.kind} onValueChange={v=> v && setAct({...act,kind:v as TeacherActivity["kind"]})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["assignment","quiz","project","exam"].map(k=><SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Category</Label><Select value={act.category} onValueChange={v=> v && setAct({...act,category:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Assignments","Quizzes","Project","Midterm","Final"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Max marks</Label><Input type="number" value={act.maxMarks} onChange={e=>setAct({...act,maxMarks:e.target.value})} /></div>
                <div className="space-y-2"><Label>Open date</Label><Input type="date" value={act.openAt} onChange={e=>setAct({...act,openAt:e.target.value})} /></div>
                <div className="space-y-2"><Label>Due date</Label><Input type="date" value={act.dueAt} onChange={e=>setAct({...act,dueAt:e.target.value})} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Instructions</Label><Textarea value={act.instructions} onChange={e=>setAct({...act,instructions:e.target.value})} /></div>
                {actErr && <p className="text-xs text-red-600 md:col-span-2">{actErr}</p>}
                <div className="md:col-span-2"><Button size="sm" onClick={addActivity}>Create activity</Button></div>
              </CardContent></Card>
            </div>
          )},
          { id: "people", label: "People", content: (
            <Card><CardHeader><CardTitle className="text-base">Enrolled students (read-only, admin-managed)</CardTitle></CardHeader><CardContent>
              <SimpleTable columns={[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"department",label:"Department"}]} data={roster} searchable={true} searchKeys={["name","email"]} />
            </CardContent></Card>
          )},
          { id: "gradebook", label: "Gradebook", content: (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader><CardTitle className="text-base">Weight total</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${totalWeight===100?"text-emerald-600":"text-amber-600"}`}>{totalWeight}%</p><p className="text-xs text-muted-foreground">Must total 100% before publish.</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Weights</CardTitle></CardHeader><CardContent><p className="text-sm">{resultState?.frozenWeights ? "Frozen (results published)" : "Editable"}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Results</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-sm">{resultState?.published ? "Published" : "Not published"}</p><Button size="sm" onClick={publishResults} disabled={resultState?.published}>Publish results</Button></CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle className="text-base">Category weights</CardTitle></CardHeader><CardContent className="space-y-3">
                {categories.map(c => <div key={c.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm"><span>{c.name}</span><span className="font-medium">{c.weight}%</span></div>)}
                {!resultState?.frozenWeights && <div className="grid gap-2 md:grid-cols-3 rounded border p-3">
                  <div className="space-y-1"><Label>Name</Label><Input value={catName} onChange={e=>setCatName(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Weight %</Label><Input type="number" value={catWeight} onChange={e=>setCatWeight(e.target.value)} /></div>
                  <div className="flex items-end"><Button size="sm" onClick={saveCategory}>Add category</Button></div>
                  {catErr && <p className="text-xs text-red-600 md:col-span-3">{catErr}</p>}
                </div>}
              </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Gradebook preview</CardTitle></CardHeader><CardContent className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm"><thead><tr className="border-b"><th className="p-2 text-left">Student</th>{activities.slice(0,5).map(a=><th key={a.id} className="p-2 text-left">{a.title}</th>)}</tr></thead><tbody>
                  {roster.map(stu => <tr key={stu.id} className="border-b last:border-0"><td className="p-2 font-medium">{stu.name}</td>{activities.slice(0,5).map(a => { const sub = ctx.submissions.find(s=>s.activityId===a.id && s.studentId===stu.id); return <td key={a.id} className="p-2 text-muted-foreground">{sub?.marks != null ? `${sub.marks}/${a.maxMarks}` : sub?.status === "submitted" ? "Submitted" : "—"}</td>; })}</tr>)}
                </tbody></table>
              </CardContent></Card>
              <p className="text-xs text-muted-foreground">Category calc rule: missing item = zero in category; publish requires midterm+final and total weight 100%. Published weights frozen (I18).</p>
            </div>
          )},
          { id: "questions", label: "Questions", content: (
            <Card><CardHeader><CardTitle className="text-base">Class questions</CardTitle></CardHeader><CardContent className="space-y-3">
              <SimpleTable columns={qCols} data={questions} searchable={true} searchKeys={["question"]} />
              {questions.filter(q=>q.status==="pending").map(q => (
                <div key={q.id} className="rounded border p-3 space-y-2">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground">{students.find(s=>s.id===q.studentId)?.name ?? q.studentId} · {q.askedAt}</p>
                  <AnswerBox q={q} onAnswer={(answer) => ctx.setQuestions(prev => prev.map(x => x.id===q.id ? {...x, answer, answeredAt: "2026-11-22 12:00", status: "answered"} : x))} />
                </div>
              ))}
            </CardContent></Card>
          )},
        ]}
      />
    </div>
  );
}

function AnswerBox({ q, onAnswer }: { q: TeacherQuestion; onAnswer: (a: string) => void }) {
  const [val, setVal] = useState(q.answer ?? "");
  return <div className="space-y-2"><Textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Write reply..." /><div className="flex gap-2"><Button size="sm" onClick={() => { if (val.trim()) onAnswer(val.trim()); }}>Reply</Button></div></div>;
}

export default ClassDetail;