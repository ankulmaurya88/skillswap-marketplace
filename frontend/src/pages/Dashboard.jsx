import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <main>
      <h1>SkillSwap Dashboard</h1>

      <h2>Welcome, {user.username}!</h2>
      <p>Email: {user.email}</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}