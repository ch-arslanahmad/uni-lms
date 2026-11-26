import { useState } from "react";
import { Clock, MapPin, MessageCircleQuestion } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { QuestionThreadCard } from "../../components/student/QuestionThreadCard";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import {
  activityLabel,
  availabilityStatus,
  findActivity,
  findOfferingForActivity,
} from "../../mock/student";

function ExamPage() {
  const { examId } = useParams();
  const { questions, saveQuestion } = useOutletContext<StudentQuestionsContext>();
  const activity = findActivity(examId);
  const [askOpen, setAskOpen] = useState(false);
  const [note, setNote] = useState("");

  if (
    !activity ||
    activity.itemType !== "assessment" ||
    activity.mode !== "paper" ||
    (activity.kind !== "midterm" && activity.kind !== "final")
  ) {
    return <div className="mx-auto max-w-5xl px-4 py-8">Exam not found.</div>;
  }

  const offering = findOfferingForActivity(activity.id);
  const status = availabilityStatus(activity.opened, activity.closed ?? activity.due);
  const label = activityLabel(activity);
  const contextTo = `/student/exams/${activity.id}`;
  const examQuestions = questions.filter((q) => q.contextTo === contextTo);

  const banner =
    status === "upcoming"
      ? { tone: "border-amber-200 bg-amber-500/10 text-amber-700", text: `This exam is not open yet. It opens on ${activity.opened}.` }
      : status === "closed"
        ? { tone: "border-red-200 bg-red-500/10 text-red-700", text: "The submission window for this exam has closed." }
        : { tone: "border-emerald-200 bg-emerald-500/10 text-emerald-700", text: "The exam window is open." };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[
        { label: "My courses", to: "/student/courses" },
        { label: offering?.code ?? "Course", to: offering ? `/student/courses/${offering.offeringId}` : undefined },
        { label },
      ]} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{activity.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{label} · Paper-based · Max {activity.max} marks</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" /> Opened {activity.opened} · Due {activity.due}
          </p>
          {activity.physical && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {activity.physical.room} · {activity.physical.timeWindow}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setAskOpen((v) => !v)}>
          <MessageCircleQuestion className="size-4" /> Ask teacher
        </Button>
      </div>

      <div className={`rounded-lg border px-4 py-3 text-sm ${banner.tone}`}>
        {banner.text}
        {status === "open" && activity.physical
          ? ` Attend in person at ${activity.physical.room} during ${activity.physical.timeWindow}.`
          : ""}
      </div>

      <Card>
        <CardHeader><CardTitle>Exam details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Type:</span> {label}</p>
          <p><span className="font-medium">Mode:</span> Physical / paper-based only</p>
          <p><span className="font-medium">Maximum marks:</span> {activity.max}</p>
          <p className="text-muted-foreground">This is a paper-based examination. No online attempt or file submission is required.</p>
        </CardContent>
      </Card>

      <QuestionThreadCard
        open={askOpen}
        title="Questions & responses"
        note={note}
        onNoteChange={setNote}
        onCancel={() => setAskOpen(false)}
        onSend={(text, visibility) => {
          saveQuestion({ contextType: "event", contextLabel: activity.title, contextTo, question: text, visibility });
          setNote("");
          setAskOpen(false);
        }}
        questions={examQuestions}
      />
    </div>
  );
}

export default ExamPage;
