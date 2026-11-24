import { GraduationCap, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Role } from "../models";

const ROLES = [
  { role: Role.student, label: "Student", icon: UserRound, description: "View courses, submit work, check results." },
  { role: Role.teacher, label: "Teacher", icon: GraduationCap, description: "Manage sections, grading and questions." },
  { role: Role.admin, label: "Super Admin", icon: ShieldCheck, description: "Maintain academic structure and users." },
];

function LoginPage() {
  const { role, login, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");

  function signIn(selected: Role) {
    login(selected);
    // "/" is the admin home; other roles would bounce straight back to login.
    const destination = next && next !== "/" ? next : (selected === Role.admin ? "/" : `/${selected}`);
    navigate(destination, { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4 py-12">
      <div className="flex items-center gap-2 text-xl font-bold">
        <UsersRound className="size-6 text-blue-500" aria-hidden="true" />
        Uni LMS
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Choose your role</h1>
        <p className="mt-1 text-sm text-slate-500">
          Phase 1 role picker. Real credentials are handled by the Spring API in Phase 2.
        </p>
      </div>
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {ROLES.map(({ role: option, label, icon: Icon, description }) => (
          <Card key={option} className={role === option ? "border-blue-400 ring-2 ring-blue-500/20" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-4 text-blue-500" aria-hidden="true" />
                {label}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm" onClick={() => signIn(option)}>
                Continue as {label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {role && (
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign out (currently {role})
        </Button>
      )}
    </div>
  );
}

export default LoginPage;
