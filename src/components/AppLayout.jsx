import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuthUser, selectIsAdmin } from "../features/auth/authSlice.js";

export default function AppLayout() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container-fluid px-4">
          <NavLink className="navbar-brand fw-bold" to="/dashboard">
            Quiz Master
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#appNavbar"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="appNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-2">
              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard">
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/quizzes">
                  Quizzes
                </NavLink>
              </li>
              {isAdmin ? (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/quizzes">
                      Manage Quizzes
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/questions">
                      Manage Questions
                    </NavLink>
                  </li>
                </>
              ) : null}
            </ul>
            <div className="d-flex align-items-center gap-3">
              <span className="text-white-50 small">
                {user?.username ? `Welcome, ${user.username}` : "Welcome"}
                {isAdmin ? " · Admin" : ""}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={() => dispatch(logout())}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-lg-5">
        <Outlet />
      </main>
    </div>
  );
}