import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";

export interface StatMetricProps {
  label: string;
  value: string | number;
  description?: string;
  highlight?: boolean;
  icon?: ReactNode;
}

export function StatMetric({
  label,
  value,
  description,
  highlight,
  icon,
}: StatMetricProps) {
  return (
    <Card
      size="sm"
      className={`shadow-xs py-2.5 transition-all ${
        highlight
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "border-border bg-card"
      }`}
    >
      <CardHeader className="p-0 px-3 pb-1">
        <div className="flex items-center justify-between w-full">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              highlight ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          {value}
        </CardTitle>
        {description && (
          <CardDescription className="text-[11px] leading-tight">
            {description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
