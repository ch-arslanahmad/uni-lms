import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "../../components/ui/button";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { nowTimestamp, teacherSections } from "../../api";
import { students } from "../../models";

type StatusFilter = "All" | "pending" | "answered" | "resolved";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "answered", label: "Answered" },
  { value: "resolved", label: "Resolved" },
];

function formatStudentId(id: number) {
  return `#${id}`;
}

function QuestionsPage() {
  const { questions, setQuestions, assessments } = useOutletContext<TeacherContext>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      All: questions.length,
      pending: questions.filter((q) => q.status === "pending").length,
      answered: questions.filter((q) => q.status === "answered").length,
      resolved: questions.filter((q) => q.status === "resolved").length,
    } as Record<StatusFilter, number>;
  }, [questions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((item) => {
      const stu = students.find((s) => s.id === item.studentId);
      const text = `${item.question} ${stu?.name ?? ""} ${item.studentId}`.toLowerCase();
      const matchesQuery = !q || text.includes(q);
      const matchesStatus = status === "All" || item.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [questions, query, status]);

  function startReply(id: string) {
    setReplyingId(id);
    setDrafts((d) => ({ ...d, [id]: d[id] ?? "" }));
  }

  function cancelReply(id: string) {
    setReplyingId((current) => (current === id ? null : current));
    setDrafts((d) => ({ ...d, [id]: "" }));
  }

  function sendReply(id: string) {
    const answer = (drafts[id] ?? "").trim();
    if (!answer) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, answer, answeredAt: nowTimestamp(), status: "answered" } : q,
      ),
    );
    setDrafts((d) => ({ ...d, [id]: "" }));
    setReplyingId(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Questions</h1>
          <p className="mt-1 text-sm text-slate-500">Answer student questions in context.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter questions by status">
          {FILTERS.map((filter) => {
            const active = status === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(filter.value)}
                className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 ${
                  active
                    ? "border-slate-300 bg-slate-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter.label} ({counts[filter.value]})
              </button>
            );
          })}
        </div>

        <div className="w-full sm:max-w-xs sm:ml-auto">
          <label htmlFor="questions-search" className="sr-only">
            Search questions or students
          </label>
          <input
            id="questions-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or students..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
        </div>
      </div>

      <ul className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
        {filtered.length === 0 ? (
          <li className="py-16 text-center text-sm text-slate-500">No questions in this view.</li>
        ) : (
          filtered.map((q) => {
            const stu = students.find((s) => s.id === q.studentId);
            const section = teacherSections.find((s) => s.id === q.sectionId);
            const act = assessments.find((a) => a.id === q.assessmentId);
            const isReplying = replyingId === q.id;
            const studentLabel = `${formatStudentId(q.studentId)} ${stu?.name ?? "Unknown student"}`;
            const contextLabel = [section ? `${section.section.subjectCode}-${section.section.code}` : null, act?.title ?? null]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={q.id} className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{studentLabel}</p>
                        {q.status === "pending" && (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{q.askedAt}</p>
                    </div>

                    {contextLabel && <p className="mt-1 text-xs text-slate-500">{contextLabel}</p>}
                    <p className="mt-3 text-sm text-slate-800">{q.question}</p>

                    {(q.status === "answered" || q.status === "resolved") && q.answer && (
                      <div className="mt-3 border-l border-slate-200 pl-4">
                        <p className="text-sm text-slate-700">{q.answer}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          {q.answeredAt && <span>{q.answeredAt}</span>}
                          {q.status === "resolved" && <span>Resolved</span>}
                        </div>
                      </div>
                    )}

                    {q.status === "pending" && !isReplying && (
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" variant="ghost" onClick={() => startReply(q.id)}>
                          Reply
                        </Button>
                      </div>
                    )}

                    {q.status === "pending" && isReplying && (
                      <div className="mt-3 space-y-3">
                        <label htmlFor={`reply-${q.id}`} className="sr-only">
                          Reply to {studentLabel}
                        </label>
                        <textarea
                          id={`reply-${q.id}`}
                          value={drafts[q.id] ?? ""}
                          onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                          placeholder="Write a reply..."
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => sendReply(q.id)}>
                            Send
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => cancelReply(q.id)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export default QuestionsPage;
