import { useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import { studentQuestionStatusLabel, type StudentQuestion } from "../../mock/student";

type Status = ReturnType<typeof studentQuestionStatusLabel>;

function statusOf(q: StudentQuestion): Status {
  return studentQuestionStatusLabel(q);
}

function isUnread(q: StudentQuestion) {
  return Boolean(q.answer && !q.readAt);
}

function sortQuestions(questions: StudentQuestion[]) {
  const byAsked = (a: StudentQuestion, b: StudentQuestion) => b.askedAt.localeCompare(a.askedAt);
  const byAnswered = (a: StudentQuestion, b: StudentQuestion) => (b.answeredAt ?? "").localeCompare(a.answeredAt ?? "");
  const byActivity = (a: StudentQuestion, b: StudentQuestion) =>
    (b.answeredAt ?? b.askedAt).localeCompare(a.answeredAt ?? a.askedAt);
  const unread = questions.filter(isUnread).sort(byAnswered);
  const open = questions.filter((q) => !isUnread(q) && statusOf(q) === "Pending").sort(byAsked);
  const settled = questions.filter((q) => !isUnread(q) && statusOf(q) !== "Pending").sort(byActivity);
  return [...unread, ...open, ...settled];
}

function StatusBadge({ status, unread }: { status: Status; unread: boolean }) {
  if (unread)
    return <Badge className="rounded-full bg-blue-500 text-white hover:bg-blue-500">New reply</Badge>;
  if (status === "Pending")
    return <Badge variant="ghost" className="text-muted-foreground">Pending</Badge>;
  return <Badge variant="ghost" className="text-muted-foreground">{status}</Badge>;
}

function MyQuestionsPage() {
  const { questions, unreadCount, markRead } = useOutletContext<StudentQuestionsContext>();
  const [openId, setOpenId] = useState<string | null>(null);
  const marked = useRef<Set<string>>(new Set());
  const sortKey = questions.map((q) => `${q.id}:${q.answer ? 1 : 0}:${q.readAt ?? ""}:${q.askedAt}:${q.answeredAt ?? ""}`).join("|");
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
            const unread = isUnread(q);
            return (
              <div key={q.id} className={`rounded-lg border ${unread ? "border-blue-300 bg-blue-50/70" : ""}`}>
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50"
                  onClick={() => void openQuestion(q)}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">
                      {unread && <span className="mr-2 inline-block size-2 rounded-full bg-blue-500 align-middle" aria-hidden="true" />}
                      {q.question}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {q.contextType === "event" ? "Event" : "Course"}: {q.contextLabel} · {q.visibility === "public" ? "Public" : "Private"}
                    </p>
                  </div>
                  <StatusBadge status={status} unread={unread} />
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
                          {q.resolvedAt && <p className="mt-1 text-xs text-muted-foreground">Resolved - {q.resolvedAt}</p>}
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
