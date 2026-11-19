import { useEffect, useState } from "react";
import api from "./services/api";

export default function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    api.get("/health/")
      .then((response) => {
        setStatus(response.data.status);
      })
      .catch(() => {
        setStatus("Backend unavailable");
      });
  }, []);

  return (
    <main>
      <h1>SkillSwap Marketplace</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}