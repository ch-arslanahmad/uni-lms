import { useState } from "react";
import { Clock, MessageCircleQuestion } from "lucide-react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SubmissionFileUpload } from "../../components/student/SubmissionFileUpload";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import { activityLabel, availabilityStatus, findActivity, findOffering, findOfferingForActivity, type Quiz } from "../../mock/student";
import { areQuizScoresPublished, fileToSubmissionFile, getStudentQuizzes, QUIZ_SCORES_MESSAGE, type SubmissionFile } from "../../api";

type AttemptRow = Quiz["attempts"][number];
const attemptColumns: Column<AttemptRow>[] = [
  { key: "status", label: "Status" },
  { key: "started", label: "Started" },
  { key: "completed", label: "Completed" },
  { key: "duration", label: "Duration" },
  { key: "grade", label: "Grade" },
];

function SubmissionBlock({ activityId, locked = false, closed = false }: { activityId: string; locked?: boolean; closed?: boolean }) {
  const { questions, saveQuestion } = useOutletContext<StudentQuestionsContext>();
  const activity = findActivity(activityId);
  const [submitted, setSubmitted] = useState(activity?.submitted ?? false);
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<SubmissionFile | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savedNote, setSavedNote] = useState("");
  if (!activity) return null;
  const canUpload = activity.submissionModes.includes("upload");
  const isPhysical = activity.submissionModes.includes("physical");
  const eventQuestions = questions.filter((q) => q.contextTo === `/student/quizzes/${activity.id}`);
  return (
    <Card>
      <CardHeader><CardTitle>Submission</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        {canUpload && <p>Attachment upload required.</p>}
        {isPhysical && activity.physical && (
          <p>Physical submission: {activity.physical.timeWindow}, {activity.physical.room}. Any working day before and on due date.</p>
        )}
        {(locked || closed) && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {locked
              ? `Submissions open on ${activity.opened}.`
              : "The submission window has closed. Existing submissions are read-only."}
          </p>
        )}
        {!submitted && !locked && !closed ? (
          <div className="space-y-3">
            {canUpload && (
              <SubmissionFileUpload
                id="quiz-file"
                fileName={fileName}
                onFileChange={setFileName}
                onFileSelected={(file) => { if (!file) { setUploadedFile(null); return; } void fileToSubmissionFile(file).then(setUploadedFile); }}
              />
            )}
            {uploadedFile && <p className="text-xs text-muted-foreground">Selected: {uploadedFile.name} · {uploadedFile.mimeType} · {uploadedFile.size} bytes</p>}
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
            {!closed && <Button size="sm" variant="outline" onClick={() => { setNoteDraft(savedNote); setSubmitted(false); }}>Edit submission</Button>}
          </div>
        )}
        {eventQuestions.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">Your questions for this event</p>
            {eventQuestions.map((q) => {
              const status = q.answer && !q.readAt ? "Answered (new)" : q.answer ? "Read" : "Pending";
              return (
                <div key={q.id} className="rounded border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{q.question}</p>
                    <span className={`shrink-0 text-xs ${status === "Answered (new)" ? "font-medium text-blue-600" : "text-muted-foreground"}`}>{status}</span>
                  </div>
                  {q.answer ? (
                    <div className="mt-2 text-muted-foreground">
                      <p><span className="font-medium text-foreground">{q.responderName}:</span> {q.answer}</p>
                      <p className="mt-1 text-xs">{q.answeredAt}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">No reply yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuizPage() {
  const { quizId } = useParams();
  const [params] = useSearchParams();
  const { questions, saveQuestion } = useOutletContext<StudentQuestionsContext>();
  const quiz = getStudentQuizzes().find((q) => q.id === quizId);
  const activity = findActivity(quizId);
  const offering = findOffering(quiz?.offeringId ?? findOfferingForActivity(quizId)?.offeringId);
  const [askOpen, setAskOpen] = useState(params.get("ask") === "1");
  const [eventNote, setEventNote] = useState("");

  if (!quiz && !activity) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;

  const title = quiz?.title ?? activity?.title ?? "Quiz";
  const typeLabel = quiz ? "Quiz" : activity ? activityLabel(activity) : "Quiz";
  const hasMcq = quiz != null || activity?.hasMcq;
  const hasSubmission = (activity?.submissionModes.length ?? 0) > 0;
  const scoresPublished = quiz ? areQuizScoresPublished(quiz) : false;
  const availability = quiz
    ? availabilityStatus(quiz.opened, quiz.closed)
    : activity
      ? availabilityStatus(activity.opened, activity.closed ?? activity.due)
      : "open";
  const dueDate = quiz?.closed?.slice(0, 10) ?? activity?.due ?? "";
  const dueTone = activity?.submitted || activity?.graded
    ? "text-emerald-600"
    : dueDate < "2026-11-22"
      ? "text-red-600"
      : dueDate <= "2026-11-24"
        ? "text-amber-600"
        : "text-emerald-600";
  const dueLabel = activity?.submitted || activity?.graded
    ? `Due ${dueDate}`
    : dueDate < "2026-11-22"
      ? `Past due - ${dueDate}`
      : dueDate <= "2026-11-24"
        ? `Due soon - ${dueDate}`
        : `Due ${dueDate}`;
  const eventQuestions = questions.filter((q) => q.contextTo === `/student/quizzes/${quizId}`);

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
          <p className="text-xs text-muted-foreground">{typeLabel}</p>
          <p className="text-sm text-muted-foreground">
            {quiz ? `Opened ${quiz.opened}` : `Opened ${activity?.opened}`}
          </p>
          {dueDate && (
            <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${dueTone}`}>
              <Clock className="size-4" /> {dueLabel}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setAskOpen((v) => !v); setTimeout(() => document.getElementById(hasSubmission ? "quiz-note" : "event-note")?.focus(), 0); }}>
            <MessageCircleQuestion className="size-4" /> Ask teacher
          </Button>
          <Link to={offering ? `/student/courses/${offering.offeringId}` : "/student/courses"}>
            <Button variant="outline" size="sm">Back to the course</Button>
          </Link>
        </div>
      </div>

      {availability !== "open" && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          availability === "upcoming"
            ? "border-amber-200 bg-amber-500/10 text-amber-700"
            : "border-red-200 bg-red-500/10 text-red-700"
        }`}>
          {availability === "upcoming"
            ? `This assessment is not open yet. It opens on ${quiz?.opened ?? activity?.opened}.`
            : "The attempt window for this assessment has closed."}
        </div>
      )}

      {availability === "upcoming" && hasSubmission && activity && (
        <Card>
          <CardHeader><CardTitle>Attachment</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The question paper is locked until {quiz?.opened ?? activity.opened}.
          </CardContent>
        </Card>
      )}

      {availability !== "upcoming" && !hasSubmission && (askOpen || eventQuestions.length > 0) && (
        <Card>
          <CardHeader><CardTitle>Questions & responses</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {askOpen && (
              <div className="space-y-2">
                <Label htmlFor="event-note">Your question</Label>
                <Textarea id="event-note" value={eventNote} onChange={(e) => setEventNote(e.target.value)} placeholder="Ask one clear question, if needed" />
                <p className="text-xs text-muted-foreground">Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { const text = eventNote.trim(); if (!text) return; saveQuestion({ contextType: "event", contextLabel: title, contextTo: `/student/quizzes/${quizId}`, question: text }); setEventNote(""); setAskOpen(false); }}>Send</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAskOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {eventQuestions.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">Your questions for this event</p>
                {eventQuestions.map((q) => {
                  const status = q.answer && !q.readAt ? "Answered (new)" : q.answer ? "Read" : "Pending";
                  return (
                    <div key={q.id} className="rounded border px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{q.question}</p>
                        <span className={`shrink-0 text-xs ${status === "Answered (new)" ? "font-medium text-blue-600" : "text-muted-foreground"}`}>{status}</span>
                      </div>
                      {q.answer ? (
                        <div className="mt-2 text-muted-foreground">
                          <p><span className="font-medium text-foreground">{q.responderName}:</span> {q.answer}</p>
                          <p className="mt-1 text-xs">{q.answeredAt}</p>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">No reply yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasMcq && quiz && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Card><CardHeader><CardTitle className="text-sm">Attempts allowed</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.attemptsAllowed}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Time limit</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.timeLimit}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Grade</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{scoresPublished ? `${quiz.grade.toFixed(2)}/${quiz.max.toFixed(2)}` : `— / ${quiz.max.toFixed(2)}`}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Questions</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.questions.length}</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Attempts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <SimpleTable
                columns={attemptColumns}
                data={scoresPublished ? quiz.attempts : quiz.attempts.map((a) => ({ ...a, grade: "Hidden" }))}
                searchable={false}
                searchKeys={["status"]}
              />
              <div className="flex flex-wrap items-center gap-2">
                {quiz.attempts.length < quiz.attemptsAllowed && (
                  availability === "open" ? (
                    <Link to={`/student/quizzes/${quiz.id}/attempt`}>
                      <Button>{quiz.attempts.length === 0 ? "Start attempt" : "New attempt"}</Button>
                    </Link>
                  ) : (
                    <Button disabled>{quiz.attempts.length === 0 ? "Start attempt" : "New attempt"}</Button>
                  )
                )}
                {scoresPublished ? (
                  <Link to={`/student/quizzes/${quiz.id}/review`}><Button variant="outline">View results</Button></Link>
                ) : (
                  <span className="text-sm text-muted-foreground">{QUIZ_SCORES_MESSAGE}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {availability !== "upcoming" && hasSubmission && activity && (
        <SubmissionBlock activityId={activity.id} closed={availability === "closed"} />
      )}
    </div>
  );
}

export default QuizPage;
