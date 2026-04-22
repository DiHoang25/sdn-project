import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import QuizzesPage from "./pages/QuizzesPage.jsx";
import QuizDetailPage from "./pages/QuizDetailPage.jsx";
import AdminQuizzesPage from "./pages/AdminQuizzesPage.jsx";
import QuizFormPage from "./pages/QuizFormPage.jsx";
import QuestionsPage from "./pages/QuestionsPage.jsx";
import QuestionFormPage from "./pages/QuestionFormPage.jsx";
import AdminQuizDetailPage from "./pages/AdminQuizDetailPage.jsx";
import QuestionDetailPage from "./pages/QuestionDetailPage.jsx";
import {
  sessionExpired,
  selectAuthToken,
  selectIsAdmin,
  selectIsAuthenticated,
} from "./features/auth/authSlice.js";

const TAB_TOKEN_KEY = "quiz-master-tab-token";

function RootRedirect() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? "/admin/quizzes" : "/quizzes"} replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const authToken = useSelector(selectAuthToken);

  useEffect(() => {
    const previousTabToken = sessionStorage.getItem(TAB_TOKEN_KEY);

    // Only validate token drift when the tab reloads or re-initializes.
    if (previousTabToken && authToken && previousTabToken !== authToken) {
      sessionStorage.removeItem(TAB_TOKEN_KEY);
      dispatch(sessionExpired("403 Forbidden: Session changed in another tab. Please login again."));
      return;
    }

    if (authToken) {
      sessionStorage.setItem(TAB_TOKEN_KEY, authToken);
    } else {
      sessionStorage.removeItem(TAB_TOKEN_KEY);
    }
  }, [authToken, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:quizId" element={<QuizDetailPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
            <Route path="/admin/quizzes/new" element={<QuizFormPage mode="create" />} />
            <Route path="/admin/quizzes/:quizId" element={<AdminQuizDetailPage />} />
            <Route path="/admin/quizzes/:quizId/edit" element={<QuizFormPage mode="edit" />} />
            <Route path="/admin/questions" element={<QuestionsPage />} />
            <Route path="/admin/questions/new" element={<QuestionFormPage mode="create" />} />
            <Route path="/admin/questions/:questionId" element={<QuestionDetailPage />} />
            <Route path="/admin/questions/:questionId/edit" element={<QuestionFormPage mode="edit" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}