import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, STORAGE_KEY, getApiErrorMessage } from "../../api/client.js";

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { user: null, token: null };
    }

    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
    };
  } catch (error) {
    return { user: null, token: null };
  }
}

function persistAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const isAdmin =
    user.admin === true ||
    (typeof user.admin === "string" && user.admin.toLowerCase() === "true") ||
    user.username === "admin";

  return {
    ...user,
    admin: isAdmin,
  };
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to login"));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/register", credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Unable to register"));
    }
  }
);

const storedAuth = readStoredAuth();

const initialState = {
  user: normalizeUser(storedAuth.user),
  token: storedAuth.token,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired(state, action) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error =
        action.payload || "403 Forbidden: Session token is invalid for this tab. Please login again.";
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      clearAuth();
    },
    hydrateAuth(state) {
      const nextAuth = readStoredAuth();
      state.user = normalizeUser(nextAuth.user);
      state.token = nextAuth.token;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = normalizeUser(action.payload.user);
        state.token = action.payload.token;
        persistAuth({ ...action.payload, user: normalizeUser(action.payload.user) });
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { sessionExpired, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectIsAdmin = (state) => Boolean(state.auth.user?.admin);