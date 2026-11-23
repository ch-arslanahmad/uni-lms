import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { users, Role } from "../models";
import { useRequireRole } from "../auth/AuthContext";

// Preserves the original admin shell while App moves to createBrowserRouter.
function AdminLayout() {
  const guard = useRequireRole(Role.admin);
  if (guard) return <>{guard}</>;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={users[0]} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AdminLayout;
