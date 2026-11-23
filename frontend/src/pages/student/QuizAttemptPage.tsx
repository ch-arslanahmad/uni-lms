import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { getStudentQuizzes, isWrittenQuestion, type QuizAnswerValue } from "../../api";
import { canReviewQuiz } from "../../mock/student";

function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const quiz = getStudentQuizzes().find((q) => q.id === quizId);
  const totalSeconds = (parseInt(quiz?.timeLimit ?? "30", 10) || 30) * 60;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [remaining, setRemaining] = useState(totalSeconds);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Written answers are graded by the teacher, so they are excluded from the
  // provisional score shown at submission time.
  const score = useMemo(
    () => quiz?.questions.reduce((sum, q) =>
      sum + (!isWrittenQuestion(q) && answers[q.id] === q.answer ? q.points : 0), 0) ?? 0,
    [answers, quiz],
  );

  if (!quiz) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;
  const expired = remaining === 0;
  const question = quiz.questions[index];
  const answeredCount = Object.values(answers).filter((value) =>
    typeof value === "number" || (typeof value === "string" && value.trim().length > 0),
  ).length;
  const hasWritten = quiz.questions.some(isWrittenQuestion);
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const timerTone = remaining === 0 ? "bg-red-500/10 text-red-600" : remaining <= 60 ? "bg-red-500/10 text-red-600" : remaining <= 300 ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My courses", to: "/student/courses" }, { label: quiz.title, to: `/student/quizzes/${quiz.id}` }, { label: "Attempt" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title} - Attempt</h1>
          <p className="text-sm text-muted-foreground">Time limit: {quiz.timeLimit}</p>
        </div>
        <span className={`rounded-lg px-3 py-2 font-mono text-lg font-bold tabular-nums ${timerTone}`}>
          {minutes}:{seconds}
        </span>
      </div>
      {expired && (
        <div className="rounded-lg border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          Time expired. Answers are locked. Submit your attempt to view results.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Question {index + 1} of {quiz.questions.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium">{question.text}</p>
          {isWrittenQuestion(question) ? (
            <div className="space-y-2">
              <Textarea
                aria-label={`Answer for question ${index + 1}`}
                value={typeof answers[question.id] === "string" ? String(answers[question.id]) : ""}
                onChange={(event) => setAnswers((a) => ({ ...a, [question.id]: event.target.value }))}
                disabled={expired}
                rows={6}
                placeholder="Write your answer here..."
              />
              <p className="text-xs text-muted-foreground">Written answers are graded by your teacher.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {question.options.map((option, i) => (
                <button
                  key={option}
                  type="button"
                  disabled={expired}
                  onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    answers[question.id] === i
                      ? "border-blue-500 bg-blue-500/10"
                      : "hover:bg-muted"
                  } ${expired ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {String.fromCharCode(65 + i)}. {option}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {quiz.questions.map((q, i) => (
            <Button key={q.id} size="icon-sm" variant={i === index ? "default" : answers[q.id] !== undefined ? "secondary" : "outline"} onClick={() => setIndex(i)}>
              {i + 1}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>Previous</Button>
          {index < quiz.questions.length - 1 && (
            <Button size="sm" variant={expired ? "outline" : "default"} onClick={() => setIndex((i) => i + 1)}>Next</Button>
          )}
          {(index === quiz.questions.length - 1 || expired) && (
            <Button size="sm" onClick={() => setConfirm(true)}>Submit quiz</Button>
          )}
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit this attempt?</DialogTitle>
            <DialogDescription>
              You answered {answeredCount} of {quiz.questions.length} questions.
              {canReviewQuiz(quiz)
                ? hasWritten
                  ? ` Your auto-graded score is ${score}/${quiz.max}; written answers await teacher grading.`
                  : ` Your provisional score is ${score}/${quiz.max}.`
                : " Your score will be available according to the review policy."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep working</Button>
            <Button onClick={() => navigate(`/student/quizzes/${quiz.id}/review`, { state: { answers, score } })}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuizAttemptPage;
