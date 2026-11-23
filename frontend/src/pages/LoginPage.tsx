import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";

const roles = [
  { id: "admin", label: "Admin", description: "Manage academic structure, users and schedules.", to: "/" },
  { id: "teacher", label: "Teacher", description: "Manage classes, grading and course content.", to: "/teacher" },
  { id: "student", label: "Student", description: "View courses, submit work and track results.", to: "/student" },
] as const;

export default function LoginPage() {
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("student");
  const navigate = useNavigate();

  const selected = roles.find((r) => r.id === role) ?? roles[2];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to Uni-LMS</CardTitle>
          <CardDescription>
            Phase 1 mock login — select a role to enter the demo. Real authentication arrives with the backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="role" className="text-xs">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as (typeof roles)[number]["id"])}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
            {selected.description}
          </div>

          <Button onClick={() => navigate(selected.to)}>Continue as {selected.label}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
