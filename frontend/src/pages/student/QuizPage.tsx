import { useState } from "react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import { findActivity, findOffering, offerings, quizzes, type Quiz } from "../../mock/student";

type AttemptRow = Quiz["attempts"][number];
const attemptColumns: Column<AttemptRow>[] = [
  { key: "status", label: "Status" },
  { key: "started", label: "Started" },
  { key: "completed", label: "Completed" },
  { key: "duration", label: "Duration" },
  { key: "grade", label: "Grade" },
];

function SubmissionBlock({ activityId, prefillExtension }: { activityId: string; prefillExtension?: boolean }) {
  const [params] = useSearchParams();
  const { saveQuestion } = useOutletContext<StudentQuestionsContext>();
  const activity = findActivity(activityId);
  const [submitted, setSubmitted] = useState(activity?.submitted ?? false);
  const [fileName, setFileName] = useState("");
  const [noteDraft, setNoteDraft] = useState(() =>
    params.get("extension") || prefillExtension ? "Extension request: Reason - \nNeeded until - \nWork completed so far - " : "",
  );
  const [savedNote, setSavedNote] = useState("");
  if (!activity) return null;
  const canUpload = activity.submissionModes.includes("upload");
  const isPhysical = activity.submissionModes.includes("physical");
  return (
    <Card>
      <CardHeader><CardTitle>Submission</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        {canUpload && <p>Attachment upload required.</p>}
        {isPhysical && activity.physical && (
          <p>Physical submission: {activity.physical.timeWindow}, {activity.physical.room}. Any working day before and on due date.</p>
        )}
        {!submitted ? (
          <div className="space-y-3">
            {canUpload && (
              <div className="space-y-1">
                <Label htmlFor="quiz-file">Upload file</Label>
                <Input id="quiz-file" type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="quiz-note">Question for teacher (optional)</Label>
              <Textarea id="quiz-note" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Ask one clear question, if needed" />
              <p className="text-xs text-muted-foreground">Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.</p>
            </div>
            <Button size="sm" onClick={() => { const note = noteDraft.trim(); setSubmitted(true); setSavedNote(note); if (note) saveQuestion({ contextType: "event", contextLabel: activity.title, contextTo: `/student/quizzes/${activity.id}`, question: note }); }} disabled={canUpload && !fileName}>
              {isPhysical && !canUpload ? "Mark as submitted" : "Submit"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {fileName && <p className="text-muted-foreground">File: {fileName}</p>}
            <p><span className="font-medium">Question for teacher:</span> {savedNote || "No question submitted."}</p>
            <Button size="sm" variant="outline" onClick={() => { setNoteDraft(savedNote); setSubmitted(false); }}>Edit submission</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuizPage() {
  const { quizId } = useParams();
  const [params] = useSearchParams();
  const { saveQuestion } = useOutletContext<StudentQuestionsContext>();
  const quiz = quizzes.find((q) => q.id === quizId);
  const activity = findActivity(quizId);
  const offeringByActivity = offerings.find((o) => o.weeks.some((w) => w.activities.some((a) => a.id === quizId)));
  const offering = findOffering(quiz?.offeringId ?? offeringByActivity?.offeringId);
  const [askOpen, setAskOpen] = useState(params.get("ask") === "1");
  const [extensionOpen, setExtensionOpen] = useState(params.get("extension") === "1");
  const [eventNote, setEventNote] = useState(() =>
    params.get("extension") ? "Extension request: Reason - \nNeeded until - \nWork completed so far - " : "",
  );
  const [eventNoteSaved, setEventNoteSaved] = useState("");

  if (!quiz && !activity) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;

  const title = quiz?.title ?? activity?.title ?? "Quiz";
  const hasMcq = quiz != null || activity?.hasMcq;
  const hasSubmission = (activity?.submissionModes.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[
        { label: "My courses", to: "/student/courses" },
        { label: offering?.code ?? "Course", to: offering ? `/student/courses/${offering.offeringId}` : undefined },
        { label: title },
      ]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {quiz ? `Opened ${quiz.opened} - Closed ${quiz.closed}` : `Opened ${activity?.opened} - Due ${activity?.due}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setAskOpen(true); setExtensionOpen(false); setTimeout(() => document.getElementById(hasSubmission ? "quiz-note" : "event-note")?.focus(), 0); }}>Ask</Button>
          <Button variant="outline" size="sm" onClick={() => { setExtensionOpen(true); setAskOpen(true); setEventNote((d) => d || "Extension request: Reason - \nNeeded until - \nWork completed so far - "); setTimeout(() => document.getElementById(hasSubmission ? "quiz-note" : "event-note")?.focus(), 0); }}>Request extension</Button>
          <Link to={offering ? `/student/courses/${offering.offeringId}` : "/student/courses"}>
            <Button variant="outline" size="sm">Back to the course</Button>
          </Link>
        </div>
      </div>

      {!hasSubmission && (askOpen || extensionOpen) && (
        <Card>
          <CardHeader><CardTitle>{extensionOpen ? "Extension request" : "Ask instructor"}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="event-note">{extensionOpen ? "Request details" : "Your question"}</Label>
            <Textarea id="event-note" value={eventNote} onChange={(e) => setEventNote(e.target.value)} placeholder={extensionOpen ? "Reason, needed until, work completed so far" : "Ask one clear question, if needed"} />
            <p className="text-xs text-muted-foreground">Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { const text = eventNote.trim(); if (!text) return; saveQuestion({ contextType: "event", contextLabel: title, contextTo: `/student/quizzes/${quizId}`, question: text }); setEventNoteSaved(text); setEventNote(""); }}>Send question</Button>
              {eventNoteSaved && <span className="self-center text-xs text-muted-foreground">Question sent. Check My questions for replies.</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {hasMcq && quiz && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Card><CardHeader><CardTitle className="text-sm">Attempts allowed</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.attemptsAllowed}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Time limit</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.timeLimit}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Grade</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.grade.toFixed(2)}/{quiz.max.toFixed(2)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Questions</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.questions.length}</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Attempts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <SimpleTable columns={attemptColumns} data={quiz.attempts} searchable={false} searchKeys={["status"]} />
              <div className="flex flex-wrap gap-2">
                {quiz.attempts.length === 0 ? (
                  <Link to={`/student/quizzes/${quiz.id}/attempt`}><Button>Start attempt</Button></Link>
                ) : (
                  <>
                    {quiz.attempts.length < quiz.attemptsAllowed && (
                      <Link to={`/student/quizzes/${quiz.id}/attempt`}><Button>New attempt</Button></Link>
                    )}
                    <Link to={`/student/quizzes/${quiz.id}/review`}><Button variant="outline">Review</Button></Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {hasSubmission && activity && <SubmissionBlock activityId={activity.id} prefillExtension={extensionOpen} />}
    </div>
  );
}

export default QuizPage;
