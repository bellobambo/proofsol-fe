"use client";
import { useAnchorProgram } from "@/lib/anchor";
import React, { useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export default function RegisterUserForm() {
  const { program, publicKey } = useAnchorProgram();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Student");
  const [matric, setMatric] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!program || !publicKey) return alert("Connect wallet first");
    setLoading(true);

    try {
      const [userAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        program.programId
      );

      const roleEnum = role === "Student" ? { student: {} } : { lecturer: {} };

      const courseValue = course.trim() !== "" ? course : null;
      const matricValue =
        role === "Student" && matric.trim() !== "" ? matric : null;

      console.log("Register payload:", {
        role: roleEnum,
        name,
        course: courseValue,
        matric_number: matricValue,
      });

      const tx = await program.methods
        .registerUser(roleEnum, name, courseValue, matricValue)
        .accounts({
          user_account: userAccountPda, // must match IDL
          authority: publicKey,
          system_program: SystemProgram.programId,
        })
        .rpc();

      console.log("Transaction successful:", tx);
      alert("Registered ✅");
      setName("");
      setMatric("");
      setCourse("");
    } catch (err: any) {
      console.error("Registration error:", err);
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
        required
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

        {role === "Student" && (
          <input
            value={matric}
            onChange={(e) => setMatric(e.target.value)}
            placeholder="Matric number"
            className="p-2 border rounded flex-1"
            required={role === "Student"}
          />
        )}
      </div>

      <input
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        placeholder="Course (optional)"
        className="w-full p-2 border rounded"
      />

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
