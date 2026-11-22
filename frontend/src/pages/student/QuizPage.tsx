import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { findOffering, quizzes, type Quiz } from "../../mock/student";

function QuizSummary({ quiz }: { quiz: Quiz }) {
  const offering = findOffering(quiz.offeringId);
  type AttemptRow = Quiz["attempts"][number];
  const columns: Column<AttemptRow>[] = [
    { key: "status", label: "Status" },
    { key: "started", label: "Started" },
    { key: "completed", label: "Completed" },
    { key: "duration", label: "Duration" },
    { key: "grade", label: "Grade" },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[
        { label: "My courses", to: "/student/courses" },
        { label: offering?.code ?? "Course", to: offering ? `/student/courses/${offering.offeringId}` : undefined },
        { label: quiz.title },
      ]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">Opened {quiz.opened} - Closed {quiz.closed}</p>
        </div>
        <Link to={offering ? `/student/courses/${offering.offeringId}` : "/student/courses"}>
          <Button variant="outline" size="sm">Back to the course</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Attempts allowed</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.attemptsAllowed}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Time limit</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.timeLimit}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Grade</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.grade.toFixed(2)}/{quiz.max.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Questions</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{quiz.questions.length}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Attempts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <SimpleTable columns={columns} data={quiz.attempts} searchable={false} searchKeys={["status"]} />
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
    </div>
  );
}

function QuizPage() {
  const { quizId } = useParams();
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) return <div className="mx-auto max-w-5xl px-4 py-8">Quiz not found.</div>;
  return <QuizSummary quiz={quiz} />;
}

export default QuizPage;
