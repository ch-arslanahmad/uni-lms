import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { SearchInput } from "../../components/SearchInput";
import FilterSelect from "../../components/FilterSelect";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import type { TeacherContext } from "../../components/teacher/TeacherLayout";
import { teacherSections } from "../../mock/teacher";
import { students } from "../../models";

function QuestionsPage() {
  const { questions, setQuestions, activities } = useOutletContext<TeacherContext>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("pending");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const filtered = useMemo(() => questions.filter((q) => {
    const s = students.find(st => st.id === q.studentId);
    const text = `${q.question} ${s?.name ?? ""}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "All" || q.status === status);
  }), [questions, query, status]);

  function reply(id: string) {
    const answer = (drafts[id] ?? "").trim();
    if (!answer) return;
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, answer, answeredAt: "2026-11-22 12:00", status: "answered" } : q));
    setDrafts((d) => ({ ...d, [id]: "" }));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Questions" }]} />
      <div><h1 className="text-2xl font-bold">Questions</h1><p className="text-sm text-muted-foreground">Answer student questions in context. No separate notification inbox (locked scope).</p></div>
      <div className="flex flex-wrap gap-3">
        <FilterSelect filters={["All", "pending", "answered", "resolved"]} value={status} onChange={setStatus} />
        <SearchInput value={query} onChange={setQuery} placeholder="Search questions or students" />
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No questions in this view.</CardContent></Card> : filtered.map((q) => {
          const stu = students.find((s) => s.id === q.studentId);
          const section = teacherSections.find((s) => s.id === q.sectionId);
          const act = activities.find((a) => a.id === q.activityId);
          return (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{stu?.name ?? q.studentId}</CardTitle>
                  <Badge variant={q.status === "pending" ? "secondary" : "outline"} className="capitalize">{q.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{section?.section.subjectCode}-{section?.section.code}{act ? ` · ${act.title}` : ""} · {q.askedAt}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{q.question}</p>
                {q.answer && <div className="rounded-md bg-muted/50 p-3 text-sm"><p className="font-medium">Reply</p><p>{q.answer}</p><p className="mt-1 text-xs text-muted-foreground">{q.answeredAt}</p></div>}
                {q.status === "pending" && <div className="space-y-2"><Textarea value={drafts[q.id] ?? ""} onChange={e => setDrafts(d => ({ ...d, [q.id]: e.target.value }))} placeholder="Write reply..." /><Button size="sm" onClick={() => reply(q.id)}>Send reply</Button></div>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionsPage;