import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice.js";
import quizzesReducer from "./features/quizzes/quizzesSlice.js";
import questionsReducer from "./features/questions/questionsSlice.js";
import { setAuthToken, registerAuthFailureHandler } from "./api/client.js";
import { sessionExpired } from "./features/auth/authSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizzesReducer,
    questions: questionsReducer,
  },
});

let previousToken = store.getState().auth.token;
setAuthToken(previousToken);

registerAuthFailureHandler(({ status, message }) => {
  if (store.getState().auth.token) {
    const fallbackMessage =
      status === 403
        ? "403 Forbidden: Token is not valid for this tab. Please login again."
        : "401 Unauthorized: Session expired. Please login again.";
    store.dispatch(sessionExpired(message || fallbackMessage));
  }
});

store.subscribe(() => {
  const nextToken = store.getState().auth.token;
  if (nextToken !== previousToken) {
    previousToken = nextToken;
    setAuthToken(nextToken);
  }
});