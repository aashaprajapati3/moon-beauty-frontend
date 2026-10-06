
import { useState } from "react";
import axios from "axios";
import { LockKeyhole, Mail, ArrowRight } from "lucide-react";
import "./AdminLogin.css";
import API_BASE_URL from "./api";
const API = `${API_BASE_URL}/bookings/`;

function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
    const csrfResponse = await axios.get(`${API}admin/login/`, {
  withCredentials: true,
});

const csrfToken = csrfResponse.data.csrf_token;

if (!csrfToken) {
  throw new Error("CSRF token not received from server.");
}
      await axios.post(
        `${API}admin/login/`,
        { username, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      window.location.href = "/admin-dashboard";
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <LockKeyhole size={30} />
        </div>

        <p className="admin-login-brand">MOON BEAUTY</p>
        <h1>Admin Login</h1>
        <p className="admin-login-subtitle">
          Sign in to manage your bookings
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <div className="admin-input-wrap">
            <Mail size={19} />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="admin-input-wrap">
            <LockKeyhole size={19} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="admin-login-error">{error}</div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={19} />}
          </button>
        </form>

        <p className="admin-login-footer">
          Secure Moon Beauty administration
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
