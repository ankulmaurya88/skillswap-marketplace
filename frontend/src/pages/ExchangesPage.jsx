import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getExchanges,
  changeExchangeStatus,
} from "../services/exchangeService";

export default function ExchangesPage() {
  const location = useLocation();

  const [direction, setDirection] = useState("received");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(
    location.state?.message || ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getExchanges(direction)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setError("Unable to load requests.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [direction]);

  async function updateStatus(id, newStatus) {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const updated = await changeExchangeStatus(
        id, newStatus
      );

      setItems((previous) =>
        previous.map((item) =>
          item.id === id ? updated : item
        )
      );

      setMessage(`Request ${newStatus.toLowerCase()}.`);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to update request."
      );
    } finally {
      setBusyId(null);
    }
  }

  function renderActions(item) {
    if (item.status !== "PENDING") return null;

    if (direction === "sent") {
      return (
        <button
          className="btn btn-outline-danger btn-sm"
          disabled={busyId === item.id}
          onClick={() => updateStatus(item.id, "CANCELLED")}
        >
          Cancel
        </button>
      );
    }

    return (
      <div className="d-flex gap-2">
        <button
          className="btn btn-success btn-sm"
          disabled={busyId === item.id}
          onClick={() => updateStatus(item.id, "ACCEPTED")}
        >
          Accept
        </button>

        <button
          className="btn btn-outline-danger btn-sm"
          disabled={busyId === item.id}
          onClick={() => updateStatus(item.id, "REJECTED")}
        >
          Reject
        </button>
      </div>
    );
  }

  return (
    <main className="container py-4">
      <h1>My Exchange Requests</h1>

      <div className="d-flex gap-2 mb-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => setDirection("received")}
          disabled={direction === "received"}
        >
          Received
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setDirection("sent")}
          disabled={direction === "sent"}
        >
          Sent
        </button>
      </div>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading requests...</p>}

      {!loading && !items.length && !error && (
        <p>No exchange requests yet.</p>
      )}

      {!loading && items.map((item) => (
        <div className="card p-3 mb-3" key={item.id}>
          <h2 className="h5">
            {direction === "sent"
              ? item.receiver_name
              : item.sender_name}
          </h2>

          <p>
            Offering: {item.offered_skill_name}
          </p>
          <p>
            Requesting: {item.requested_skill_name}
          </p>

          <p>
            Status: <strong>{item.status}</strong>
          </p>

          {renderActions(item)}
        </div>
      ))}
    </main>
  );
}