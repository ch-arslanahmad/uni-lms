import { useState } from "react";
import Tabs from "../../components/Tabs";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Download, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { UploadBox } from "../../components/UploadBox";
import {
  csvDataOptions,
  type CsvDataType,
  type DataOption,
} from "../../mock/csvTemplates";
import { parseCsv, toCsv, downloadCsv, type ParsedCsv } from "../../lib/csv";
import {
  validateIngest,
  applyIngest,
  exportIngestData,
  type IngestError,
} from "../../lib/adminStore";

const PREVIEW_ROWS = 8;

export default function ImportExportPage() {
  const [tab, setTab] = useState<"import" | "export">("import");
  const [selectedType, setSelectedType] = useState<CsvDataType>("users");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [errors, setErrors] = useState<IngestError[]>([]);
  const [appliedCount, setAppliedCount] = useState(0);

  const activeOption = csvDataOptions.find((opt) => opt.id === selectedType) ?? csvDataOptions[0];

  const resetImport = () => {
    setSelectedFile(null);
    setParsed(null);
    setErrors([]);
    setUploadStatus("idle");
    setAppliedCount(0);
  };

  // Parse + validate the whole file client-side before anything is applied.
  const handleFileChange = async (file: File | null) => {
    resetImport();
    if (!file) return;
    setSelectedFile(file);
    const text = await file.text();
    const result = parseCsv(text);
    const rowErrors = validateIngest(selectedType, result.headers, result.rows);
    setParsed(result);
    setErrors(rowErrors);
    if (rowErrors.length) setUploadStatus("error");
  };

  // All-or-nothing: applyIngest re-validates and commits only if every row passes.
  const handleRunIngest = () => {
    if (!parsed) return;
    const rowErrors = applyIngest(selectedType, parsed.headers, parsed.rows);
    if (rowErrors.length) {
      setErrors(rowErrors);
      setUploadStatus("error");
      return;
    }
    setAppliedCount(parsed.rows.length);
    setUploadStatus("success");
  };

  const handleDownloadTemplate = (option: DataOption) => {
    downloadCsv(option.sampleFilename, toCsv(option.columns, []));
  };

  const handleExport = (option: DataOption) => {
    const { headers, rows } = exportIngestData(option.id);
    downloadCsv(`${option.id}_export.csv`, toCsv(headers, rows));
  };

  const preview = parsed && (
    <div className="flex flex-col gap-2">
      {errors.length > 0 ? (
        <div className="flex flex-col gap-1.5 p-3 text-xs rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
          <span className="font-semibold flex items-center gap-1.5">
            <AlertTriangle size={14} />
            {errors.length} problem{errors.length === 1 ? "" : "s"} found — nothing will be imported until every row is valid.
          </span>
          <ul className="list-disc pl-5 space-y-0.5 max-h-40 overflow-y-auto">
            {errors.map((err, idx) => (
              <li key={idx}>
                {err.row === 0 ? err.message : `Row ${err.row}: ${err.message}`}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        uploadStatus !== "success" && (
          <div className="p-2.5 text-xs rounded-md border bg-muted/30 text-muted-foreground">
            {parsed.rows.length} row{parsed.rows.length === 1 ? "" : "s"} parsed and valid. Review the preview, then run the ingest.
          </div>
        )
      )}

      {uploadStatus === "success" && (
        <div className="p-2.5 text-xs rounded-md border bg-muted/30 text-muted-foreground">
          {appliedCount} row{appliedCount === 1 ? "" : "s"} added to the mock store. Check the Users / Academics / Timetable pages.
        </div>
      )}

      {parsed.rows.length > 0 && (
        <div className="overflow-x-auto border rounded-md bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="p-2 text-left font-semibold">#</th>
                {parsed.headers.map((h, idx) => (
                  <th key={idx} className="p-2 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {parsed.rows.slice(0, PREVIEW_ROWS).map((row, rowIdx) => {
                const rowHasError = errors.some((e) => e.row === rowIdx + 1);
                return (
                  <tr key={rowIdx} className={rowHasError ? "bg-destructive/5" : undefined}>
                    <td className={`p-2 font-mono ${rowHasError ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                      {rowIdx + 1}
                    </td>
                    {parsed.headers.map((_, colIdx) => (
                      <td key={colIdx} className="p-2 whitespace-nowrap max-w-48 truncate">
                        {row[colIdx] ?? ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {parsed.rows.length > PREVIEW_ROWS && (
            <div className="p-2 text-[11px] text-muted-foreground border-t">
              Showing first {PREVIEW_ROWS} of {parsed.rows.length} rows.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen p-4 gap-4 max-w-5xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">CSV Import & Export</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bulk ingest or export institutional academic data in all-or-nothing transactions
          </p>
        </div>
      </div>

      <Tabs
        activeTab={tab}
        onChange={(next) => {
          setTab(next);
          resetImport();
        }}
        tabs={[
          {
            id: "import",
            label: "Import CSV",
            content: (
              <div className="flex flex-col gap-5 pt-2">
                {/* 1. Step: Select Target Data Type */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Step 1: Select Data Category to Ingest
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {csvDataOptions.map((opt) => {
                      const isSelected = selectedType === opt.id;
                      return (
                        <Card
                          key={opt.id}
                          size="sm"
                          onClick={() => {
                            setSelectedType(opt.id);
                            resetImport();
                          }}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                              : "hover:border-primary/40 bg-card"
                          }`}
                        >
                          <CardHeader className="p-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold">{opt.title}</CardTitle>
                              <FileSpreadsheet
                                size={16}
                                className={isSelected ? "text-primary" : "text-muted-foreground"}
                              />
                            </div>
                            <CardDescription className="text-xs mt-1 leading-snug">
                              {opt.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Step: Dedicated Upload Box Component */}
                <UploadBox
                  activeOption={activeOption}
                  selectedFile={selectedFile}
                  uploadStatus={uploadStatus}
                  onFileChange={handleFileChange}
                  onRunIngest={handleRunIngest}
                  onDownloadTemplate={handleDownloadTemplate}
                  preview={preview}
                  canIngest={!!parsed && errors.length === 0 && uploadStatus !== "success"}
                />
              </div>
            ),
          },
          {
            id: "export",
            label: "Export CSV",
            content: (
              <div className="flex flex-col gap-4 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Download Full Academic Records
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {csvDataOptions.map((opt) => (
                    <Card key={opt.id} size="sm" className="bg-card">
                      <CardHeader className="p-3.5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">{opt.title}</CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport(opt)}
                          >
                            <Download size={14} className="mr-1.5" />
                            Export
                          </Button>
                        </div>
                        <CardDescription className="text-xs mt-1 leading-snug">
                          {opt.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
