"use client";
import { useState } from "react";
import { useAnchorProgram } from "../lib/anchor";
import * as anchor from "@project-serum/anchor";

export default function CreateCourseForm() {
  const { getProgram, publicKey } = useAnchorProgram();
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");

  const handleCreateCourse = async () => {
    if (!getProgram || !publicKey) return alert("Connect wallet first");

    try {
      const [coursePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("course"), publicKey.toBuffer(), Buffer.from(courseName)],
        getProgram.programId
      );

      const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        getProgram.programId
      );

      const tx = await getProgram.methods
        .createCourse(courseName, courseCode || null)
        .accounts({
          userAccount: userPda,
          course: coursePda,
          authority: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Course created:", tx);
      alert("✅ Course created!");
    } catch (err) {
      console.error(err);
      alert("❌ Course creation failed");
    }
  };

  return (
    <div className="p-4 border rounded my-2">
      <h2 className="font-bold mb-2">Create Course</h2>
      <input
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <input
        placeholder="Course Code (optional)"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <button
        onClick={handleCreateCourse}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Create Course
      </button>
    </div>
  );
}
