import { useState } from "react";
import Tabs from "../../components/Tabs";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Download, FileSpreadsheet } from "lucide-react";
import { UploadBox } from "../../components/UploadBox";
import {
  csvDataOptions,
  type CsvDataType,
  type DataOption,
} from "../../mock/csvTemplates";

export default function ImportExportPage() {
  const [tab, setTab] = useState<"import" | "export">("import");
  const [selectedType, setSelectedType] = useState<CsvDataType>("users");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const activeOption = csvDataOptions.find((opt) => opt.id === selectedType) ?? csvDataOptions[0];

  const handleDownloadSample = (option: DataOption) => {
    const csvContent = "data:text/csv;charset=utf-8," + option.columns.join(",") + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", option.sampleFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 gap-4 max-w-5xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">CSV Import & Export</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bulk ingest or export institutional academic data in all-or-nothing transactions (FR17)
          </p>
        </div>
      </div>

      <Tabs
        activeTab={tab}
        onChange={(next) => {
          setTab(next);
          setSelectedFile(null);
          setUploadStatus("idle");
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
                            setSelectedFile(null);
                            setUploadStatus("idle");
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
                  onFileChange={setSelectedFile}
                  onRunIngest={() => setUploadStatus("success")}
                  onDownloadTemplate={handleDownloadSample}
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
                            onClick={() => handleDownloadSample(opt)}
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
