// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import StatusBadge from "../components/ui/StatusBadge";

// import {
//   getExchanges,
//   changeExchangeStatus,
// } from "../services/exchangeService";

// export default function ExchangesPage() {
//   const location = useLocation();

//   const [direction, setDirection] = useState("received");
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState(null);
//   const [message, setMessage] = useState(
//     location.state?.message || ""
//   );
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let active = true;

//     setLoading(true);
//     setError("");

//     getExchanges(direction)
//       .then((data) => {
//         if (active) setItems(data);
//       })
//       .catch(() => {
//         if (active) setError("Unable to load requests.");
//       })
//       .finally(() => {
//         if (active) setLoading(false);
//       });

//     return () => { active = false; };
//   }, [direction]);

//   async function updateStatus(id, newStatus) {
//     setBusyId(id);
//     setError("");
//     setMessage("");

//     try {
//       const updated = await changeExchangeStatus(
//         id, newStatus
//       );

//       setItems((previous) =>
//         previous.map((item) =>
//           item.id === id ? updated : item
//         )
//       );

//       setMessage(`Request ${newStatus.toLowerCase()}.`);
//     } catch (err) {
//       setError(
//         err.response?.data?.detail ||
//         "Unable to update request."
//       );
//     } finally {
//       setBusyId(null);
//     }
//   }

//   function renderActions(item) {
//     if (item.status !== "PENDING") return null;

//     if (direction === "sent") {
//       return (
//         <button
//           className="btn btn-outline-danger btn-sm"
//           disabled={busyId === item.id}
//           onClick={() => updateStatus(item.id, "CANCELLED")}
//         >
//           Cancel
//         </button>
//       );
//     }

//     return (
//       <div className="d-flex gap-2">
//         <button
//           className="btn btn-success btn-sm"
//           disabled={busyId === item.id}
//           onClick={() => updateStatus(item.id, "ACCEPTED")}
//         >
//           Accept
//         </button>

//         <button
//           className="btn btn-outline-danger btn-sm"
//           disabled={busyId === item.id}
//           onClick={() => updateStatus(item.id, "REJECTED")}
//         >
//           Reject
//         </button>
//       </div>
//     );
//   }

//   return (
//     <main className="container py-4">
//       <h1>My Exchange Requests</h1>

//       <div className="d-flex gap-2 mb-4">
//         <button
//           className="btn btn-outline-primary"
//           onClick={() => setDirection("received")}
//           disabled={direction === "received"}
//         >
//           Received
//         </button>
//         <button
//           className="btn btn-outline-primary"
//           onClick={() => setDirection("sent")}
//           disabled={direction === "sent"}
//         >
//           Sent
//         </button>
//       </div>

//       {message && <p role="status">{message}</p>}
//       {error && <p role="alert">{error}</p>}
//       {loading && <p>Loading requests...</p>}

//       {!loading && !items.length && !error && (
//         <p>No exchange requests yet.</p>
//       )}

//       {!loading && items.map((item) => (
//         <div className="card p-3 mb-3" key={item.id}>
//           <h2 className="h5">
//             {direction === "sent"
//               ? item.receiver_name
//               : item.sender_name}
//           </h2>

//           <p>
//             Offering: {item.offered_skill_name}
//           </p>
//           <p>
//             Requesting: {item.requested_skill_name}
//           </p>

//           <p>
//             Status: <strong>{item.status}</strong>
//           </p>

//           {renderActions(item)}
//         </div>
//       ))}
//     </main>
//   );
// }




import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";

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
        if (active) {
          setItems(
            Array.isArray(data) ? data : data.results ?? []
          );
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load exchange requests.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [direction]);

  async function updateStatus(id, newStatus) {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const updated = await changeExchangeStatus(
        id,
        newStatus
      );

      setItems((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, ...updated }
            : item
        )
      );

      setMessage(
        `Request ${newStatus.toLowerCase()}.`
      );
    } catch (err) {
      const responseData = err.response?.data;

      setError(
        typeof responseData?.detail === "string"
          ? responseData.detail
          : "Unable to update exchange request."
      );
    } finally {
      setBusyId(null);
    }
  }

  function renderActions(item) {
    if (item.status !== "PENDING") {
      return null;
    }

    if (direction === "sent") {
      return (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          disabled={busyId !== null}
          onClick={() =>
            updateStatus(item.id, "CANCELLED")
          }
        >
          {busyId === item.id
            ? "Cancelling..."
            : "Cancel Request"}
        </button>
      );
    }

    return (
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-success btn-sm"
          disabled={busyId !== null}
          onClick={() =>
            updateStatus(item.id, "ACCEPTED")
          }
        >
          {busyId === item.id
            ? "Updating..."
            : "Accept"}
        </button>

        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          disabled={busyId !== null}
          onClick={() =>
            updateStatus(item.id, "REJECTED")
          }
        >
          Reject
        </button>
      </div>
    );
  }

  return (
    <main className="container py-4">
      <h1 className="mb-4">
        My Exchange Requests
      </h1>

      {/* Received and Sent tabs */}
      <div className="d-flex gap-2 mb-4">
        <button
          type="button"
          className={`btn ${
            direction === "received"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() =>
            setDirection("received")
          }
          disabled={direction === "received"}
        >
          Received
        </button>

        <button
          type="button"
          className={`btn ${
            direction === "sent"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() =>
            setDirection("sent")
          }
          disabled={direction === "sent"}
        >
          Sent
        </button>
      </div>

      {/* Success and error messages */}
      {message && (
        <div
          className="alert alert-success"
          role="status"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <p>Loading exchange requests...</p>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="alert alert-info">
          No {direction} exchange requests yet.
        </div>
      )}

      {/* Exchange cards */}
      {!loading &&
        items.map((item) => (
          <div
            className="marketplace-card mb-3"
            key={item.id}
          >
            <h2 className="h5 mb-3">
              {direction === "sent"
                ? item.receiver_name
                : item.sender_name}
            </h2>

            <p className="mb-2">
              <strong>Skill Exchange:</strong>
            </p>

            <p className="mb-3">
              {item.offered_skill_name}
              {" ↔ "}
              {item.requested_skill_name}
            </p>

            <StatusBadge status={item.status} />

            <div className="mt-3">
              {renderActions(item)}
            </div>
          </div>
        ))}
    </main>
  );
}
