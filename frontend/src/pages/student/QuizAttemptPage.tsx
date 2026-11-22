import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { quizzes } from "../../mock/student";

function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const quiz = quizzes.find((q) => q.id === quizId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remaining, setRemaining] = useState(30 * 60);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const score = useMemo(
    () => quiz?.questions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? q.points : 0), 0) ?? 0,
    [answers, quiz],
  );

  if (!quiz) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;
  const question = quiz.questions[index];
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My courses", to: "/student/courses" }, { label: quiz.title, to: `/student/quizzes/${quiz.id}` }, { label: "Attempt" }]} />
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{quiz.title} · Attempt</h1>
        <span className="rounded-lg bg-blue-500/10 px-3 py-2 font-mono text-lg font-bold tabular-nums text-blue-600">
          {minutes}:{seconds}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question {index + 1} of {quiz.questions.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium">{question.text}</p>
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <button
                key={option}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  answers[question.id] === i
                    ? "border-blue-500 bg-blue-500/10"
                    : "hover:bg-muted"
                }`}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            ))}
          </div>
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
          {index < quiz.questions.length - 1 ? (
            <Button size="sm" onClick={() => setIndex((i) => i + 1)}>Next</Button>
          ) : (
            <Button size="sm" onClick={() => setConfirm(true)}>Submit quiz</Button>
          )}
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit this attempt?</DialogTitle>
            <DialogDescription>
              You answered {Object.keys(answers).length} of {quiz.questions.length} questions. Your provisional score is {score}/{quiz.max}.
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
