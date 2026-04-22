import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, selectAuthUser, selectIsAuthenticated } from "../features/auth/authSlice.js";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const successMessage = location.state?.message || "";
  const [form, setForm] = useState({ username: "", password: "" });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.admin ? "/admin/quizzes" : "/quizzes", { replace: true });
    }
  }, [isAuthenticated, navigate, user?.admin]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!form.username.trim() || !form.password.trim()) {
      setLocalError("Username and password are required.");
      return;
    }

    try {
      const loginResult = await dispatch(login(form)).unwrap();
      const requestedPath = location.state?.from?.pathname;
      const isAdminUser =
        loginResult?.user?.admin === true ||
        (typeof loginResult?.user?.admin === "string" &&
          loginResult.user.admin.toLowerCase() === "true") ||
        loginResult?.user?.username === "admin";

      let redirectTo;
      if (isAdminUser) {
        redirectTo = requestedPath && requestedPath.startsWith("/admin")
          ? requestedPath
          : "/admin/quizzes";
      } else {
        redirectTo = requestedPath || "/quizzes";
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setLocalError(error);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="brand-pill mb-3">Quiz Master</div>
            <h1 className="h3 fw-bold mb-1">Login</h1>
            <p className="text-secondary mb-0">Sign in to start or manage quizzes.</p>
          </div>

          {successMessage ? (
            <div className="alert alert-success py-2">{successMessage}</div>
          ) : null}

          {(localError || authError) ? (
            <div className="alert alert-danger py-2">{localError || authError}</div>
          ) : null}

          <form onSubmit={handleSubmit} className="vstack gap-3">
            <div>
              <label className="form-label">Username</label>
              <input
                className="form-control form-control-lg"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <button className="btn btn-primary btn-lg w-100" disabled={authStatus === "loading"}>
              {authStatus === "loading" ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-secondary">Don&apos;t have an account? </span>
            <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}