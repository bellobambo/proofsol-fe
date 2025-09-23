"use client";
import React, { useState } from "react";
import { useAnchorProgram } from "../anchor";

export default function RegisterUserForm() {
  const { getProgram, publicKey } = useAnchorProgram();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Student");
  const [matric, setMatric] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!getProgram || !publicKey) return alert("Connect wallet first");
    setLoading(true);
    try {
      // Role is an enum { Lecturer | Student } — Anchor expects { Student: {} } or { Lecturer: {} }
      const roleObj = role === "Student" ? { Student: {} } : { Lecturer: {} };
      await getProgram.methods
        .registerUser(roleObj, name, matric ? { option: matric } : null, null)
        .accounts({
          userAccount: publicKey,
          authority: publicKey,
          systemProgram: getProgram.programId,
        })
        .rpc();
      alert("Registered");
      setName("");
      setMatric("");
    } catch (err) {
      console.error(err);
      alert("Register error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full p-2 border rounded"
      />
      <div className="flex gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="Student">Student</option>
          <option value="Lecturer">Lecturer</option>
        </select>
        <input
          value={matric}
          onChange={(e) => setMatric(e.target.value)}
          placeholder="Matric number (students)"
          className="p-2 border rounded flex-1"
        />
      </div>
      <button
        type="submit"
        className="px-3 py-1 bg-yellow-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
