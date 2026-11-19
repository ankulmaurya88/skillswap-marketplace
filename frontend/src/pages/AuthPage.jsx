import { useState } from "react";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "register") {
        await registerUser(form);
        setMessage("Registered! Please log in.");
        setMode("login");
      } else {
        await loginUser({
          username: form.username,
          password: form.password,
        });

        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setForm((prev) => ({
          ...prev,
          password: "",
          password_confirm: "",
        }));
      }
    } catch (error) {
      if (mode === "login") logoutUser();

      const data = error.response?.data;
      setMessage(
        typeof data?.detail === "string"
          ? data.detail
          : data
            ? JSON.stringify(data)
            : "Request failed. Check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setMessage("Logged out locally.");
  };

  if (user) {
    return (
      <main>
        <h1>Welcome, {user.username}!</h1>
        <p>Email: {user.email}</p>
        <button onClick={handleLogout}>
          Logout
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 400, margin: "60px auto" }}>
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
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {mode === "register" && (
          <input
            type="password"
            name="password_confirm"
            placeholder="Confirm password"
            value={form.password_confirm}
            onChange={handleChange}
            required
          />
        )}

        <button disabled={loading} type="submit">
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