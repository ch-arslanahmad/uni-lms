import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { users } from "../models";

// Preserves the original admin shell while App moves to createBrowserRouter.
function AdminLayout() {
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
