import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCurrentQuiz, fetchQuizById, selectCurrentQuiz } from "../features/quizzes/quizzesSlice.js";

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const quiz = useSelector(selectCurrentQuiz);
  const currentStatus = useSelector((state) => state.quizzes.currentStatus);
  const error = useSelector((state) => state.quizzes.error);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    dispatch(clearCurrentQuiz());
    dispatch(fetchQuizById(quizId));
  }, [dispatch, quizId]);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);

  function handleSubmit(event) {
    event.preventDefault();

    const nextScore = questions.reduce((total, question) => {
      const selectedIndex = Number(answers[question._id]);
      return selectedIndex === Number(question.correctAnswerIndex) ? total + 1 : total;
    }, 0);

    setScore(nextScore);
    setSubmitted(true);
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <span className="eyebrow">Quiz session</span>
          <h1 className="display-6 fw-bold mb-0">{quiz?.title || "Quiz"}</h1>
          <p className="text-secondary mb-0">{quiz?.description || "Answer each question and submit your score."}</p>
        </div>
        <Link className="btn btn-outline-primary" to="/quizzes">
          Back to quizzes
        </Link>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {currentStatus === "loading" ? <div className="alert alert-info">Loading quiz...</div> : null}

      {quiz ? (
        <form className="vstack gap-4" onSubmit={handleSubmit}>
          {questions.map((question, index) => (
            <article key={question._id} className="card shadow-sm border-0 question-card">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <div className="text-uppercase text-secondary small fw-semibold">Question {index + 1}</div>
                    <h2 className="h4 mb-0">{question.text}</h2>
                  </div>
                  {submitted ? (
                    <span className={`badge ${Number(answers[question._id]) === Number(question.correctAnswerIndex) ? "text-bg-success" : "text-bg-danger"}`}>
                      {Number(answers[question._id]) === Number(question.correctAnswerIndex) ? "Correct" : "Wrong"}
                    </span>
                  ) : null}
                </div>

                <div className="vstack gap-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={`${question._id}-${optionIndex}`} className="option-item">
                      <input
                        type="radio"
                        name={question._id}
                        checked={Number(answers[question._id]) === optionIndex}
                        onChange={() => setAnswers((current) => ({ ...current, [question._id]: optionIndex }))}
                        disabled={submitted}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {submitted ? (
                  <div className="mt-3 small text-secondary">
                    Correct answer: <strong>{question.options[question.correctAnswerIndex]}</strong>
                  </div>
                ) : null}
              </div>
            </article>
          ))}

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {!submitted ? (
              <button className="btn btn-primary btn-lg px-4">Submit answers</button>
            ) : (
              <>
                <div className="score-pill">Score: {score} / {questions.length}</div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg px-4"
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                    setScore(0);
                  }}
                >
                  Try again
                </button>
              </>
            )}
          </div>
        </form>
      ) : null}
    </section>
  );
}