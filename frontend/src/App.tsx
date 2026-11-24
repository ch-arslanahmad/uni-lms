import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import {
  UserColumns,
  UserFilters,
  UserSearchKeys,
} from "./components/userTableConfig";
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
import ExamPage from "./pages/student/ExamPage";
import TeacherProfilePage from "./pages/student/TeacherProfilePage";
import MyQuestionsPage from "./pages/student/MyQuestionsPage";
import ResultsPage from "./pages/student/ResultsPage";
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyClasses from "./pages/teacher/MyClasses";
import ClassDetail from "./pages/teacher/ClassDetail";
import GradingPage from "./pages/teacher/GradingPage";
import SubmissionDetailPage from "./pages/teacher/SubmissionDetailPage";
import QuestionsPage from "./pages/teacher/QuestionsPage";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
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
      { path: "questions", element: <MyQuestionsPage /> },
      { path: "results", element: <ResultsPage /> },
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
  return <RouterProvider router={router} />;
}

export default App;
