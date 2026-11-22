import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { findActivity, findOffering, offerings, quizzes, type Quiz } from "../../mock/student";

type AttemptRow = Quiz["attempts"][number];
const attemptColumns: Column<AttemptRow>[] = [
  { key: "status", label: "Status" },
  { key: "started", label: "Started" },
  { key: "completed", label: "Completed" },
  { key: "duration", label: "Duration" },
  { key: "grade", label: "Grade" },
];

function SubmissionBlock({ activityId }: { activityId: string }) {
  const activity = findActivity(activityId);
  const [submitted, setSubmitted] = useState(activity?.submitted ?? false);
  const [fileName, setFileName] = useState("");
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
        {canUpload && !submitted && (
          <div className="space-y-2">
            <Label htmlFor="quiz-file">Upload file</Label>
            <Input id="quiz-file" type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
          </div>
        )}
        <div className="flex gap-2">
          {!submitted ? (
            <Button size="sm" onClick={() => setSubmitted(true)} disabled={canUpload && !fileName}>
              {isPhysical && !canUpload ? "Mark as submitted" : "Submit"}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>Edit submission</Button>
          )}
          {submitted && fileName && <span className="self-center text-muted-foreground">{fileName}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function QuizPage() {
  const { quizId } = useParams();
  const quiz = quizzes.find((q) => q.id === quizId);
  const activity = findActivity(quizId);
  const offeringByActivity = offerings.find((o) => o.weeks.some((w) => w.activities.some((a) => a.id === quizId)));
  const offering = findOffering(quiz?.offeringId ?? offeringByActivity?.offeringId);

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
        <Link to={offering ? `/student/courses/${offering.offeringId}` : "/student/courses"}>
          <Button variant="outline" size="sm">Back to the course</Button>
        </Link>
      </div>

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

      {hasSubmission && activity && <SubmissionBlock activityId={activity.id} />}
    </div>
  );
}

export default QuizPage;
