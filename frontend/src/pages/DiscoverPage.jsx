import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { discoverUsers } from "../services/discoveryService";

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
    <main className="container py-4">
      <h1>Discover Skills</h1>
      <p>Find people who can teach you new skills.</p>

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

      {loading && <p>Searching...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <p>{count} teachers found</p>

          {users.length === 0 && (
            <p>No teachers found. Try another skill.</p>
          )}

          <div className="row g-3">
            {users.map((user) => (
              <div className="col-md-6" key={user.id}>
                <div className="card h-100 p-3">
                  <h2 className="h5">{user.username}</h2>

                  <p>{user.headline || "SkillSwap member"}</p>

                  <p className="text-muted">
                    {user.location || "Location not provided"}
                  </p>

                  <div className="mb-3">
                    {user.offered_skills.map((skill) => (
                      <span
                        className="badge bg-secondary me-1"
                        key={skill.id}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/users/${user.id}`}
                    className="btn btn-outline-primary mt-auto"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn btn-outline-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            <span className="align-self-center">
              Page {page}
            </span>

            <button
              className="btn btn-outline-secondary"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}