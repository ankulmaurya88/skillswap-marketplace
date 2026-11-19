import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getDashboardSummary } from "../services/dashboardService";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await getDashboardSummary();

        if (active) {
          setDashboard(data);
        }
      } catch {
        if (active) {
          setError("Unable to load dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!dashboard) {
    return <p>Dashboard unavailable.</p>;
  }

  const stats = [
    {
      label: "Skills I Teach",
      value: dashboard.skills.offered,
    },
    {
      label: "Skills I Want to Learn",
      value: dashboard.skills.learning,
    },
    {
      label: "Pending Received",
      value: dashboard.exchanges.pending_received,
    },
    {
      label: "Pending Sent",
      value: dashboard.exchanges.pending_sent,
    },
    {
      label: "Accepted Exchanges",
      value: dashboard.exchanges.accepted,
    },
  ];

  return (
    <main className="container py-4">
      <header className="d-flex justify-content-between
        align-items-center mb-4">
        <div>
          <h1>SkillSwap Dashboard</h1>
          <p>Welcome back, {user.username}!</p>
        </div>

        <button
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <section aria-label="Marketplace summary">
        <div className="row g-3">
          {stats.map((stat) => (
            <div className="col-md-4" key={stat.label}>
              <div className="card p-3 h-100">
                <p className="text-muted mb-2">
                  {stat.label}
                </p>
                <h2>{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>
      </section>

      <nav className="d-flex flex-wrap gap-2 my-4">
        <Link to="/profile" className="btn btn-primary">
          My Profile
        </Link>

        <Link to="/skills" className="btn btn-primary">
          My Skills
        </Link>

        <Link to="/discover" className="btn btn-primary">
          Discover Skills
        </Link>

        <Link to="/exchanges" className="btn btn-primary">
          Exchange Requests
        </Link>
      </nav>

      <section>
        <div className="d-flex justify-content-between
          align-items-center mb-3">
          <h2>Recent Exchange Activity</h2>

          <Link to="/exchanges">
            View All
          </Link>
        </div>

        {dashboard.recent_activity.length === 0 ? (
          <p>
            No exchanges yet. Discover a skill to get started.
          </p>
        ) : (
          <div className="list-group">
            {dashboard.recent_activity.map((item) => {
              const isSender = item.sender_id === user.id;

              const partner = isSender
                ? item.receiver_name
                : item.sender_name;

              return (
                <div
                  className="list-group-item"
                  key={item.id}
                >
                  <div className="d-flex
                    justify-content-between">
                    <h3 className="h6">
                      {partner}
                    </h3>
                    <span className="badge bg-secondary">
                      {item.status}
                    </span>
                  </div>

                  <p className="mb-1">
                    {item.offered_skill_name}
                    {" ↔ "}
                    {item.requested_skill_name}
                  </p>

                  <small className="text-muted">
                    {isSender ? "Sent request" : "Received request"}
                    {" · "}
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </small>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
















// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";


// export default function Dashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error("Server logout failed:", error);
//     } finally {
//       navigate("/login", { replace: true });
//     }
//   };

//   return (
//     <main>
//       <h1>SkillSwap Dashboard</h1>

//       <h2>Welcome, {user.username}!</h2>
//       <p>Email: {user.email}</p>
// <hr />
//        {/* Navigate to Profile page */}
//       <Link to="/profile" className="btn btn-primary me-2">
//         My Profile
//       </Link>
//         <hr />
//         <Link to="/skills" className="btn btn-primary">
//         Manage My Skills
//         </Link>
//     <hr />
//         <Link to="/discover" className="btn btn-primary">
//         Discover Skills
//         </Link>
// <hr />
//         <Link to="/exchanges" className="btn btn-primary">
//         My Exchange Requests
//         </Link>
//         <hr />

//       <button onClick={handleLogout}>
//         Logout
//       </button>
//     </main>
//   );
// }


