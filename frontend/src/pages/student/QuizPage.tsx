import { useState } from "react";
import { Clock, MessageCircleQuestion } from "lucide-react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SubmissionFileUpload } from "../../components/student/SubmissionFileUpload";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { QuestionThreadCard } from "../../components/student/QuestionThreadCard";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import {
  activityLabel,
  availabilityStatus,
  findActivity,
  findOffering,
  findOfferingForActivity,
  requiresPhysicalActivity,
  requiresStudentUpload,
  studentQuestionStatusLabel,
  type QuestionVisibility,
} from "../../mock/student";
import {
  areQuizScoresPublished,
  fileToSubmissionFile,
  getQuizAttempt,
  getStudentQuizzes,
  QUIZ_SCORES_MESSAGE,
  type StoredQuizAttempt,
  type SubmissionFile,
} from "../../api";

type AttemptRow = StoredQuizAttempt & { status: string };
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
  const [visibility, setVisibility] = useState<QuestionVisibility>("public");
  if (!activity) return null;
  const canUpload = requiresStudentUpload(activity);
  const isPhysical = requiresPhysicalActivity(activity);
  const eventQuestions = questions.filter((q) => q.contextTo === `/student/quizzes/${activity.id}`);
  return (
    <Card>
      <CardHeader><CardTitle>Submission</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        {canUpload && <p>Attachment upload required.</p>}
        {activity.physical && (
          <p>
            {isPhysical ? "Physical submission" : "Viva venue"}: {activity.physical.timeWindow}, {activity.physical.room}.{" "}
            {isPhysical ? "Any working day before and on due date." : "Attend your viva at this venue."}
          </p>
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
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="quiz-visibility" className="text-xs text-muted-foreground">Visibility</Label>
                <Select value={visibility} onValueChange={(value) => setVisibility(value as QuestionVisibility)}>
                  <SelectTrigger id="quiz-visibility" className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public to section</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.</p>
            </div>
            <Button size="sm" onClick={() => {
              const note = noteDraft.trim();
              setSubmitted(true);
              setSavedNote(note);
              if (note) saveQuestion({ contextType: "event", contextLabel: activity.title, contextTo: `/student/quizzes/${activity.id}`, question: note, visibility });
            }} disabled={canUpload && !fileName}>
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
            {eventQuestions.map((q) => (
              <div key={q.id} className="rounded border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{q.question}</p>
                  <span className={`shrink-0 text-xs ${studentQuestionStatusLabel(q) === "Answered (new)" ? "font-medium text-blue-600" : "text-muted-foreground"}`}>
                    {studentQuestionStatusLabel(q)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{q.visibility === "public" ? "Public" : "Private"}</p>
                {q.answer ? (
                  <div className="mt-2 text-muted-foreground">
                    <p><span className="font-medium text-foreground">{q.responderName}:</span> {q.answer}</p>
                    <p className="mt-1 text-xs">{q.answeredAt}</p>
                    {q.resolvedAt && <p className="mt-1 text-xs">Resolved {q.resolvedAt}</p>}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">No reply yet.</p>
                )}
              </div>
            ))}
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
  const attempt = quiz ? getQuizAttempt(quiz) : undefined;
  const [askOpen, setAskOpen] = useState(params.get("ask") === "1");
  const [eventNote, setEventNote] = useState("");

  if (!quiz && !activity) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;

  const title = quiz?.title ?? activity?.title ?? "Quiz";
  const typeLabel = quiz ? "Quiz" : activity ? activityLabel(activity) : "Quiz";
  const hasSubmission = activity ? requiresStudentUpload(activity) || requiresPhysicalActivity(activity) : false;
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
  const attemptRows: AttemptRow[] = attempt ? [{ ...attempt, status: "Completed" }] : [];

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
          <Button variant="outline" size="sm" onClick={() => { setAskOpen((v) => !v); setTimeout(() => document.getElementById(hasSubmission ? "quiz-note" : "question-thread-note")?.focus(), 0); }}>
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

      {availability !== "upcoming" && !hasSubmission && (
        <QuestionThreadCard
          open={askOpen}
          title="Questions & responses"
          note={eventNote}
          onNoteChange={setEventNote}
          onCancel={() => setAskOpen(false)}
          onSend={(text, visibility) => {
            saveQuestion({ contextType: "event", contextLabel: title, contextTo: `/student/quizzes/${quizId}`, question: text, visibility });
            setEventNote("");
            setAskOpen(false);
          }}
          questions={eventQuestions}
        />
      )}

      {quiz && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Card><CardHeader><CardTitle className="text-sm">Attempt</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{attempt ? "Completed" : "Not started"}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Time limit</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.timeLimit}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Grade</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{scoresPublished ? `${(attempt?.score ?? quiz.grade).toFixed(2)}/${quiz.max.toFixed(2)}` : `— / ${quiz.max.toFixed(2)}`}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Questions</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.questions.length}</CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Attempt</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <SimpleTable
                columns={attemptColumns}
                data={scoresPublished ? attemptRows : attemptRows.map((row) => ({ ...row, grade: "Hidden" }))}
                searchable={false}
                searchKeys={["status"]}
              />
              <div className="flex flex-wrap items-center gap-2">
                {!attempt && (
                  availability === "open" ? (
                    <Link to={`/student/quizzes/${quiz.id}/attempt`}>
                      <Button>Start attempt</Button>
                    </Link>
                  ) : (
                    <Button disabled>Start attempt</Button>
                  )
                )}
                {attempt && !scoresPublished && <span className="text-sm text-muted-foreground">{QUIZ_SCORES_MESSAGE}</span>}
                {attempt && scoresPublished && (
                  <Link to={`/student/quizzes/${quiz.id}/review`}><Button variant="outline">View results</Button></Link>
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
