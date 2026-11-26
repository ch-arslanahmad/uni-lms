import { Download } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { isMcqAssessment, mcqMarksFor } from "../../api";
import type {
  AssessmentAnswer,
  AssessmentQuestion,
  SubmissionFile,
  TeacherAssessment,
} from "../../api";

function formatSize(size: SubmissionFile["size"]): string {
  return typeof size === "number" ? `${Math.max(1, Math.round(size / 1024))} KB` : size;
}

export function AttachmentCard({ file }: { file: SubmissionFile }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium text-slate-900">{file.name}</p>
        <p className="mt-1 text-xs text-slate-500">
          {file.mimeType} · {formatSize(file.size)}
        </p>
      </div>
      {file.url ? (
        <div className="flex flex-wrap gap-2">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            View
          </a>
          <a
            href={file.url}
            download={file.name}
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <Download aria-hidden="true" className="size-4" />
            Download
          </a>
        </div>
      ) : (
        <p className="text-xs text-slate-500">File URL not recorded.</p>
      )}
      <p className="text-xs text-slate-500">If the file doesn&apos;t open, use Download.</p>
    </div>
  );
}

export function AssessmentReference({ assessment }: { assessment: TeacherAssessment }) {
  const isMcq = isMcqAssessment(assessment);
  if (isMcq && !assessment.document && !assessment.documentName) {
    return (
      <section className="px-6 py-6">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Assessment reference</h3>
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-4 text-sm">
          <p className="font-medium text-slate-900">{assessment.title}</p>
          <p className="text-xs text-slate-500">{assessment.instructions}</p>
          {assessment.physicalRoom && (
            <p className="text-xs text-slate-500">Exam room: {assessment.physicalRoom}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-6">
      <h3 className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Assessment reference</h3>
      <div className="mt-3 space-y-3 border-t border-slate-100 pt-4 text-sm">
        <p className="font-medium text-slate-900">{assessment.title}</p>
        <p className="text-xs text-slate-500">{assessment.instructions}</p>
        {assessment.document ? (
          <AttachmentCard file={assessment.document} />
        ) : assessment.documentName ? (
          <p className="text-xs text-slate-500">
            Reference document: {assessment.documentName} (file not recorded).
          </p>
        ) : !isMcq ? (
          <p className="text-xs text-slate-500">No reference file recorded for this assessment.</p>
        ) : null}
        {assessment.physicalRoom && (
          <p className="text-xs text-slate-500">Exam room: {assessment.physicalRoom}</p>
        )}
      </div>
    </section>
  );
}

type AssessmentAnswersProps = {
  questions: AssessmentQuestion[];
  answers: AssessmentAnswer[];
  submittedAt?: string;
  onWrittenMark?: (questionId: string, marks: number | null) => void;
};

export function AssessmentAnswers({ questions, answers, submittedAt, onWrittenMark }: AssessmentAnswersProps) {
  const mcqQuestions = questions.filter((question) => question.type === "mcq");
  const writtenQuestions = questions.filter((question) => question.type === "written");

  return (
    <section className="px-6 py-6">
      <h3 className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Assessment answers</h3>
      <div className="mt-3 space-y-4 border-t border-slate-100 pt-4 text-sm">
        <p className="text-xs text-slate-500">
          {submittedAt ? `Attempted: ${submittedAt}` : "No attempt recorded for this student."}
        </p>
        {questions.length === 0 && (
          <p className="text-slate-500">No questions recorded for this assessment.</p>
        )}
        {mcqQuestions.map((question) => {
          const answer = answers.find((item) => item.questionId === question.id);
          return (
            <div key={question.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900">{question.text}</p>
                <span className="shrink-0 text-xs tabular-nums text-slate-500" title="Calculated from the answer key">
                  {mcqMarksFor(question, answer)} / {question.marks} (auto)
                </span>
              </div>
              <div className="space-y-1.5">
                {(question.options ?? []).map((option, index) => {
                  const selected = answer?.selectedOption === index;
                  const correct = question.correctOption === index;
                  return (
                    <div
                      key={`${question.id}-${index}`}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                        correct
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : selected
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="font-medium">{index + 1}.</span>
                      <span className="flex-1">{option}</span>
                      {correct && <span>Correct</span>}
                      {selected && !correct && <span>Selected</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {writtenQuestions.map((question) => {
          const answer = answers.find((item) => item.questionId === question.id);
          return (
            <div key={question.id} className="space-y-2 rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900">{question.text}</p>
                <label className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                  Marks
                  <input
                    type="number"
                    min={0}
                    max={question.marks}
                    step="any"
                    aria-label={`Marks for: ${question.text}`}
                    value={answer?.marksAwarded ?? ""}
                    disabled={!onWrittenMark}
                    onChange={(event) => {
                      const raw = event.target.value;
                      const value = raw === "" ? null : Number(raw);
                      if (value != null && (!Number.isFinite(value) || value < 0 || value > question.marks)) return;
                      onWrittenMark?.(question.id, value);
                    }}
                    className="h-8 w-16 rounded-lg border border-slate-200 bg-white px-2 text-right text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                  />
                  / {question.marks}
                </label>
              </div>
              <p className="text-xs text-slate-500">{answer?.textAnswer ?? "No written answer recorded."}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
