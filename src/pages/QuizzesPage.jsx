import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes } from "../features/quizzes/quizzesSlice.js";

export default function QuizzesPage() {
  const dispatch = useDispatch();
  const quizzes = useSelector((state) => state.quizzes.items);
  const status = useSelector((state) => state.quizzes.status);
  const error = useSelector((state) => state.quizzes.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, status]);

  return (
    <section>
      <div className="page-header mb-4">
        <div>
          <span className="eyebrow">Take a quiz</span>
          <h1 className="display-6 fw-bold mb-0">Quizzes</h1>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="col-md-6 col-xl-4">
            <div className="card quiz-card shadow-sm border-0 h-100">
              <div className="card-body p-4 d-flex flex-column">
                <h2 className="h4">{quiz.title}</h2>
                <p className="text-secondary flex-grow-1">{quiz.description || "No description"}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="badge text-bg-light">{quiz.questions?.length || 0} questions</span>
                  <Link className="btn btn-primary btn-sm" to={`/quizzes/${quiz._id}`}>
                    Open quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && status !== "loading" ? (
        <p className="text-secondary mt-4">No quizzes available.</p>
      ) : null}
    </section>
  );
}