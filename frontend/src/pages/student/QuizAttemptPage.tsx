import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "../../components/ui/questionnaire";
import {
  getQuizAttempt,
  getStudentQuizzes,
  isWrittenQuestion,
  QUIZ_SCORES_MESSAGE,
  saveQuizAttempt,
  type QuizAnswerValue,
} from "../../api";
import { availabilityStatus } from "../../mock/student";

function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const quiz = getStudentQuizzes().find((q) => q.id === quizId);
  const existingAttempt = quiz ? getQuizAttempt(quiz) : undefined;
  const availability = quiz ? availabilityStatus(quiz.opened, quiz.closed) : "open";
  const blocked = !quiz || availability !== "open" || existingAttempt != null;
  const totalSeconds = (parseInt(quiz?.timeLimit ?? "30", 10) || 30) * 60;
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [activeItem, setActiveItem] = useState(quiz?.questions[0]?.id ?? "");
  const [remaining, setRemaining] = useState(totalSeconds);
  const [confirm, setConfirm] = useState(false);
  const expired = remaining === 0;
  const submittedQuizRef = useRef<string | null>(null);

  const items = useMemo(
    () => quiz?.questions.map((question) => ({
      name: question.id,
      required: true,
      choices: isWrittenQuestion(question)
        ? []
        : question.options.map((_, index) => ({ value: String(index) })),
    })) ?? [],
    [quiz],
  );

  // Written answers are excluded from the auto-graded score passed to review.
  const score = useMemo(
    () => quiz?.questions.reduce((sum, q) =>
      sum + (!isWrittenQuestion(q) && answers[q.id] === q.answer ? q.points : 0), 0) ?? 0,
    [answers, quiz],
  );

  const submitAttempt = useCallback(() => {
    if (!quiz || existingAttempt || submittedQuizRef.current === quiz.id) return;
    submittedQuizRef.current = quiz.id;
    saveQuizAttempt(quiz, answers, totalSeconds - remaining);
    navigate(`/student/quizzes/${quiz.id}/review`, { replace: true });
  }, [answers, existingAttempt, navigate, quiz, remaining, totalSeconds]);

  useEffect(() => {
    if (blocked || expired) return;
    const timer = window.setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [blocked, expired]);

  useEffect(() => {
    if (!blocked && expired) submitAttempt();
  }, [blocked, expired, submitAttempt]);

  if (!quiz) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;

  if (blocked) {
    const reason = existingAttempt
      ? "You have already submitted the single attempt allowed for this assessment."
      : availability === "upcoming"
        ? `This assessment opens on ${quiz.opened}. You cannot start an attempt yet.`
        : `The attempt window closed on ${quiz.closed}. You cannot start a new attempt.`;
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <Breadcrumbs items={[{ label: "My courses", to: "/student/courses" }, { label: quiz.title, to: `/student/quizzes/${quiz.id}` }, { label: "Attempt" }]} />
        <Card>
          <CardHeader><CardTitle>Attempt not available</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{reason}</p>
            <Link to={`/student/quizzes/${quiz.id}`}><Button variant="outline" size="sm">Back to assessment</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answeredCount = quiz.questions.filter((q) => {
    const value = answers[q.id];
    return typeof value === "number" || (typeof value === "string" && value.trim().length > 0);
  }).length;
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const timerTone = remaining === 0 ? "bg-red-500/10 text-red-600" : remaining <= 60 ? "bg-red-500/10 text-red-600" : remaining <= 300 ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600";
  const activeIndex = Math.max(0, quiz.questions.findIndex((q) => q.id === activeItem));

  function setAnswer(questionId: string, value: QuizAnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Read the native controls so keyboard-selected answers are captured too.
    const formData = new FormData(event.currentTarget);
    const submitted: Record<string, QuizAnswerValue> = {};
    quiz.questions.forEach((question) => {
      const raw = formData.get(question.id);
      if (typeof raw !== "string" || raw.length === 0) return;
      submitted[question.id] = isWrittenQuestion(question) ? raw : Number(raw);
    });
    setAnswers(submitted);
    setConfirm(true);
  };

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
          Time expired. Answers are locked. Submit your attempt. {QUIZ_SCORES_MESSAGE}
        </div>
      )}

      <Questionnaire
        items={items}
        item={activeItem}
        onItemChange={setActiveItem}
        onSubmit={handleSubmit}
        shortcuts="letters"
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Assessment questions</CardTitle>
            <QuestionnaireProgress />
          </CardHeader>
          <CardContent>
            {quiz.questions.map((question, index) => (
              <QuestionnaireItem key={question.id} name={question.id} required>
                <QuestionnaireTitle>{question.text}</QuestionnaireTitle>
                <QuestionnaireDescription>
                  {isWrittenQuestion(question)
                    ? "Written answers are graded by your teacher."
                    : `Choose one answer. ${question.points} ${question.points === 1 ? "mark" : "marks"}.`}
                </QuestionnaireDescription>
                <QuestionnaireChoices>
                  {isWrittenQuestion(question) ? (
                    <QuestionnaireInput
                      render={<Textarea rows={6} className="min-h-24 rounded-2xl" />}
                      aria-label={`Answer for question ${index + 1}`}
                      placeholder="Write your answer here..."
                      disabled={expired}
                      onChange={(event) => setAnswer(question.id, event.target.value)}
                    />
                  ) : question.options.map((option, i) => (
                    <QuestionnaireChoice
                      key={option}
                      value={String(i)}
                      disabled={expired}
                      onChange={() => setAnswer(question.id, i)}
                    >
                      {String.fromCharCode(65 + i)}. {option}
                    </QuestionnaireChoice>
                  ))}
                </QuestionnaireChoices>
                <QuestionnaireError>Please answer this question before continuing.</QuestionnaireError>
              </QuestionnaireItem>
            ))}
          </CardContent>
        </Card>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Submit quiz</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {quiz.questions.map((q, i) => (
            <Button
              key={q.id}
              size="icon-sm"
              variant={i === activeIndex ? "default" : answers[q.id] !== undefined ? "secondary" : "outline"}
              onClick={() => setActiveItem(q.id)}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Answered {answeredCount} of {quiz.questions.length}</p>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit this attempt?</DialogTitle>
            <DialogDescription>
              You answered {answeredCount} of {quiz.questions.length} questions. Auto-graded MCQ score: {score.toFixed(2)}. {QUIZ_SCORES_MESSAGE}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep working</Button>
            <Button onClick={submitAttempt}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuizAttemptPage;
