import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, getApiErrorMessage } from "../../api/client.js";

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/quizzes");
      // Handle different response formats
      let data = response.data;
      
      // If response is wrapped in data object
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      // If response is object but not array
      else if (data && !Array.isArray(data)) {
        // Try to find array property
        const arrayProp = Object.values(data).find(v => Array.isArray(v));
        data = arrayProp || [];
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to fetch quizzes"));
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  "quizzes/fetchById",
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to fetch quiz"));
    }
  }
);

export const createQuiz = createAsyncThunk(
  "quizzes/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/quizzes", {
        quiz: payload,
      });
      return response.data.quiz;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to create quiz"));
    }
  }
);

export const updateQuiz = createAsyncThunk(
  "quizzes/update",
  async ({ quizId, payload }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/quizzes/${quizId}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to update quiz"));
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  "quizzes/delete",
  async (quizId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/quizzes/${quizId}`);
      return quizId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to delete quiz"));
    }
  }
);

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState: {
    items: [],
    current: null,
    status: "idle",
    currentStatus: "idle",
    error: null,
  },
  reducers: {
    clearCurrentQuiz(state) {
      state.current = null;
      state.currentStatus = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.currentStatus = "loading";
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.items = state.items.map((quiz) =>
          String(quiz._id) === String(action.payload._id) ? action.payload : quiz
        );
        if (state.current && String(state.current._id) === String(action.payload._id)) {
          state.current = action.payload;
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.items = state.items.filter((quiz) => String(quiz._id) !== String(action.payload));
        if (state.current && String(state.current._id) === String(action.payload)) {
          state.current = null;
        }
      });
  },
});

export const { clearCurrentQuiz } = quizzesSlice.actions;
export default quizzesSlice.reducer;

export const selectQuizzes = (state) => state.quizzes.items;
export const selectCurrentQuiz = (state) => state.quizzes.current;