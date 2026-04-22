import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, getApiErrorMessage } from "../../api/client.js";

function unwrapQuestionList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.value)) {
    return payload.value;
  }

  return [];
}

export const fetchQuestions = createAsyncThunk(
  "questions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/question");
      return unwrapQuestionList(response.data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to fetch questions"));
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  "questions/fetchById",
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/question/${questionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to fetch question"));
    }
  }
);

export const createQuestion = createAsyncThunk(
  "questions/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/question", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to create question"));
    }
  }
);

export const createManyQuestions = createAsyncThunk(
  "questions/createMany",
  async ({ quizId, questions }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/questions`, { questions });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to create questions"));
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "questions/update",
  async ({ questionId, payload }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/question/${questionId}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to update question"));
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/delete",
  async (questionId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/question/${questionId}`);
      return questionId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to delete question"));
    }
  }
);

const questionsSlice = createSlice({
  name: "questions",
  initialState: {
    items: [],
    current: null,
    status: "idle",
    currentStatus: "idle",
    error: null,
  },
  reducers: {
    clearCurrentQuestion(state) {
      state.current = null;
      state.currentStatus = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.currentStatus = "loading";
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createManyQuestions.fulfilled, (state, action) => {
        state.items = [...action.payload, ...state.items];
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.items = state.items.map((question) =>
          String(question._id) === String(action.payload._id) ? action.payload : question
        );
        state.current = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((question) => String(question._id) !== String(action.payload));
        if (state.current && String(state.current._id) === String(action.payload)) {
          state.current = null;
        }
      });
  },
});

export const { clearCurrentQuestion } = questionsSlice.actions;
export default questionsSlice.reducer;

export const selectQuestions = (state) => state.questions.items;
export const selectCurrentQuestion = (state) => state.questions.current;