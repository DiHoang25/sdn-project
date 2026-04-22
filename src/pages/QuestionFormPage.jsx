import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCurrentQuestion,
  createManyQuestions,
  createQuestion,
  fetchQuestionById,
  selectCurrentQuestion,
  updateQuestion,
} from "../features/questions/questionsSlice.js";
import { fetchQuizzes } from "../features/quizzes/quizzesSlice.js";

function textToList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) {
    return ["", ""];
  }

  const normalized = options.map((item) => String(item ?? ""));
  return normalized.length > 0 ? normalized : ["", ""];
}

function clampCorrectAnswerIndex(index, optionsLength) {
  const parsedIndex = Number(index);
  if (!Number.isInteger(parsedIndex) || parsedIndex < 0) {
    return "0";
  }

  if (parsedIndex >= optionsLength) {
    return String(Math.max(0, optionsLength - 1));
  }

  return String(parsedIndex);
}

function createBulkQuestionItem() {
  return {
    text: "",
    options: ["", ""],
    keywordsText: "",
    correctAnswerIndex: "0",
  };
}

export default function QuestionFormPage({ mode }) {
  const isEdit = mode === "edit";
  const { questionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const quizzes = useSelector((state) => state.quizzes.items);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const questionsStatus = useSelector((state) => state.questions.currentStatus);
  const questionError = useSelector((state) => state.questions.error);
  const [form, setForm] = useState({
    text: "",
    options: ["", ""],
    keywordsText: "",
    correctAnswerIndex: "0",
    quizId: "",
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState([createBulkQuestionItem()]);
  const [bulkQuizId, setBulkQuizId] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    dispatch(clearCurrentQuestion());
    dispatch(fetchQuizzes());
    if (isEdit) {
      dispatch(fetchQuestionById(questionId));
    }
  }, [dispatch, isEdit, questionId]);

  useEffect(() => {
    if (isEdit && currentQuestion) {
      setForm({
        text: currentQuestion.text || "",
        options: normalizeOptions(currentQuestion.options),
        keywordsText: Array.isArray(currentQuestion.keywords) ? currentQuestion.keywords.join(", ") : "",
        correctAnswerIndex: String(currentQuestion.correctAnswerIndex ?? 0),
        quizId: String(currentQuestion.quizId || ""),
      });
    }
  }, [currentQuestion, isEdit]);

  useEffect(() => {
    const nextCorrectAnswerIndex = clampCorrectAnswerIndex(form.correctAnswerIndex, form.options.length);
    if (nextCorrectAnswerIndex !== form.correctAnswerIndex) {
      setForm((current) => ({ ...current, correctAnswerIndex: nextCorrectAnswerIndex }));
    }
  }, [form.correctAnswerIndex, form.options.length]);

  const title = useMemo(() => (isEdit ? "Edit Question" : "Create Question"), [isEdit]);

  function updateFormOption(optionIndex, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, index) => (index === optionIndex ? value : option)),
    }));
  }

  function addFormOption() {
    setForm((current) => {
      if (current.options.length >= 5) {
        return current;
      }

      return {
        ...current,
        options: [...current.options, ""],
      };
    });
  }

  function removeFormOption(optionIndex) {
    setForm((current) => {
      if (current.options.length <= 1) {
        return current;
      }

      const nextOptions = current.options.filter((_, index) => index !== optionIndex);
      return {
        ...current,
        options: nextOptions,
        correctAnswerIndex: clampCorrectAnswerIndex(current.correctAnswerIndex, nextOptions.length),
      };
    });
  }

  function updateBulkQuestion(index, field, value) {
    setBulkQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      )
    );
  }

  function addBulkQuestion() {
    setBulkQuestions((current) => [...current, createBulkQuestionItem()]);
  }

  function removeBulkQuestion(index) {
    setBulkQuestions((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, questionIndex) => questionIndex !== index);
    });
  }

  function updateBulkQuestionOption(questionIndex, optionIndex, value) {
    setBulkQuestions((current) =>
      current.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? value : option
          ),
        };
      })
    );
  }

  function addBulkQuestionOption(questionIndex) {
    setBulkQuestions((current) =>
      current.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex || question.options.length >= 5) {
          return question;
        }

        return {
          ...question,
          options: [...question.options, ""],
        };
      })
    );
  }

  function removeBulkQuestionOption(questionIndex, optionIndex) {
    setBulkQuestions((current) =>
      current.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex || question.options.length <= 1) {
          return question;
        }

        const nextOptions = question.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex);
        return {
          ...question,
          options: nextOptions,
          correctAnswerIndex: clampCorrectAnswerIndex(question.correctAnswerIndex, nextOptions.length),
        };
      })
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!isEdit && bulkMode) {
      if (!bulkQuizId) {
        setLocalError("Please choose a quiz for bulk creation.");
        return;
      }

      const payloadQuestions = [];

      for (let index = 0; index < bulkQuestions.length; index += 1) {
        const item = bulkQuestions[index];
        const options = item.options.map((option) => option.trim());
        const keywords = textToList(item.keywordsText);
        const correctAnswerIndex = Number(item.correctAnswerIndex);

        if (!item.text.trim()) {
          setLocalError(`Question #${index + 1}: text is required.`);
          return;
        }

        if (options.length < 1 || options.length > 5) {
          setLocalError(`Question #${index + 1}: options must contain between 1 and 5 items.`);
          return;
        }

        if (options.some((option) => !option)) {
          setLocalError(`Question #${index + 1}: every option must be filled.`);
          return;
        }

        if (
          !Number.isInteger(correctAnswerIndex) ||
          correctAnswerIndex < 0 ||
          correctAnswerIndex >= options.length
        ) {
          setLocalError(`Question #${index + 1}: correct answer index is invalid.`);
          return;
        }

        payloadQuestions.push({
          text: item.text.trim(),
          options,
          keywords,
          correctAnswerIndex,
        });
      }

      try {
        await dispatch(createManyQuestions({ quizId: bulkQuizId, questions: payloadQuestions })).unwrap();
        navigate("/admin/questions", { replace: true });
      } catch (error) {
        setLocalError(error);
      }

      return;
    }

    const options = form.options.map((option) => option.trim());
    const keywords = textToList(form.keywordsText);
    const correctAnswerIndex = Number(form.correctAnswerIndex);

    if (!form.text.trim()) {
      setLocalError("Question text is required.");
      return;
    }

    if (options.length < 1 || options.length > 5) {
      setLocalError("Options must contain between 1 and 5 items.");
      return;
    }

    if (options.some((option) => !option)) {
      setLocalError("Every option must be filled.");
      return;
    }

    if (!form.quizId) {
      setLocalError("Please choose a quiz.");
      return;
    }

    if (!Number.isInteger(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      setLocalError("Correct answer index must match one of the option positions.");
      return;
    }

    const payload = {
      text: form.text.trim(),
      options,
      keywords,
      correctAnswerIndex,
      quizId: form.quizId,
    };

    try {
      if (isEdit) {
        await dispatch(updateQuestion({ questionId, payload })).unwrap();
      } else {
        await dispatch(createQuestion(payload)).unwrap();
      }

      navigate("/admin/questions", { replace: true });
    } catch (error) {
      setLocalError(error);
    }
  }

  return (
    <section className="mx-auto" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 className="display-6 fw-bold mb-0">{title}</h1>
        </div>
        <Link className="btn btn-outline-primary" to="/admin/questions">
          Back
        </Link>
      </div>

      {(localError || questionError) ? (
        <div className="alert alert-danger">{localError || questionError}</div>
      ) : null}

      {isEdit && questionsStatus === "loading" ? <div className="alert alert-info">Loading question...</div> : null}

      {!isEdit ? (
        <div className="d-flex gap-2 mb-3">
          <button
            type="button"
            className={`btn ${!bulkMode ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setBulkMode(false)}
          >
            Single question
          </button>
          <button
            type="button"
            className={`btn ${bulkMode ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setBulkMode(true)}
          >
            Bulk create
          </button>
        </div>
      ) : null}

      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-lg-5">
          <form className="vstack gap-3" onSubmit={handleSubmit}>
            {!isEdit && bulkMode ? (
              <>
                <div>
                  <label className="form-label">Quiz</label>
                  <select
                    className="form-select"
                    value={bulkQuizId}
                    onChange={(event) => setBulkQuizId(event.target.value)}
                  >
                    <option value="">Choose a quiz</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz._id} value={quiz._id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vstack gap-3">
                  {bulkQuestions.map((item, index) => {
                    const bulkOptions = item.options;

                    return (
                      <article key={`bulk-question-${index}`} className="border rounded p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h2 className="h6 mb-0">Question #{index + 1}</h2>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={bulkQuestions.length === 1}
                            onClick={() => removeBulkQuestion(index)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="vstack gap-3">
                          <div>
                            <label className="form-label">Question text</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={item.text}
                              onChange={(event) => updateBulkQuestion(index, "text", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="form-label">Options</label>
                            <div className="vstack gap-2">
                              {bulkOptions.map((option, optionIndex) => (
                                <div key={`bulk-option-${index}-${optionIndex}`} className="d-flex gap-2 align-items-center">
                                  <input
                                    type="radio"
                                    name={`bulk-correct-answer-${index}`}
                                    checked={Number(item.correctAnswerIndex) === optionIndex}
                                    onChange={() =>
                                      updateBulkQuestion(index, "correctAnswerIndex", String(optionIndex))
                                    }
                                  />
                                  <input
                                    className="form-control"
                                    value={option}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    onChange={(event) =>
                                      updateBulkQuestionOption(index, optionIndex, event.target.value)
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    disabled={bulkOptions.length <= 1}
                                    onClick={() => removeBulkQuestionOption(index, optionIndex)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}

                              <div>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  disabled={bulkOptions.length >= 5}
                                  onClick={() => addBulkQuestionOption(index)}
                                >
                                  Add option
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="form-label">Correct answer</label>
                            <div className="form-text"></div>
                          </div>

                          <div>
                            <label className="form-label">Keywords</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={item.keywordsText}
                              onChange={(event) => updateBulkQuestion(index, "keywordsText", event.target.value)}
                              placeholder="Separate keywords with commas"
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div>
                  <button type="button" className="btn btn-outline-primary" onClick={addBulkQuestion}>
                    Add another question
                  </button>
                </div>
              </>
            ) : (
              <>
            <div>
              <label className="form-label">Question text</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.text}
                onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
              />
            </div>

            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">Options</label>
                <div className="vstack gap-2">
                  {form.options.map((option, index) => (
                    <div key={`single-option-${index}`} className="d-flex gap-2 align-items-center">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={Number(form.correctAnswerIndex) === index}
                        onChange={() =>
                          setForm((current) => ({ ...current, correctAnswerIndex: String(index) }))
                        }
                      />
                      <input
                        className="form-control"
                        value={option}
                        placeholder={`Option ${index + 1}`}
                        onChange={(event) => updateFormOption(index, event.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={form.options.length <= 1}
                        onClick={() => removeFormOption(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      disabled={form.options.length >= 5}
                      onClick={addFormOption}
                    >
                      Add option
                    </button>
                  </div>
                </div>
              </div>
              
            </div>

            <div>
              <label className="form-label">Keywords</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.keywordsText}
                onChange={(event) => setForm((current) => ({ ...current, keywordsText: event.target.value }))}
                placeholder="Separate keywords with commas"
              />
            </div>

            <div>
              <label className="form-label">Quiz</label>
              <select
                className="form-select"
                value={form.quizId}
                onChange={(event) => setForm((current) => ({ ...current, quizId: event.target.value }))}
              >
                <option value="">Choose a quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
              </>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Link className="btn btn-outline-secondary" to="/admin/questions">
                Cancel
              </Link>
              <button className="btn btn-primary">
                {isEdit ? "Update question" : bulkMode ? "Create questions" : "Create question"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}