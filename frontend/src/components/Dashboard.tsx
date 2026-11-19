// Generic dashboard shell — reused by AdminDashboard, TeacherDashboard, StudentDashboard.
// Callers supply their own stat cards, main content, and quick actions.

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import type { StatCardInfo, QuickAction } from "../models";

// ── Prop types ────────────────────────────────────────────────────────────────

export interface DashboardProps {
  name: string;
  semester?: string;
  subtitle?: string;
  stats: StatCardInfo[];
  tableSlot: ReactNode;
  quickActions: QuickAction[];
}

// ── Component ─────────────────────────────────────────────────────────────────

function Dashboard({
  name,
  semester = "Fall 2026",
  subtitle = "Welcome to the Dashboard",
  stats,
  tableSlot,
  quickActions,
}: DashboardProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">

      {/* Greeting */}
      <div className="flex flex-row items-baseline justify-between">
        <h1 className="text-2xl font-bold">
          Hello <span className="text-blue-500">{name}</span>
        </h1>
        <span className="text-sm text-muted-foreground">{semester}</span>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const card = (
            <Card className="p-5 transition-shadow hover:shadow-md hover:border-blue-200 cursor-pointer">
              <p className="text-3xl font-bold tabular-nums text-blue-500">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </Card>
          );
          return s.href ? (
            <a key={s.label} href={s.href}>{card}</a>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Main content + Quick actions */}
      <div className="mt-10 flex flex-col gap-4 lg:flex-row">

        {/* Caller-supplied table / content */}
        <div className="min-w-0 lg:basis-3/4">
          {tableSlot}
        </div>

        {/* Quick actions */}
        <Card className="w-full lg:w-56 shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickActions.map(({ label, icon: Icon, href }) =>
              href ? (
                <a key={label} href={href} className="w-full">
                  <Button variant="outline" className="justify-start gap-2 w-full">
                    <Icon size={15} /> {label}
                  </Button>
                </a>
              ) : (
                <Button key={label} variant="outline" className="justify-start gap-2 w-full">
                  <Icon size={15} /> {label}
                </Button>
              )
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default Dashboard;
