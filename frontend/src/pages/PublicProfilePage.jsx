import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getPublicProfile,
} from "../services/discoveryService";

export default function PublicProfilePage() {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setProfile(null);

    getPublicProfile(userId)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setError("Profile not found.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!profile) return null;

  return (
    <main className="container py-4">
      <Link to="/discover">Back to discovery</Link>

      <div className="card p-4 mt-3">
        <h1>{profile.username}</h1>

        <h2 className="h5">
          {profile.headline || "SkillSwap member"}
        </h2>

        <p>
          <strong>Location: </strong>
          {profile.location || "Not provided"}
        </p>

        <h3 className="h5">About</h3>
        <p>{profile.bio || "No biography available."}</p>

        <button className="btn btn-secondary" disabled>
          Request Skill Exchange — Coming Day 8
        </button>
      </div>
    </main>
  );
}