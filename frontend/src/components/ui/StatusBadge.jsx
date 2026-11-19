export default function StatusBadge({ status }) {
  const allowed = [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "CANCELLED",
  ];

  const value = allowed.includes(status)
    ? status
    : "UNKNOWN";

  return (
    <span className={`status-badge status-${value.toLowerCase()}`}>
      {value}
    </span>
  );
}