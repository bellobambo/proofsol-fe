"use client";
import React, { useState } from "react";
import { useAnchorProgram } from "../anchor";
import { PublicKey } from "@solana/web3.js";

export default function EnrollButton({ course, onEnrolled }) {
  const { getProgram, publicKey } = useAnchorProgram();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!getProgram || !publicKey) return alert("Connect wallet first");
    setLoading(true);
    try {
      await getProgram.methods
        .enrollCourse()
        .accounts({
          userAccount: publicKey,
          course: new PublicKey(course.pubkey),
          enrollment: getProgram.programId, // placeholder PDA
          authority: publicKey,
          systemProgram: getProgram.programId,
        })
        .rpc();
      alert("Enrolled (tx submitted)");
      onEnrolled && onEnrolled();
    } catch (err) {
      console.error(err);
      alert("Enroll error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      className="px-3 py-1 bg-indigo-600 text-white rounded"
      disabled={loading}
    >
      {loading ? "Enrolling..." : "Enroll"}
    </button>
  );
}
