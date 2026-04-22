import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCurrentQuiz, createQuiz, fetchQuizById, selectCurrentQuiz, updateQuiz } from "../features/quizzes/quizzesSlice.js";

export default function QuizFormPage({ mode }) {
  const isEdit = mode === "edit";
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentQuiz = useSelector(selectCurrentQuiz);
  const quizStatus = useSelector((state) => state.quizzes.currentStatus);
  const quizError = useSelector((state) => state.quizzes.error);
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    dispatch(clearCurrentQuiz());
    if (isEdit) {
      dispatch(fetchQuizById(quizId));
    }
  }, [dispatch, isEdit, quizId]);

  useEffect(() => {
    if (isEdit && currentQuiz) {
      setForm({
        title: currentQuiz.title || "",
        description: currentQuiz.description || "",
      });
    }
  }, [currentQuiz, isEdit]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!form.title.trim()) {
      setLocalError("Quiz title is required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
    };

    try {
      if (isEdit) {
        await dispatch(updateQuiz({ quizId, payload })).unwrap();
      } else {
        await dispatch(createQuiz(payload)).unwrap();
      }

      navigate("/admin/quizzes", { replace: true });
    } catch (error) {
      setLocalError(error);
    }
  }

  return (
    <section className="mx-auto" style={{ maxWidth: 820 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="eyebrow">Admin </span>
          <h1 className="display-6 fw-bold mb-0">{isEdit ? "Edit Quiz" : "Create Quiz"}</h1>
        </div>
        <Link className="btn btn-outline-primary" to="/admin/quizzes">
          Back
        </Link>
      </div>

      {(localError || quizError) ? (
        <div className="alert alert-danger">{localError || quizError}</div>
      ) : null}

      {isEdit && quizStatus === "loading" ? <div className="alert alert-info">Loading quiz...</div> : null}

      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-lg-5">
          <form className="vstack gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Quiz title</label>
              <input
                className="form-control form-control-lg"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link className="btn btn-outline-secondary" to="/admin/quizzes">
                Cancel
              </Link>
              <button className="btn btn-primary">{isEdit ? "Update quiz" : "Create quiz"}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}