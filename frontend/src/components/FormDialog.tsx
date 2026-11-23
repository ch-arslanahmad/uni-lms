// Generic create/edit dialog with required-field validation and a visible
// error banner. Business validation lives in the store action passed as
// onSubmit (returns an error string, or null on success).

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  initialValues?: Record<string, string>;
  submitLabel?: string;
  /** Returns an error message to display, or null when the save succeeded. */
  onSubmit: (values: Record<string, string>) => string | null;
  /** Returns an error message (e.g. delete guard), or null on success. */
  onDelete?: () => string | null;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onDelete,
}: FormDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Reset the form each time the dialog opens (new entity or another row).
  useEffect(() => {
    if (open) {
      const defaults: Record<string, string> = {};
      for (const field of fields) {
        defaults[field.name] =
          initialValues?.[field.name] ??
          (field.type === "select" ? field.options?.[0]?.value ?? "" : "");
      }
      setValues(defaults);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setValue = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = () => {
    const missing = fields.filter(
      (f) => f.required !== false && !values[f.name]?.trim(),
    );
    if (missing.length) {
      setError(`Required: ${missing.map((f) => f.label).join(", ")}.`);
      return;
    }
    const result = onSubmit(values);
    if (result) setError(result);
    else onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid gap-3.5 py-2 text-sm">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor={field.name} className="text-right text-xs">
                {field.label}
              </Label>
              {field.type === "select" ? (
                <select
                  id={field.name}
                  value={values[field.name] ?? ""}
                  disabled={field.disabled}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className="col-span-3 flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs disabled:opacity-60"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className="col-span-3 h-8 text-xs"
                />
              )}
            </div>
          ))}

          {error && (
            <div className="p-2.5 text-xs rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mr-auto"
              onClick={() => {
                const result = onDelete();
                if (result) setError(result);
                else onOpenChange(false);
              }}
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSubmit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
