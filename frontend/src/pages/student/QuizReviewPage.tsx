import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { areQuizScoresPublished, getStudentQuizzes, isWrittenQuestion, QUIZ_SCORES_MESSAGE, type QuizAnswerValue } from "../../api";

function QuizReviewPage() {
  const { quizId } = useParams();
  const { state } = useLocation() as { state?: { answers?: Record<string, QuizAnswerValue>; score?: number } };
  const quiz = getStudentQuizzes().find((q) => q.id === quizId);
  if (!quiz) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;

  const scoresPublished = areQuizScoresPublished(quiz);
  const hasWritten = quiz.questions.some(isWrittenQuestion);
  const answers = state?.answers ?? Object.fromEntries(
    quiz.questions.map((q) => [q.id, isWrittenQuestion(q) ? "" : q.answer]),
  );
  const score = state?.score ?? quiz.grade;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My courses", to: "/student/courses" }, { label: quiz.title, to: `/student/quizzes/${quiz.id}` }, { label: "Review" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title} - Review</h1>
          <p className="text-sm text-muted-foreground">
            {scoresPublished
              ? hasWritten
                ? `Auto-graded score: ${score.toFixed(2)} / ${quiz.max.toFixed(2)} (written answers graded by teacher)`
                : `Score: ${score.toFixed(2)} / ${quiz.max.toFixed(2)}`
              : QUIZ_SCORES_MESSAGE}
          </p>
        </div>
        <Link to={`/student/quizzes/${quiz.id}`}><Button variant="outline" size="sm">Back to summary</Button></Link>
      </div>

      {!scoresPublished ? (
        <Card>
          <CardHeader><CardTitle>Scores not published yet</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your answers were submitted. {QUIZ_SCORES_MESSAGE}
          </CardContent>
        </Card>
      ) : (
        quiz.questions.map((q, index) => {
          const written = isWrittenQuestion(q);
          const selected = answers[q.id];
          const correct = selected === q.answer;
          return (
            <Card key={q.id} className={written ? undefined : correct ? "border-green-300" : "border-red-300"}>
              <CardHeader>
                <CardTitle className="text-base">
                  {index + 1}. {q.text}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {written ? (
                  <>
                    <p>Your answer: <span className="whitespace-pre-wrap">{typeof selected === "string" && selected.trim() ? selected : "No answer"}</span></p>
                    <p className="text-muted-foreground">Awaiting teacher grading · {q.points} marks</p>
                  </>
                ) : (
                  <>
                    <p>Selected: <span className={correct ? "text-green-700" : "text-red-700"}>{selected !== undefined ? q.options[Number(selected)] : "No answer"}</span></p>
                    <p>Correct: <span className="font-medium">{q.options[q.answer]}</span></p>
                    <p>Points: {correct ? q.points : 0} / {q.points}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

export default QuizReviewPage;
