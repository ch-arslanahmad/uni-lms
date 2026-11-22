import { useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Card, CardContent } from "../../components/ui/card";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import type { StudentQuestion } from "../../mock/student";

type Status = "new" | "pending" | "read";

function statusOf(q: StudentQuestion): Status {
  if (q.answer && !q.readAt) return "new";
  if (!q.answer) return "pending";
  return "read";
}

function sortQuestions(questions: StudentQuestion[]) {
  const byAsked = (a: StudentQuestion, b: StudentQuestion) => b.askedAt.localeCompare(a.askedAt);
  const byAnswered = (a: StudentQuestion, b: StudentQuestion) => (b.answeredAt ?? "").localeCompare(a.answeredAt ?? "");
  const byActivity = (a: StudentQuestion, b: StudentQuestion) =>
    (b.answeredAt ?? b.askedAt).localeCompare(a.answeredAt ?? a.askedAt);
  const unread = questions.filter((q) => statusOf(q) === "new").sort(byAnswered);
  const pending = questions.filter((q) => statusOf(q) === "pending").sort(byAsked);
  const read = questions.filter((q) => statusOf(q) === "read").sort(byActivity);
  return [...unread, ...pending, ...read];
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "new") return <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">New</span>;
  if (status === "pending") return <span className="text-xs text-muted-foreground">Pending</span>;
  return <span className="text-xs text-muted-foreground">Read</span>;
}

function MyQuestionsPage() {
  const { questions, unreadCount, markRead } = useOutletContext<StudentQuestionsContext>();
  const [openId, setOpenId] = useState<string | null>(null);
  const marked = useRef<Set<string>>(new Set());
  const sortKey = questions.map((q) => `${q.id}:${q.answer ? 1 : 0}:${q.askedAt}:${q.answeredAt ?? ""}`).join("|");
  const rows = useMemo(() => sortQuestions(questions), [sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function openQuestion(q: StudentQuestion) {
    const next = openId === q.id ? null : q.id;
    setOpenId(next);
    if (next && q.answer && !q.readAt && !marked.current.has(q.id)) {
      marked.current.add(q.id);
      await markRead(q.id);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My questions" }]} />
      <div>
        <h1 className="text-2xl font-bold">My questions</h1>
        <p className="text-sm text-muted-foreground">{unreadCount} unread answer{unreadCount === 1 ? "" : "s"}</p>
      </div>

      {rows.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No questions yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((q) => {
            const status = statusOf(q);
            const open = openId === q.id;
            return (
              <div key={q.id} className="rounded-lg border">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50"
                  onClick={() => void openQuestion(q)}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{q.contextType === "event" ? "Event" : "Course"}: {q.contextLabel}</p>
                  </div>
                  <StatusBadge status={status} />
                </button>
                {open && (
                  <div className="space-y-3 border-t px-4 py-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Your question - {q.askedAt}</p>
                      <p className="mt-1">{q.question}</p>
                      <Link to={q.contextTo} className="mt-1 inline-block text-xs text-blue-600 hover:underline">Open {q.contextType}</Link>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Teacher response</p>
                      {q.answer ? (
                        <>
                          <p className="mt-1">{q.answer}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{q.responderName} - {q.answeredAt}</p>
                        </>
                      ) : (
                        <p className="mt-1 text-muted-foreground">No reply yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyQuestionsPage;
