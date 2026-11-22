import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import { UserColumns, UserFilters, UserSearchKeys } from "./components/userTableConfig";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import NotFound from "./pages/NotFound";
import Academics from "./pages/admin/Academics";
import ImportExportPage from "./pages/admin/ImportExportPage";
import TimetablePage from "./pages/admin/TimetablePage";
import { users } from "./models";
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCourses from "./pages/student/MyCourses";
import CoursePage from "./pages/student/CoursePage";
import AssignmentPage from "./pages/student/AssignmentPage";
import QuizPage from "./pages/student/QuizPage";
import QuizAttemptPage from "./pages/student/QuizAttemptPage";
import QuizReviewPage from "./pages/student/QuizReviewPage";
import TeacherProfilePage from "./pages/student/TeacherProfilePage";
import AdminLayout from "./components/AdminLayout";

const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { path: "/", element: <AdminDashboard /> },
      {
        path: "/admin/users",
        element: (
          <UsersPage
            title="Users"
            data={users}
            columns={UserColumns}
            searchKeys={UserSearchKeys}
            filters={UserFilters}
          />
        ),
      },
      { path: "/admin/students", element: <StudentsPage /> },
      { path: "/admin/teachers", element: <TeachersPage /> },
      { path: "/admin/academics", element: <Academics /> },
      { path: "/admin/timetable", element: <TimetablePage /> },
      { path: "/admin/data-transfer", element: <ImportExportPage /> },
    ],
  },
  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: "courses", element: <MyCourses /> },
      { path: "courses/:offeringId", element: <CoursePage /> },
      { path: "assignments/:assignmentId", element: <AssignmentPage /> },
      { path: "quizzes/:quizId", element: <QuizPage /> },
      { path: "quizzes/:quizId/attempt", element: <QuizAttemptPage /> },
      { path: "quizzes/:quizId/review", element: <QuizReviewPage /> },
      { path: "teachers/:teacherId", element: <TeacherProfilePage /> },
    ],
  },
  { path: "/student/*", element: <Navigate to="/student" replace /> },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
