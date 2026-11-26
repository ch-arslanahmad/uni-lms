import { useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { parseAssessmentId, parseStudentId } from "../../lib/slugs";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { AssessmentAnswers, AssessmentReference, AttachmentCard } from "../../components/teacher/AssessmentEvidence";
import {
  autoGradeMcqAnswers,
  calculateAttemptTotal,
  currentTeacherName,
  isMcqAssessment,
  isProjectAssessment,
  latestAttemptFor,
  nowTimestamp,
  requiresViva,
  teacherSections,
  vivaCapFor,
  type AssessmentAttempt,
} from "../../api";
import { students } from "../../models";

function SubmissionDetailPage() {
  const { studentRef, assessmentRef } = useParams();
  const studentId = parseStudentId(studentRef);
  const assessmentId = parseAssessmentId(assessmentRef);
  const {
    submissions,
    setSubmissions,
    assessments,
    assessmentQuestions,
    assessmentAttempts,
    setAssessmentAttempts,
    assessmentAnswers,
    setAssessmentAnswers,
  } = useOutletContext<TeacherContext>();
  const act = assessments.find((a) => a.id === assessmentId);
  const sub = submissions.find((s) => s.assessmentId === assessmentId && s.studentId === studentId);
  const section = teacherSections.find((s) => s.id === act?.sectionId);
  const student = students.find((s) => s.id === studentId);
  const questions = assessmentQuestions.filter((question) => question.assessmentId === act?.id);
  const attempt = latestAttemptFor(assessmentAttempts, act?.id, sub?.studentId);
  const answers = attempt ? assessmentAnswers.filter((answer) => answer.attemptId === attempt.id) : [];

  const [marks, setMarks] = useState(sub?.marks?.toString() ?? "");
  const [vivaMarks, setVivaMarks] = useState(() => {
    const current = sub && act && isProjectAssessment(act) ? attempt?.viva?.marks : sub?.viva?.marks;
    return current != null ? String(current) : "";
  });
  const [feedback, setFeedback] = useState(sub?.feedback ?? "");
  const [extDate, setExtDate] = useState(sub?.extensionDueAt ?? "");
  const [extReason, setExtReason] = useState(sub?.extensionReason ?? "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const autoTotal = calculateAttemptTotal(questions, answers);
  const hasMcq = questions.some((question) => question.type === "mcq");

  function setWrittenMark(questionId: string, value: number | null) {
    if (!attempt) return;
    setAssessmentAnswers((previous) => previous.map((answer) =>
      answer.attemptId === attempt.id && answer.questionId === questionId
        ? { ...answer, marksAwarded: value ?? undefined }
        : answer,
    ));
  }

  function autoGradeMcq() {
    setAssessmentAnswers((previous) => previous.map((answer) => {
      const question = questions.find((item) => item.id === answer.questionId);
      return question?.type === "mcq" ? autoGradeMcqAnswers([question], [answer])[0] : answer;
    }));
  }

  const canGrade = useMemo(() => sub && sub.status !== "not-submitted", [sub]);
  if (!sub || !act) return <div className="mx-auto max-w-5xl px-4 py-8">Submission not found.</div>;

  const activeAct = act;
  const activeSub = sub;
  const isProject = isProjectAssessment(activeAct);
  const vivaRequired = requiresViva(activeAct);
  const vivaCap = isProject ? vivaCapFor(activeAct, assessmentQuestions) : activeAct.maxMarks;

  function readGrade(): { score: number; viva?: number } | null {
    const raw = marks.trim();
    const manualScore = hasMcq && raw === "" ? autoTotal : Number(raw);
    if (!Number.isFinite(manualScore) || manualScore < 0 || manualScore > activeAct.maxMarks) {
      setErr(`Marks must be between 0 and ${activeAct.maxMarks}.`);
      return null;
    }
    const score = isProject && assessmentQuestions.length > 0 ? autoTotal : manualScore;
    let vivaValue: number | undefined;
    if (vivaRequired) {
      const rawViva = vivaMarks.trim();
      vivaValue = rawViva === "" ? 0 : Number(rawViva);
      if (!Number.isFinite(vivaValue) || vivaValue < 0 || vivaValue > vivaCap) {
        setErr(isProject
          ? `Viva cannot exceed ${vivaCap} (max marks minus question marks).`
          : `Viva marks must be between 0 and ${vivaCap}.`);
        return null;
      }
      if (score + vivaValue > activeAct.maxMarks) {
        setErr(`Marks plus viva cannot exceed ${activeAct.maxMarks}.`);
        return null;
      }
    }
    setErr("");
    return { score, viva: vivaValue };
  }

  function persistGrade(publish: boolean, correction: boolean) {
    const values = readGrade();
    if (!values) return;
    const examiner = currentTeacherName();
    const conductedAt = nowTimestamp();
    autoGradeMcq();
    setMsg(correction
      ? "Grade corrected. Current grade updated; latest updater/timestamp stored (no history)."
      : publish ? "Grade published and submission locked." : "Draft grade saved.");
    setSubmissions((prev) => prev.map((x) => x.id === activeSub.id ? {
      ...x,
      marks: values.score,
      feedback: feedback.trim(),
      status: publish ? "locked" : "graded",
      updatedBy: examiner,
      updatedAt: conductedAt,
      viva: !isProject && values.viva != null
        ? {
            ...x.viva,
            examiner,
            conductedAt,
            marks: values.viva,
            room: x.viva?.room ?? activeAct.physicalRoom,
          }
        : x.viva,
    } : x));

    if (isProject && values.viva != null) {
      setAssessmentAttempts((previous) => {
        const match = (attempt: AssessmentAttempt) =>
          attempt.assessmentId === activeAct.id && attempt.studentId === activeSub.studentId;
        const viva = {
          examiner,
          conductedAt,
          marks: values.viva!,
          comment: previous.find(match)?.viva?.comment,
        };
        return previous.some(match)
          ? previous.map((attempt) => match(attempt) ? { ...attempt, viva } : attempt)
          : [...previous, {
              id: `att-${activeAct.id}-${activeSub.studentId}`,
              assessmentId: activeAct.id,
              studentId: activeSub.studentId,
              submittedAt: conductedAt,
              viva,
            }];
      });
    }
  }

  function saveGrade(publish: boolean) {
    persistGrade(publish, false);
  }
  function saveCorrection() {
    persistGrade(true, true);
  }
  function grantExtension() {
    if (!extDate) { setErr("Extension date is required."); return; }
    if (!extReason.trim()) { setErr("Extension reason is required."); return; }
    if (extDate <= act!.dueAt) { setErr("Extension must be after the original due date."); return; }
    setErr(""); setMsg("Extension granted.");
    setSubmissions((prev) => prev.map((x) => x.id === sub!.id ? { ...x, extensionDueAt: extDate, extensionReason: extReason.trim() } : x));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Grading", to: "/teacher/grading" }, { label: `${student?.name ?? "Student"} - ${act.title}` }]} />
      <div><h1 className="text-2xl font-bold">{act.title}</h1><p className="text-sm text-muted-foreground">{student?.name} · {section ? `${section.section.subjectCode}-${section.section.code}` : ""} · Status: <span className="capitalize">{sub.status}</span></p></div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <AssessmentReference assessment={act} />
        {(questions.length > 0 || isMcqAssessment(act)) && (
          <AssessmentAnswers questions={questions} answers={answers} submittedAt={attempt?.submittedAt} onWrittenMark={setWrittenMark} />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Submission</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Submitted:</span> {sub.submittedAt ?? "Not submitted"}</p>
          <p><span className="font-medium">Original due:</span> {act.dueAt}</p>
          <p><span className="font-medium">Effective due:</span> {sub.extensionDueAt ?? act.dueAt}</p>
          <p><span className="font-medium">File:</span> {sub.fileName ?? "—"}</p>
          {sub.file ? (
            <AttachmentCard file={sub.file} />
          ) : isMcqAssessment(act) ? (
            <p className="text-xs text-slate-500">Answered in-app. See assessment answers above.</p>
          ) : sub.type === "physical" ? (
            <p className="text-xs text-slate-500">Physical submission. No document attached.</p>
          ) : null}
          <p><span className="font-medium">Latest grade update:</span> {sub.updatedBy ? `${sub.updatedBy} at ${sub.updatedAt}` : "—"}</p>
          {sub.extensionReason && <p><span className="font-medium">Extension reason:</span> {sub.extensionReason}</p>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Grade / Feedback</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="space-y-1"><Label htmlFor="detail-marks">Marks (out of {act.maxMarks})</Label><Input id="detail-marks" type="number" value={marks} onChange={e=>{setMarks(e.target.value); setErr("");}} disabled={!canGrade} /></div>
          {hasMcq && <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>MCQ auto-marked: {autoTotal} / {act.maxMarks}</span><Button size="sm" variant="ghost" onClick={() => setMarks(String(autoTotal))}>Apply auto mark</Button></div>}
          {vivaRequired && (
            <div className="space-y-1">
              <Label htmlFor="detail-viva">Viva marks (out of {vivaCap})</Label>
              <Input id="detail-viva" type="number" value={vivaMarks} onChange={e=>{setVivaMarks(e.target.value); setErr("");}} disabled={!canGrade} />
              <p className="text-xs text-muted-foreground">
                {isProject
                  ? `Cap is max marks (${act.maxMarks}) minus question marks (${act.maxMarks - vivaCap}).`
                  : `Marks plus viva cannot exceed ${act.maxMarks}.`}
              </p>
            </div>
          )}
          <div className="space-y-1"><Label htmlFor="detail-feedback">Feedback</Label><Textarea id="detail-feedback" value={feedback} onChange={e=>setFeedback(e.target.value)} disabled={!canGrade} /></div>
          {err && <p className="text-xs text-red-600">{err}</p>}
          {msg && <p className="text-xs text-emerald-600">{msg}</p>}
          <div className="flex flex-wrap gap-2">
            {sub.status !== "locked" ? <>
              <Button size="sm" variant="outline" onClick={() => saveGrade(false)} disabled={!canGrade}>Save draft</Button>
              <Button size="sm" onClick={() => saveGrade(true)} disabled={!canGrade}>Publish & lock</Button>
            </> : <Button size="sm" onClick={saveCorrection}>Save correction</Button>}
          </div>
          <p className="text-xs text-muted-foreground">Publishing locks the submission. Corrections update the current grade and latest updater/timestamp only.</p>
        </CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="text-base">Grant extension</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1"><Label>New deadline</Label><Input type="date" value={extDate} onChange={e=>setExtDate(e.target.value)} /></div>
        <div className="space-y-1 md:col-span-2"><Label>Reason (required)</Label><Textarea value={extReason} onChange={e=>setExtReason(e.target.value)} /></div>
        <div><Button size="sm" variant="outline" onClick={grantExtension}>Grant extension</Button></div>
      </CardContent></Card>

      <div><Link to="/teacher/grading" className="text-sm text-blue-600 hover:underline">Back to grading queue</Link></div>
    </div>
  );
}

export default SubmissionDetailPage;