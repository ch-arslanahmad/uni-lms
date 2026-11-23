// Minimal CSV parse/serialize for the Phase-1 mock ingest (FR17 UI).
// Real parsing + atomic commit belong to the backend; this only
// validates and previews client-side before the mock store applies.

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

/** Parse CSV text, honoring double-quoted fields ("" escapes a quote). */
export function parseCsv(text: string): ParsedCsv {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    record.push(field);
    field = "";
  };
  const pushRecord = () => {
    pushField();
    // skip fully empty lines
    if (record.some((cell) => cell.trim() !== "")) records.push(record);
    record = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      pushField();
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      pushRecord();
    } else {
      field += ch;
    }
  }
  if (field !== "" || record.length > 0) pushRecord();

  const [headerRow, ...rows] = records;
  return {
    headers: (headerRow ?? []).map((h) => h.trim()),
    rows,
  };
}

/** Serialize rows back to CSV, quoting cells that need it. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (value: string | number) => {
    const s = String(value ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

/** Trigger a browser download of CSV content. */
export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
