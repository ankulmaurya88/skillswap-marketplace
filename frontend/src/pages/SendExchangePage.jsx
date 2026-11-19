import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMySkills } from "../services/skillService";
import { getPublicProfile } from "../services/profileService";
import {
  getUserOffers,
  createExchange,
} from "../services/exchangeService";

export default function SendExchangePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [receiver, setReceiver] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [theirOffers, setTheirOffers] = useState([]);

  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [profile, mine, theirs] = await Promise.all([
          getPublicProfile(userId),
          getMySkills(),
          getUserOffers(userId),
        ]);

        if (!active) return;

        const offered = mine.filter(
          (item) => item.skill_type === "OFFER"
        );

        setReceiver(profile);
        setMyOffers(offered);
        setTheirOffers(theirs);

        setOfferedSkill(
          offered.length ? String(offered[0].skill) : ""
        );
        setRequestedSkill(
          theirs.length ? String(theirs[0].skill) : ""
        );
      } catch {
        if (active) setError("Unable to load exchange options.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [userId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createExchange({
        receiver: Number(userId),
        offered_skill: Number(offeredSkill),
        requested_skill: Number(requestedSkill),
      });

      navigate("/exchanges", {
        replace: true,
        state: { message: "Exchange request sent." }
      });
    } catch (err) {
      const data = err.response?.data;
      setError(
        data ? JSON.stringify(data) : "Failed to send request."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading exchange options...</p>;
  if (!receiver) return <p role="alert">{error}</p>;

  return (
    <main className="container py-4">
      <Link to={`/users/${userId}`}>Back to profile</Link>

      <h1 className="mt-3">Request Skill Exchange</h1>
      <p>Send a request to {receiver.username}</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="offered" className="form-label">
          Skill you will teach
        </label>
        <select
          id="offered"
          className="form-select mb-3"
          value={offeredSkill}
          onChange={(e) => setOfferedSkill(e.target.value)}
          required
        >
          {myOffers.map((item) => (
            <option key={item.id} value={item.skill}>
              {item.skill_name}
            </option>
          ))}
        </select>

        <label htmlFor="requested" className="form-label">
          Skill you want to learn
        </label>
        <select
          id="requested"
          className="form-select mb-3"
          value={requestedSkill}
          onChange={(e) => setRequestedSkill(e.target.value)}
          required
        >
          {theirOffers.map((item) => (
            <option key={item.id} value={item.skill}>
              {item.skill_name}
            </option>
          ))}
        </select>

        {(!myOffers.length || !theirOffers.length) && (
          <p className="text-warning">
            Both users must offer at least one skill.
          </p>
        )}

        {error && <p role="alert" className="text-danger">{error}</p>}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={
            saving || !offeredSkill || !requestedSkill
          }
        >
          {saving ? "Sending..." : "Send Exchange Request"}
        </button>
      </form>
    </main>
  );
}