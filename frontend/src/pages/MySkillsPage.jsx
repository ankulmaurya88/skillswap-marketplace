import { useEffect, useState } from "react";

import {
  getSkills,
  getMySkills,
  addMySkill,
  deleteMySkill,
} from "../services/skillService";

export default function MySkillsPage() {
  const [catalog, setCatalog] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillType, setSkillType] = useState("OFFER");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [skills, userSkills] = await Promise.all([
          getSkills(),
          getMySkills(),
        ]);

        if (!active) return;

        setCatalog(skills);
        setMySkills(userSkills);

        if (skills.length > 0) {
          setSelectedSkill(String(skills[0].id));
        }
      } catch {
        if (active) setError("Failed to load skills.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedSkill) return;

    setSaving(true);

    try {
      const created = await addMySkill({
        skill: Number(selectedSkill),
        skill_type: skillType,
      });

      setMySkills((prev) => [...prev, created]);
      setMessage("Skill added successfully.");
    } catch (err) {
      const data = err.response?.data;

      setError(
        data ? JSON.stringify(data) : "Unable to add skill."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    setError("");
    setMessage("");

    try {
      await deleteMySkill(id);

      setMySkills((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setMessage("Skill removed successfully.");
    } catch {
      setError("Unable to remove skill.");
    }
  };

  const renderSkills = (type) => {
    const filtered = mySkills.filter(
      (item) => item.skill_type === type
    );

    if (filtered.length === 0) {
      return <p>No skills added yet.</p>;
    }

    return (
      <ul className="list-group">
        {filtered.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex
              justify-content-between align-items-center"
          >
            <span>{item.skill_name}</span>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleRemove(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <p>Loading skills...</p>;

  return (
    <main className="container py-4">
      <h1>My Skills</h1>
      <p>
        Add skills you can teach or want to learn.
      </p>

      <form onSubmit={handleAdd} className="mb-4">
        <label htmlFor="skill" className="form-label">
          Select a skill
        </label>

        <select
          id="skill"
          className="form-select mb-3"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          required
        >
          {catalog.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>

        <label htmlFor="skillType" className="form-label">
          Skill type
        </label>

        <select
          id="skillType"
          className="form-select mb-3"
          value={skillType}
          onChange={(e) => setSkillType(e.target.value)}
        >
          <option value="OFFER">Can Teach</option>
          <option value="LEARN">Want to Learn</option>
        </select>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !selectedSkill}
        >
          {saving ? "Adding..." : "Add Skill"}
        </button>
      </form>

      {error && <p role="alert" className="text-danger">{error}</p>}
      {message && <p role="status" className="text-success">{message}</p>}

      <h2>Skills I Can Teach</h2>
      {renderSkills("OFFER")}

      <h2 className="mt-4">Skills I Want to Learn</h2>
      {renderSkills("LEARN")}
    </main>
  );
}