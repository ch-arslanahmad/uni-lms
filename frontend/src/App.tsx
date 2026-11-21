import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { users } from "./models";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UsersPage, {
  UserColumns,
  UserFilters,
  UserSearchKeys,
} from "./pages/admin/UsersPage";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import NotFound from "./pages/NotFound";
import Academics from "./pages/admin/Academics";
import ImportExportPage from "./pages/admin/ImportExportPage";
import TimetablePage from "./pages/admin/TimetablePage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar user={users[0]} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            {/* <Route path="/academics" element={<Academics />} /> */}
            <Route
              path="/admin/users"
              element={
                <UsersPage
                  title="Users"
                  data={users}
                  columns={UserColumns}
                  searchKeys={UserSearchKeys}
                  filters={UserFilters}
                />
              }
            />
            <Route path="/admin/students" element={<StudentsPage />} />
            <Route path="/admin/teachers" element={<TeachersPage />} />
            <Route path="/admin/academics" element={<Academics />} />
            <Route path="/admin/timetable" element={<TimetablePage />} />
            <Route path="/admin/data-transfer" element={<ImportExportPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
