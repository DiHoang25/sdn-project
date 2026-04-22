import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCurrentQuestion, fetchQuestionById, selectCurrentQuestion } from "../features/questions/questionsSlice.js";
import { fetchQuizzes } from "../features/quizzes/quizzesSlice.js";

export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const dispatch = useDispatch();
  const question = useSelector(selectCurrentQuestion);
  const questionStatus = useSelector((state) => state.questions.currentStatus);
  const questionError = useSelector((state) => state.questions.error);
  const quizzes = useSelector((state) => state.quizzes.items);

  useEffect(() => {
    dispatch(clearCurrentQuestion());
    dispatch(fetchQuestionById(questionId));
    if (quizzes.length === 0) {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, questionId, quizzes.length]);

  const quizTitle = useMemo(() => {
    if (!question?.quizId) {
      return "No quiz (standalone question)";
    }

    const found = quizzes.find((quiz) => String(quiz._id) === String(question.quizId));
    return found?.title || "Unknown quiz";
  }, [quizzes, question]);

  return (
    <section className="mx-auto" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <span className="eyebrow">Admin detail</span>
          <h1 className="display-6 fw-bold mb-0">Question Detail</h1>
          <p className="text-secondary mb-0">View full question content and quiz ownership.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/admin/questions">
            Back
          </Link>
          <Link className="btn btn-primary" to={`/admin/questions/${questionId}/edit`}>
            Edit question
          </Link>
        </div>
      </div>

      {questionError ? <div className="alert alert-danger">{questionError}</div> : null}
      {questionStatus === "loading" ? <div className="alert alert-info">Loading question detail...</div> : null}

      {question ? (
        <article className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="h4 mb-3">{question.text}</h2>

            <div className="small text-secondary mb-2">
              Belongs to quiz: {quizTitle}
            </div>
            <div className="small text-secondary mb-3">
              Correct option: {Number(question.correctAnswerIndex) + 1}
            </div>

            <div className="vstack gap-2 mb-3">
              {(question.options || []).map((option, index) => (
                <div
                  key={`${question._id}-${index}`}
                  className={`p-2 rounded ${index === Number(question.correctAnswerIndex) ? "bg-success-subtle" : "bg-light"}`}
                >
                  {index + 1}. {option}
                </div>
              ))}
            </div>

            <div className="small text-secondary">
              Keywords: {question.keywords?.length ? question.keywords.join(", ") : "None"}
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
