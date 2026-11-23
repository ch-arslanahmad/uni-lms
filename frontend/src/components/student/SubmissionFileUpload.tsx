import { Upload } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type SubmissionFileUploadProps = {
  id: string;
  fileName: string;
  onFileChange: (fileName: string) => void;
  accept?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
};

export function SubmissionFileUpload({
  id,
  fileName,
  onFileChange,
  accept,
  label = "Upload file",
  hint,
  disabled,
}: SubmissionFileUploadProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-sm ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted/50"}`}
      >
        <Upload className="size-5 text-muted-foreground" />
        <span className="font-medium">{fileName || "Click to choose a file"}</span>
        <span className="text-xs text-muted-foreground">
          {fileName ? "Click to replace" : hint || "PDF, DOCX, ZIP, or image"}
        </span>
      </label>
      <Input
        id={id}
        type="file"
        className="hidden"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onFileChange(e.target.files?.[0]?.name ?? fileName)}
      />
    </div>
  );
}
