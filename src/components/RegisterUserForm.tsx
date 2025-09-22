"use client";
import { useState } from "react";
import { useAnchorProgram } from "../lib/anchor";
import * as anchor from "@project-serum/anchor";

export default function RegisterUserForm() {
  const { getProgram, publicKey } = useAnchorProgram();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Lecturer" | "Student">("Student");
  const [course, setCourse] = useState("");
  const [matric, setMatric] = useState("");

  const handleRegister = async () => {
    if (!getProgram || !publicKey) return alert("Connect wallet first");

    try {
      const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        getProgram.programId
      );

      const tx = await getProgram.methods
        .registerUser({ [role]: {} }, name, course || null, matric || null)
        .accounts({
          userAccount: userPda,
          authority: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("User registered:", tx);
      alert("✅ User registered!");
    } catch (err) {
      console.error(err);
      alert("❌ Registration failed");
    }
  };

  return (
    <div className="p-4 border rounded my-2">
      <h2 className="font-bold mb-2">Register User</h2>
      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "Lecturer" | "Student")}
        className="border p-2 w-full my-2"
      >
        <option value="Lecturer">Lecturer</option>
        <option value="Student">Student</option>
      </select>
      <input
        placeholder="Course (optional)"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <input
        placeholder="Matric No (optional)"
        value={matric}
        onChange={(e) => setMatric(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Register
      </button>
    </div>
  );
}
