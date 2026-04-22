import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuestion, fetchQuestions } from "../features/questions/questionsSlice.js";
import { fetchQuizzes } from "../features/quizzes/quizzesSlice.js";

export default function QuestionsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const questions = useSelector((state) => state.questions.items);
  const status = useSelector((state) => state.questions.status);
  const error = useSelector((state) => state.questions.error);
  const quizzes = useSelector((state) => state.quizzes.items);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchQuestions());
    }
    if (quizzes.length === 0) {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, status, quizzes.length]);

  const quizTitleMap = new Map(quizzes.map((quiz) => [String(quiz._id), quiz.title]));

  async function handleDelete(questionId) {
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteQuestion(questionId)).unwrap();
      dispatch(fetchQuestions());
    } catch (deleteError) {
      window.alert(deleteError);
    }
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <span className="eyebrow">Admin </span>
          <h1 className="display-6 fw-bold mb-0">Manage Questions</h1>
          <p className="text-secondary mb-0">Create, edit, or delete questions for quizzes.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/questions/new">
          New question
        </Link>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="vstack gap-3">
        {questions.map((question) => (
          <article key={question._id} className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <h2 className="h5 mb-2">{question.text}</h2>
                  <div className="small text-secondary mb-1">
                    Quiz: {quizTitleMap.get(String(question.quizId)) || "Unknown quiz"}
                  </div>
                  <div className="small text-secondary">
                    Options: {question.options?.join(", ")}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/admin/questions/${question._id}`)}
                  >
                    View detail
                  </button>
                  <button className="btn btn-warning btn-sm" onClick={() => navigate(`/admin/questions/${question._id}/edit`)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(question._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {questions.length === 0 && status !== "loading" ? (
          <p className="text-secondary mb-0">No questions found.</p>
        ) : null}
      </div>
    </section>
  );
}