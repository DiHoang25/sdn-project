import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuiz, fetchQuizzes } from "../features/quizzes/quizzesSlice.js";

export default function AdminQuizzesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const quizzes = useSelector((state) => state.quizzes.items);
  const status = useSelector((state) => state.quizzes.status);
  const error = useSelector((state) => state.quizzes.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, status]);

  async function handleDelete(quizId) {
    const confirmed = window.confirm("Delete this quiz and its questions?");
    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteQuiz(quizId)).unwrap();
      dispatch(fetchQuizzes());
    } catch (deleteError) {
      window.alert(deleteError);
    }
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <span className="eyebrow">Admin </span>
          <h1 className="display-6 fw-bold mb-0">Manage Quizzes</h1>
          <p className="text-secondary mb-0">Create, edit, or delete quizzes.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/quizzes/new">
          New quiz
        </Link>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="vstack gap-3">
        {quizzes.map((quiz) => (
          <article key={quiz._id} className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <h2 className="h5 mb-2">{quiz.title}</h2>
                  <div className="small text-secondary">{quiz.description || "No description"}</div>
                  <div className="small text-secondary mt-1">
                    Questions: {quiz.questions?.length || 0}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                  >
                    View detail
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => navigate(`/admin/quizzes/${quiz._id}/edit`)}
                  >
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(quiz._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {quizzes.length === 0 && status !== "loading" ? (
          <p className="text-secondary mb-0">No quizzes found.</p>
        ) : null}
      </div>
    </section>
  );
}