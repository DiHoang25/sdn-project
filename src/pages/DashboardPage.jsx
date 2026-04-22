import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes } from "../features/quizzes/quizzesSlice.js";
import { fetchQuestions } from "../features/questions/questionsSlice.js";
import { selectAuthUser, selectIsAdmin } from "../features/auth/authSlice.js";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const isAdmin = useSelector(selectIsAdmin);
  const quizzes = useSelector((state) => state.quizzes.items);
  const questions = useSelector((state) => state.questions.items);
  const quizStatus = useSelector((state) => state.quizzes.status);
  const questionStatus = useSelector((state) => state.questions.status);

  useEffect(() => {
    if (quizStatus === "idle") {
      dispatch(fetchQuizzes());
    }
    if (isAdmin && questionStatus === "idle") {
      dispatch(fetchQuestions());
    }
  }, [dispatch, isAdmin, quizStatus, questionStatus]);

  return (
    <div className="stacked-layout">
      <section className="hero-card card border-0 shadow-sm">
        <div className="card-body p-4 p-lg-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="eyebrow">Full-stack Quiz Application</span>
              <h1 className="display-6 fw-bold mt-3 mb-3">Take quizzes or manage questions as an admin.</h1>
              <p className="lead text-secondary mb-4">
                Logged in as <strong>{user?.username || "guest"}</strong>
                {isAdmin ? " and you have admin privileges." : "."}
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link className="btn btn-primary px-4" to="/quizzes">
                  Browse Quizzes
                </Link>
                {isAdmin ? (
                  <>
                    <Link className="btn btn-outline-primary px-4" to="/admin/quizzes">
                      Manage Quizzes
                    </Link>
                    <Link className="btn btn-outline-primary px-4" to="/admin/questions">
                      Manage Questions
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Quizzes</span>
                  <span className="stat-value">{quizzes.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Questions</span>
                  <span className="stat-value">{questions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}