"use client";
import { useAnchorProgram } from "@/lib/anchor";
import React, { useState } from "react";

export default function CreateCourseForm({ onCreate } : any) {
  const { getProgram, publicKey } = useAnchorProgram();
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e : any) => {
    e.preventDefault();
    if (!getProgram || !publicKey) return alert("Connect wallet first");
    setLoading(true);
    try {
      const tx = await getProgram.methods
        .createCourse(courseName, courseCode ? { option: courseCode } : null)
        .accounts({
          userAccount: publicKey,
          course: getProgram.programId, // placeholder; real PDA logic depends on your program
          authority: publicKey,
          systemProgram: getProgram.programId, // system program - this is a placeholder
        })
        .rpc();
      console.log("createCourse tx", tx);
      onCreate && onCreate();
      setCourseName("");
      setCourseCode("");
    } catch (err : any) {
      console.error(err);
      alert("Error creating course: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-2">
      <input
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        placeholder="Course name"
        className="w-full p-2 border rounded"
      />
      <input
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        placeholder="Course code (optional)"
        className="w-full p-2 border rounded"
      />
      <div>
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </div>
    </form>
  );
}
