import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/discover", label: "Discover" },
  { to: "/skills", label: "My Skills" },
  { to: "/exchanges", label: "Exchanges" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error("Server logout failed:", error);
    }
  };

  return (
    <header className="site-header">
      <nav className="navbar-container" aria-label="Main navigation">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-icon">S</span>
          <span>SkillSwap</span>
        </NavLink>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div
          id="primary-navigation"
          className={`nav-content ${menuOpen ? "open" : ""}`}
        >
          <div className="nav-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-user">
            <span className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </span>
            <span className="username">{user.username}</span>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}