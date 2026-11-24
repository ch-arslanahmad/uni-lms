import { AlertCircle, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <LoaderCircle className="size-6 animate-spin text-blue-500" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="size-7 text-red-500" aria-hidden="true" />
      <p className="font-medium text-slate-900">Something went wrong</p>
      <p className="text-sm text-slate-500">{message}</p>
      {onRetry && <Button size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
