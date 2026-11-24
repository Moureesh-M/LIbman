import { useEffect, useState } from "react";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember
} from "../services/api";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    let active = true;

    getMembers()
      .then((data) => {
        if (active) setMembers(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function startEdit(member) {
    setSelectedMember(member);
    setName(member.name);
    setEmail(member.email);
    setError("");
  }

  function cancelEdit() {
    setSelectedMember(null);
    setName("");
    setEmail("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (selectedMember) {
        const updated = await updateMember(selectedMember.member_id, {
          name,
          email
        });
        setMembers((current) =>
          current.map((member) =>
            member.member_id === selectedMember.member_id ? updated : member
          )
        );
        cancelEdit();
      } else {
        const created = await createMember({ name, email });
        setMembers((current) => [...current, created]);
        setName("");
        setEmail("");
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDelete(memberId) {
    setError("");

    try {
      await deleteMember(memberId);
      setMembers((current) =>
        current.filter((member) => member.member_id !== memberId)
      );
      if (selectedMember?.member_id === memberId) cancelEdit();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <section className="page members-page">
      <div className="page-heading">
        <h1>Members</h1>
      </div>
      {error && <p className="error">{error}</p>}

      <form className="member-form card" onSubmit={handleSubmit}>
        <h2>{selectedMember ? "Edit member" : "Add member"}</h2>
        <div className="form-grid member-form-grid">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
          />
          <button className="button primary" type="submit">
            {selectedMember ? "Save Member" : "Add Member"}
          </button>
          {selectedMember && (
            <button className="button secondary" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {members.length === 0 ? (
        <p className="empty-text">No members found.</p>
      ) : (
        <div className="member-grid">
          {members.map((member) => (
            <article className="member-card" key={member.member_id}>
              <div className="avatar" aria-hidden="true">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="member-info">
                <h2>{member.name}</h2>
                <p>{member.email}</p>
              </div>
              <div className="card-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => startEdit(member)}
                >
                  Edit
                </button>
                <button
                  className="button danger"
                  type="button"
                  onClick={() => handleDelete(member.member_id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
