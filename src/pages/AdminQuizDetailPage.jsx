import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCurrentQuiz, fetchQuizById, selectCurrentQuiz } from "../features/quizzes/quizzesSlice.js";

export default function AdminQuizDetailPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const quiz = useSelector(selectCurrentQuiz);
  const status = useSelector((state) => state.quizzes.currentStatus);
  const error = useSelector((state) => state.quizzes.error);

  useEffect(() => {
    dispatch(clearCurrentQuiz());
    dispatch(fetchQuizById(quizId));
  }, [dispatch, quizId]);

  return (
    <section className="mx-auto" style={{ maxWidth: 1000 }}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <span className="eyebrow">Admin detail</span>
          <h1 className="display-6 fw-bold mb-0">Quiz Detail</h1>
          <p className="text-secondary mb-0">View quiz info and all related questions.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/admin/quizzes">
            Back
          </Link>
          <Link className="btn btn-primary" to={`/admin/quizzes/${quizId}/edit`}>
            Edit quiz
          </Link>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {status === "loading" ? <div className="alert alert-info">Loading quiz detail...</div> : null}

      {quiz ? (
        <div className="vstack gap-3">
          <article className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="h4 mb-2">{quiz.title}</h2>
              <p className="text-secondary mb-2">{quiz.description || "No description"}</p>
              <div className="small text-secondary">Questions: {quiz.questions?.length || 0}</div>
            </div>
          </article>

          {(quiz.questions || []).map((question, index) => (
            <article key={question._id || `${index}`} className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div>
                    <div className="small text-secondary mb-1">Question {index + 1}</div>
                    <h3 className="h5 mb-2">{question.text}</h3>
                    <div className="small text-secondary mb-1">
                      Correct option: {Number(question.correctAnswerIndex) + 1}
                    </div>
                    <div className="small text-secondary">
                      Keywords: {question.keywords?.length ? question.keywords.join(", ") : "None"}
                    </div>
                  </div>
                  <Link className="btn btn-outline-primary btn-sm" to={`/admin/questions/${question._id}`}>
                    View question detail
                  </Link>
                </div>

                <div className="mt-3 vstack gap-2">
                  {(question.options || []).map((option, optionIndex) => (
                    <div key={`${question._id}-${optionIndex}`} className="small">
                      {optionIndex + 1}. {option}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}

          {quiz.questions?.length === 0 ? (
            <div className="alert alert-secondary mb-0">This quiz has no questions yet.</div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
