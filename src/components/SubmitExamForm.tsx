"use client";
import React, { useState } from "react";
import { useAnchorProgram } from "../anchor";
import { PublicKey } from "@solana/web3.js";

export default function SubmitExamForm({ exam }) {
  const { getProgram, publicKey } = useAnchorProgram();
  const [answers, setAnswers] = useState(exam?.questions?.map(() => "") || []);
  const [loading, setLoading] = useState(false);

  const handleChange = (idx, val) => {
    const copy = [...answers];
    copy[idx] = val;
    setAnswers(copy);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!getProgram || !publicKey) return alert("Connect wallet first");
    if (!exam) return alert("No exam selected");
    setLoading(true);
    try {
      await getProgram.methods
        .submitExam(answers)
        .accounts({
          userAccount: publicKey,
          course: exam.course,
          exam: exam.pubkey,
          enrollment: getProgram.programId, // placeholder
          submission: getProgram.programId,
          authority: publicKey,
          systemProgram: getProgram.programId,
        })
        .rpc();
      alert("Submitted");
    } catch (err) {
      console.error(err);
      alert("Submit error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {(exam?.questions || []).map((q, i) => (
        <div key={i} className="space-y-1">
          <div className="text-sm font-medium">
            Q{i + 1}: {q?.question ?? "Question"}
          </div>
          <input
            value={answers[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder="Your answer"
            className="w-full p-2 border rounded"
          />
        </div>
      ))}
      <div>
        <button
          type="submit"
          className="px-3 py-1 bg-rose-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Answers"}
        </button>
      </div>
    </form>
  );
}
