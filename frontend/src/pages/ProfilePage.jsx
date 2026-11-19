import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../services/profileService";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setError("Unable to load profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <main className="container py-4">
      <h1>My Profile</h1>

      <div className="card p-4">
        <h2>{profile.username}</h2>

        <p>{profile.headline || "Add a headline"}</p>
        <p><strong>Location:</strong> {profile.location || "Not added"}</p>
        <p><strong>About me:</strong> {profile.bio || "Not added"}</p>

        <Link to="/profile/edit" className="btn btn-primary">
          Edit Profile
        </Link>
      </div>
    </main>
  );
}