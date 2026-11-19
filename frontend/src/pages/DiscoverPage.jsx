import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { discoverUsers } from "../services/discoveryService";
import PageHeader from "../components/ui/PageHeader";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const data = await discoverUsers({
          search,
          page,
        });

        if (!active) return;

        setUsers(data.results);
        setCount(data.count);
        setHasNext(Boolean(data.next));
      } catch {
        if (active) {
          setError("Unable to load teachers.");
          setUsers([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, [search, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  return (
    <main className="ss-page">

      {/* PAGE HEADER */}
      <PageHeader
        title="Discover Skills"
        description="Find people who can teach you new skills."
      />

      {/* SEARCH FORM */}
      <form
        onSubmit={handleSearch}
        className="d-flex gap-2 mb-4"
      >
        <input
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Python, React, Design..."
          aria-label="Search skills"
        />

        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {/* LOADING & ERROR */}
      {loading && <p>Searching...</p>}

      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}

      {/* SEARCH RESULTS */}
      {!loading && !error && (
        <>
          <p className="text-muted mb-3">
            {count} teachers found
          </p>

          {users.length === 0 ? (
            <div className="ss-panel ss-empty">
              <h3 className="h5">No teachers found</h3>
              <p>Try searching for another skill.</p>
            </div>
          ) : (
            <div className="teacher-grid">
              {users.map((user) => (
                <article
                  className="marketplace-card"
                  key={user.id}
                >
                  {/* TEACHER HEADER */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="teacher-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2 className="h5 mb-1">
                        {user.username}
                      </h2>

                      <p className="text-muted small mb-0">
                        {user.headline || "SkillSwap member"}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <p className="text-muted small">
                    {user.location || "Location not provided"}
                  </p>

                  {/* SKILLS */}
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {user.offered_skills.map((skill) => (
                      <span
                        className="skill-chip"
                        key={skill.id}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  {/* PROFILE LINK */}
                  <Link
                    className="btn btn-outline-primary w-100"
                    to={`/users/${user.id}`}
                  >
                    View Profile
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {users.length > 0 && (
            <div className="d-flex align-items-center gap-3 mt-4">
              <button
                className="btn btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>

              <span>Page {page}</span>

              <button
                className="btn btn-outline-secondary"
                disabled={!hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}