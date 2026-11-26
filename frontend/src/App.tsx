import { Link, RouterProvider, createBrowserRouter } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import {
  UserColumns,
  UserFilters,
  UserSearchKeys,
} from "./components/userTableConfig";
import { useAdminStore } from "./lib/adminStore";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import Academics from "./pages/admin/Academics";
import ImportExportPage from "./pages/admin/ImportExportPage";
import TimetablePage from "./pages/admin/TimetablePage";
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCourses from "./pages/student/MyCourses";
import CoursePage from "./pages/student/CoursePage";
import AssignmentPage from "./pages/student/AssignmentPage";
import QuizPage from "./pages/student/QuizPage";
import QuizAttemptPage from "./pages/student/QuizAttemptPage";
import QuizReviewPage from "./pages/student/QuizReviewPage";
import ExamPage from "./pages/student/ExamPage";
import TeacherProfilePage from "./pages/student/TeacherProfilePage";
import MyQuestionsPage from "./pages/student/MyQuestionsPage";
import ResultsPage from "./pages/student/ResultsPage";
import StudentTimetablePage from "./pages/student/StudentTimetablePage";
import DatesheetPage from "./pages/student/DatesheetPage";
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyClasses from "./pages/teacher/MyClasses";
import ClassDetail from "./pages/teacher/ClassDetail";
import GradingPage from "./pages/teacher/GradingPage";
import SubmissionDetailPage from "./pages/teacher/SubmissionDetailPage";
import QuestionsPage from "./pages/teacher/QuestionsPage";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import AdminLayout from "./components/AdminLayout";

// Same UsersPage as the other branches, backed by the live admin store so
// CSV imports appear without duplicating the users list in App.
function AdminUsersRoute() {
  const store = useAdminStore();
  return (
    <UsersPage
      title="Users"
      data={store.users}
      columns={UserColumns}
      searchKeys={UserSearchKeys}
      filters={UserFilters}
    />
  );
}

// The published datesheet is also readable without entering a role area.
function PublicDatesheetRoute() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/login" className="font-bold">Uni LMS</Link>
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Sign in</Link>
        </div>
      </header>
      <DatesheetPage standalone />
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/datesheet", element: <PublicDatesheetRoute /> },
  {
    element: <AdminLayout />,
    children: [
      { path: "/", element: <AdminDashboard /> },
      { path: "/admin/users", element: <AdminUsersRoute /> },
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
      { path: "questions", element: <MyQuestionsPage /> },
      { path: "results", element: <ResultsPage /> },
      { path: "timetable", element: <StudentTimetablePage /> },
      { path: "datesheet", element: <DatesheetPage /> },
      { path: "assignments/:assignmentId", element: <AssignmentPage /> },
      { path: "quizzes/:quizId", element: <QuizPage /> },
      { path: "quizzes/:quizId/attempt", element: <QuizAttemptPage /> },
      { path: "quizzes/:quizId/review", element: <QuizReviewPage /> },
      { path: "exams/:examId", element: <ExamPage /> },
      { path: "teachers/:teacherId", element: <TeacherProfilePage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/teacher",
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherDashboard /> },
      { path: "classes", element: <MyClasses /> },
      { path: "classes/:sectionId", element: <ClassDetail /> },
      { path: "grading", element: <GradingPage /> },
      { path: "grading/:studentRef/:assessmentRef", element: <SubmissionDetailPage /> },
      { path: "questions", element: <QuestionsPage /> },
      { path: "timetable", element: <TeacherTimetable /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}

export default App;
