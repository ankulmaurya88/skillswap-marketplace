import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyProfile,
  updateMyProfile,
} from "../services/profileService";

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    headline: "",
    bio: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((data) => {
        if (active) {
          setForm({
            headline: data.headline || "",
            bio: data.bio || "",
            location: data.location || "",
          });
        }
      })
      .catch(() => {
        if (active) setError("Failed to load profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await updateMyProfile(form);
      navigate("/profile", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setError(
        data ? JSON.stringify(data) : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <main className="container py-4">
      <h1>Edit Profile</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="headline" className="form-label">
            Professional headline
          </label>
          <input
            id="headline"
            name="headline"
            className="form-control"
            maxLength={150}
            value={form.headline}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="bio" className="form-label">
            About me
          </label>
          <textarea
            id="bio"
            name="bio"
            className="form-control"
            rows={5}
            maxLength={1000}
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            className="form-control"
            maxLength={100}
            value={form.location}
            onChange={handleChange}
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button
          className="btn btn-primary"
          disabled={saving || !!error && error === "Failed to load profile."}
          type="submit"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/profile")}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}