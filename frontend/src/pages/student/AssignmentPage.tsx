import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { allActivities, findActivity, offerings, type Activity } from "../../mock/student";

function ActivityBar({ activity }: { activity?: Activity }) {
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
          if (selected) window.location.assign(to(selected));
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
  const activity = findActivity(assignmentId);
  const [submitted, setSubmitted] = useState(activity?.submitted ?? false);
  const [fileName, setFileName] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!activity) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Activity not found.</div>;
  }
  const offering = offerings.find((o) => o.weeks.some((w) => w.activities.some((a) => a.id === activity.id)));
  const graded = activity.graded ?? false;
  const canUpload = activity.submissionModes.includes("upload");
  const isPhysical = activity.submissionModes.includes("physical");

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[
        { label: "My courses", to: "/student/courses" },
        { label: offering?.code ?? "Course", to: offering ? `/student/courses/${offering.offeringId}` : undefined },
        { label: activity.kind === "project" ? "Project" : "Assignment" },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{activity.title}</h1>
        <p className="text-sm text-muted-foreground">
          Opened {activity.opened} - Due {activity.due} - Max {activity.max} marks
        </p>
        <p className="mt-1 text-xs text-muted-foreground capitalize">Type: {activity.kind}</p>
      </div>

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
                <div className="space-y-1">
                  <Label htmlFor="file">Upload file</Label>
                  <Input id="file" type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? fileName)} />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="note">Question for teacher (optional)</Label>
                <Textarea id="note" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Ask one clear question, if needed" />
                <p className="text-xs text-muted-foreground">Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.</p>
              </div>
              <Button
                onClick={() => {
                  if (canUpload && !fileName) return;
                  setSubmitted(true);
                  setSavedNote(noteDraft.trim());
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
              <TableRow><TableCell>Time remaining</TableCell><TableCell>{activity.due > "2026-11-22" ? `${activity.due} (on time)` : "Past due"}</TableCell></TableRow>
              <TableRow><TableCell>Last modified</TableCell><TableCell>{submitted ? "2026-11-21 09:15" : "-"}</TableCell></TableRow>
              <TableRow><TableCell>Uploaded file</TableCell><TableCell>{submitted && fileName ? fileName : submitted && !canUpload ? "Physical submission" : "-"}</TableCell></TableRow>
              <TableRow><TableCell>Question for teacher</TableCell><TableCell>{savedNote || "No question submitted."}</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {graded && (
        <Card>
          <CardHeader><CardTitle>Feedback</CardTitle></CardHeader>
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
