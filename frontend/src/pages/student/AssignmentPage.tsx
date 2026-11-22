import { useState } from "react";
import { Clock, MessageCircleQuestion, Upload } from "lucide-react";
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { StudentQuestionsContext } from "../../components/student/StudentLayout";
import { allActivities, findActivity, offerings, type Activity } from "../../mock/student";

function ActivityBar({ activity }: { activity?: Activity }) {
  const navigate = useNavigate();
  const all = allActivities();
  const index = activity ? all.findIndex((a) => a.id === activity.id) : -1;
  const prev = all[index - 1];
  const next = all[index + 1];
  const to = (a: Activity) => (a.kind === "quiz" ? `/student/quizzes/${a.id}` : `/student/assignments/${a.id}`);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3">
      <Link to={prev ? to(prev) : "#"}>
        <Button variant="outline" size="sm" disabled={!prev}>Prev Section</Button>
      </Link>
      <Select
        value={activity?.id}
        onValueChange={(v) => {
          const selected = all.find((a) => a.id === v);
          if (selected) navigate(to(selected));
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Jump to..." />
        </SelectTrigger>
        <SelectContent>
          {all.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link to={next ? to(next) : "#"}>
        <Button variant="outline" size="sm" disabled={!next}>Next Activity</Button>
      </Link>
    </div>
  );
}

function AssignmentPage() {
  const { assignmentId } = useParams();
  const [params] = useSearchParams();
  const { questions, saveQuestion } = useOutletContext<StudentQuestionsContext>();
  const activity = findActivity(assignmentId);
  const [submitted, setSubmitted] = useState(activity?.submitted ?? false);
  const [fileName, setFileName] = useState("");
  const [askOpen, setAskOpen] = useState(params.get("ask") === "1" || params.get("extension") === "1");
  const [extensionMode, setExtensionMode] = useState(params.get("extension") === "1");
  const [noteDraft, setNoteDraft] = useState(() =>
    params.get("extension") ? "Extension request: Reason - \nNeeded until - \nWork completed so far - " : "",
  );
  const [savedNote, setSavedNote] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!activity) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Activity not found.</div>;
  }
  const offering = offerings.find((o) => o.weeks.some((w) => w.activities.some((a) => a.id === activity.id)));
  const graded = activity.graded ?? false;
  const canUpload = activity.submissionModes.includes("upload");
  const isPhysical = activity.submissionModes.includes("physical");
  const dueTone = graded || submitted
    ? "text-emerald-600"
    : activity.due < "2026-11-22"
      ? "text-red-600"
      : activity.due <= "2026-11-24"
        ? "text-amber-600"
        : "text-emerald-600";
  const dueLabel = graded || submitted
    ? `Due ${activity.due}`
    : activity.due < "2026-11-22"
      ? `Past due - ${activity.due}`
      : activity.due <= "2026-11-24"
        ? `Due soon - ${activity.due}`
        : `Due ${activity.due}`;
  const eventQuestions = questions.filter((q) => q.contextTo === `/student/assignments/${activity.id}`);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[
        { label: "My courses", to: "/student/courses" },
        { label: offering?.code ?? "Course", to: offering ? `/student/courses/${offering.offeringId}` : undefined },
        { label: activity.kind === "project" ? "Project" : "Assignment" },
      ]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{activity.title}</h1>
          <p className="text-sm text-muted-foreground">
            Opened {activity.opened} - Max {activity.max} marks
          </p>
          <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${dueTone}`}>
            <Clock className="size-4" /> {dueLabel}
          </p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">Type: {activity.kind}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setExtensionMode(false); setAskOpen((v) => !v); setTimeout(() => document.getElementById("note")?.focus(), 0); }}>
            <MessageCircleQuestion className="size-4" /> Ask teacher
          </Button>
          {!graded && activity.kind !== "quiz" && (
            <Button variant="outline" size="sm" onClick={() => { setExtensionMode(true); setAskOpen(true); setNoteDraft((d) => d || "Extension request: Reason - \nNeeded until - \nWork completed so far - "); setTimeout(() => document.getElementById("note")?.focus(), 0); }}>
              <Clock className="size-4" /> Request time
            </Button>
          )}
        </div>
      </div>

      {(askOpen || eventQuestions.length > 0) && (
        <Card>
          <CardHeader><CardTitle>{extensionMode ? "Request time" : "Questions & responses"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {askOpen && (
              <div className="space-y-2">
                <Label htmlFor="note">{extensionMode ? "Request details" : "Your question"}</Label>
                <Textarea id="note" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder={extensionMode ? "Reason, needed until, work completed so far" : "Ask one clear question, if needed"} />
                <p className="text-xs text-muted-foreground">Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { const note = noteDraft.trim(); if (!note) return; setSavedNote(note); saveQuestion({ contextType: "event", contextLabel: activity.title, contextTo: `/student/assignments/${activity.id}`, question: note }); setNoteDraft(""); setAskOpen(false); }}>Send</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAskOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {eventQuestions.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">Your questions for this event</p>
                {eventQuestions.map((q) => {
                  const status = q.answer && !q.readAt ? "Answered (new)" : q.answer ? "Read" : "Pending";
                  return (
                    <div key={q.id} className="rounded border px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{q.question}</p>
                        <span className={`shrink-0 text-xs ${status === "Answered (new)" ? "font-medium text-blue-600" : "text-muted-foreground"}`}>{status}</span>
                      </div>
                      {q.answer ? (
                        <div className="mt-2 text-muted-foreground">
                          <p><span className="font-medium text-foreground">{q.responderName}:</span> {q.answer}</p>
                          <p className="mt-1 text-xs">{q.answeredAt}</p>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">No reply yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {graded && (
        <Card>
          <CardHeader><CardTitle>Feedback &amp; grading</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-xl font-bold">{activity.score?.toFixed(2)} / {activity.max.toFixed(2)}</p>
            <p>Graded on 2026-09-12 14:30</p>
            <p>Good structure - ensure every claim is backed by your SQL output.</p>
            <p>
              Graded by{" "}
              <Link to={`/student/teachers/${offering?.instructorId ?? 3}`} className="text-blue-600 hover:underline">
                Imran Razzaq
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Submission requirements</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {canUpload && <p>Attachment upload required.</p>}
          {isPhysical && activity.physical && (
            <p>
              Physical submission: {activity.physical.timeWindow}, {activity.physical.room}. You can come any working day before and on the due date.
            </p>
          )}
          {!canUpload && !isPhysical && <p>No online submission required.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Submission</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {!graded && !submitted && (
            <div className="space-y-3">
              {canUpload && (
                <div className="space-y-2">
                  <Label htmlFor="file">Upload file</Label>
                  <label
                    htmlFor="file"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-sm hover:bg-muted/50"
                  >
                    <Upload className="size-5 text-muted-foreground" />
                    <span className="font-medium">{fileName || "Click to choose a file"}</span>
                    <span className="text-xs text-muted-foreground">{fileName ? "Click to replace" : "PDF, DOCX, ZIP, or image"}</span>
                  </label>
                  <Input id="file" type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? fileName)} />
                </div>
              )}
              <Button
                onClick={() => {
                  if (canUpload && !fileName) return;
                  setSubmitted(true);
                }}
                disabled={canUpload && !fileName}
              >
                {isPhysical && !canUpload ? "Mark as submitted" : "Add submission"}
              </Button>
              {canUpload && !fileName && <p className="text-xs text-muted-foreground">Select a file to submit.</p>}
            </div>
          )}

          {!graded && submitted && (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { setNoteDraft(savedNote); setSubmitted(false); }}>Edit submission</Button>
              <Button size="sm" variant="destructive" onClick={() => setConfirmRemove(true)}>Remove submission</Button>
            </div>
          )}

          {graded && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700">Graded and locked. No further edits allowed.</p>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Submission status</TableCell><TableCell>{submitted ? "Submitted for grading" : "No submissions have been made yet"}</TableCell></TableRow>
              <TableRow><TableCell>Grading status</TableCell><TableCell>{graded ? "Graded" : "Not graded"}</TableCell></TableRow>
              <TableRow><TableCell>Time remaining</TableCell><TableCell className={dueTone}>{dueLabel}</TableCell></TableRow>
              <TableRow><TableCell>Last modified</TableCell><TableCell>{submitted ? "2026-11-21 09:15" : "-"}</TableCell></TableRow>
              <TableRow><TableCell>Uploaded file</TableCell><TableCell>{submitted && fileName ? fileName : submitted && !canUpload ? "Physical submission" : "-"}</TableCell></TableRow>
              <TableRow><TableCell>Question for teacher</TableCell><TableCell>{savedNote || "No question submitted."}</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove submission?</DialogTitle>
            <DialogDescription>This clears your submission for this activity.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setSubmitted(false); setFileName(""); setSavedNote(""); setNoteDraft(""); setConfirmRemove(false); }}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ActivityBar activity={activity} />
    </div>
  );
}

export default AssignmentPage;
