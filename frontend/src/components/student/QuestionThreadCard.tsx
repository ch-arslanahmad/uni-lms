import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  studentQuestionStatusLabel,
  type QuestionVisibility,
  type StudentQuestion,
} from "../../mock/student";

interface QuestionThreadCardProps {
  open: boolean;
  title: string;
  inputLabel?: string;
  placeholder?: string;
  note: string;
  onNoteChange: (value: string) => void;
  onSend: (text: string, visibility: QuestionVisibility) => void;
  onCancel: () => void;
  questions: StudentQuestion[];
  tip?: string;
}

export function QuestionThreadCard({
  open,
  title,
  inputLabel = "Your question",
  placeholder = "Ask one clear question, if needed",
  note,
  onNoteChange,
  onSend,
  onCancel,
  questions,
  tip = "Tip: batch your questions into one message. Include context, what you tried, and what you need clarified.",
}: QuestionThreadCardProps) {
  const [visibility, setVisibility] = useState<QuestionVisibility>("public");

  if (!open && questions.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {open && (
          <div className="space-y-2">
            <Label htmlFor="question-thread-note">{inputLabel}</Label>
            <Textarea
              id="question-thread-note"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder={placeholder}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="question-thread-visibility" className="text-xs text-muted-foreground">Visibility</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as QuestionVisibility)}>
                <SelectTrigger id="question-thread-visibility" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public to section</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{tip}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                const text = note.trim();
                if (!text) return;
                onSend(text, visibility);
                setVisibility("public");
              }}>Send</Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        )}
        {questions.length > 0 && (
          <div className={`space-y-2 ${open ? "border-t pt-3" : ""}`}>
            <p className="text-xs font-medium text-muted-foreground">Your questions for this event</p>
            {questions.map((q) => {
              const status = studentQuestionStatusLabel(q);
              return (
                <div key={q.id} className="rounded border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{q.question}</p>
                    <span className={`shrink-0 text-xs ${status === "Answered (new)" ? "font-medium text-blue-600" : "text-muted-foreground"}`}>
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{q.visibility === "public" ? "Public" : "Private"}</p>
                  {q.answer ? (
                    <div className="mt-2 text-muted-foreground">
                      <p><span className="font-medium text-foreground">{q.responderName}:</span> {q.answer}</p>
                      <p className="mt-1 text-xs">{q.answeredAt}</p>
                      {q.resolvedAt && <p className="mt-1 text-xs">Resolved {q.resolvedAt}</p>}
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
  );
}
