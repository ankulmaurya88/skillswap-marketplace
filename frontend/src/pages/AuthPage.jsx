import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";

export default function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        await registerUser(form);
        setMode("login");
        setMessage("Account created. Please log in.");
      } else {
        await login({
          username: form.username,
          password: form.password,
        });

        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      const data = error.response?.data;
      setMessage(
        typeof data?.detail === "string"
          ? data.detail
          : data
            ? JSON.stringify(data)
            : "Request failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "60px auto" }}>
      <h1>SkillSwap Marketplace</h1>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        {mode === "register" && (
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        )}

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {mode === "register" && (
          <input
            name="password_confirm"
            type="password"
            placeholder="Confirm password"
            value={form.password_confirm}
            onChange={handleChange}
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Processing..."
            : mode === "login"
              ? "Login"
              : "Register"}
        </button>
      </form>

      <p role="status">{message}</p>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setMessage("");
        }}
      >
        {mode === "login"
          ? "Create an account"
          : "Already have an account? Login"}
      </button>
    </main>
  );
}