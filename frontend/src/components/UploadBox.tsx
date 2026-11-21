import { useRef, type ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, Download, CheckCircle2 } from "lucide-react";
import type { DataOption } from "../mock/csvTemplates";

export interface UploadBoxProps {
  activeOption: DataOption;
  selectedFile: File | null;
  uploadStatus: "idle" | "success" | "error";
  onFileChange: (file: File | null) => void;
  onRunIngest: () => void;
  onDownloadTemplate: (option: DataOption) => void;
}

export function UploadBox({
  activeOption,
  selectedFile,
  uploadStatus,
  onFileChange,
  onRunIngest,
  onDownloadTemplate,
}: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
      {/* Upload Drag & Drop Area */}
      <div className="md:col-span-2 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step 2: Upload CSV File ({activeOption.title})
        </span>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/60 hover:bg-muted/30 transition-all text-center bg-card"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Upload size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">
              {selectedFile ? selectedFile.name : "Click to select a CSV file"}
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready to process`
                : "Standard comma-separated format (.csv)"}
            </span>
          </div>
        </div>

        {uploadStatus === "success" && (
          <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md">
            <CheckCircle2 size={16} />
            <span>File uploaded and parsed successfully. Ready for database batch write.</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadTemplate(activeOption)}
          >
            <Download size={14} className="mr-1.5" />
            Download Template CSV
          </Button>

          <Button
            size="sm"
            disabled={!selectedFile}
            onClick={onRunIngest}
          >
            Run Bulk Ingest
          </Button>
        </div>
      </div>

      {/* Schema Columns Spec */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Expected Columns
        </span>
        <Card size="sm" className="bg-muted/30 border">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold">Column Specification</CardTitle>
            <CardDescription className="text-[11px]">
              All columns required for atomic commit:
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="divide-y text-xs font-mono">
              {activeOption.columns.map((col, idx) => (
                <li key={idx} className="py-1 text-foreground flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-sans">{idx + 1}.</span>
                  <span>{col}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
