import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, selectIsAuthenticated } from "../features/auth/authSlice.js";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const [form, setForm] = useState({ username: "", password: "", admin: false });
  const [localMessage, setLocalMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalMessage("");

    if (!form.username.trim() || !form.password.trim()) {
      setLocalMessage("Username and password are required.");
      return;
    }

    try {
      await dispatch(register({ ...form, admin: Boolean(form.admin) })).unwrap();
      navigate("/login", { replace: true, state: { message: "Account created successfully." } });
    } catch (error) {
      setLocalMessage(error);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="brand-pill mb-3">Quiz Master</div>
            <h1 className="h3 fw-bold mb-1">Register</h1>
            <p className="text-secondary mb-0">Create a user account to take quizzes.</p>
          </div>

          {(localMessage || authError) ? (
            <div className={`alert ${authError ? "alert-danger" : "alert-success"} py-2`}>
              {localMessage || authError}
            </div>
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
                autoComplete="new-password"
              />
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="adminCheckbox"
                checked={form.admin}
                onChange={(event) => setForm((current) => ({ ...current, admin: event.target.checked }))}
              />
              <label className="form-check-label" htmlFor="adminCheckbox">
                Register as admin
              </label>
            </div>
            <button className="btn btn-primary btn-lg w-100" disabled={authStatus === "loading"}>
              {authStatus === "loading" ? "Creating..." : "Register"}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-secondary">Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}