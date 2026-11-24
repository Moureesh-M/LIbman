const sqlite = require("../config/sqlite");

function getMembers(req, res) {
  try {
    const members = sqlite.getDb()
      .prepare("SELECT member_id, name, email FROM members ORDER BY member_id")
      .all();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

function getMember(req, res) {
  try {
    const member = sqlite.getDb()
      .prepare("SELECT member_id, name, email FROM members WHERE member_id = ?")
      .get(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

function createMember(req, res) {
  // works because function declarations are hoisted
  const member = validateMember(req, res);
  if (!member) return;

  try {
    const result = sqlite.getDb()
      .prepare("INSERT INTO members (name, email) VALUES (?, ?)")
      .run(member.name, member.email);

    res.status(201).json({
      member_id: result.lastInsertRowid,
      ...member
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

function updateMember(req, res) {
  const member = validateMember(req, res);
  if (!member) return;

  try {
    const db = sqlite.getDb();
    const existing = db.prepare(
      "SELECT member_id FROM members WHERE member_id = ?"
    ).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Member not found" });
    }

    db.prepare("UPDATE members SET name = ?, email = ? WHERE member_id = ?")
      .run(member.name, member.email, req.params.id);

    res.json({ member_id: Number(req.params.id), ...member });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

function deleteMember(req, res) {
  try {
    const db = sqlite.getDb();
    const existing = db.prepare(
      "SELECT member_id FROM members WHERE member_id = ?"
    ).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Member not found" });
    }

    const borrowing = db.prepare(
      "SELECT borrow_id FROM borrowings WHERE member_id = ? LIMIT 1"
    ).get(req.params.id);

    if (borrowing) {
      return res.status(409).json({
        message: "Member cannot be deleted while they have borrowings"
      });
    }

    db.prepare("DELETE FROM members WHERE member_id = ?").run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

function validateMember(req, res) {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  if (!name || !email) {
    res.status(400).json({ message: "Name and email are required" });
    return null;
  }

  return { name, email };
}

module.exports = {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
};
