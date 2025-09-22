"use client";
import { useState } from "react";
import { useAnchorProgram } from "../lib/anchor";
import * as anchor from "@project-serum/anchor";

export default function SubmitExamForm({
  courseName,
  examTitle,
}: {
  courseName: string;
  examTitle: string;
}) {
  const { getProgram, publicKey } = useAnchorProgram();
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSubmitExam = async () => {
    if (!getProgram || !publicKey) return alert("Connect wallet first");

    try {
      const [coursePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("course"), publicKey.toBuffer(), Buffer.from(courseName)],
        getProgram.programId
      );

      const [examPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("exam"), coursePda.toBuffer(), Buffer.from(examTitle)],
        getProgram.programId
      );

      const [enrollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("enrollment"), coursePda.toBuffer(), publicKey.toBuffer()],
        getProgram.programId
      );

      const [submissionPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("submission"), examPda.toBuffer(), publicKey.toBuffer()],
        getProgram.programId
      );

      const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        getProgram.programId
      );

      const tx = await getProgram.methods
        .submitExam(answers)
        .accounts({
          userAccount: userPda,
          course: coursePda,
          exam: examPda,
          enrollment: enrollPda,
          submission: submissionPda,
          authority: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Exam submitted:", tx);
      alert("✅ Exam submitted!");
    } catch (err) {
      console.error(err);
      alert("❌ Exam submission failed");
    }
  };

  return (
    <div className="p-4 border rounded my-2">
      <h2 className="font-bold mb-2">Submit Exam</h2>
      {answers.map((a, idx) => (
        <input
          key={idx}
          placeholder={`Answer ${idx + 1}`}
          value={a}
          onChange={(e) => {
            const copy = [...answers];
            copy[idx] = e.target.value;
            setAnswers(copy);
          }}
          className="border p-2 w-full my-2"
        />
      ))}
      <button
        onClick={() => setAnswers([...answers, ""])}
        className="bg-gray-500 text-white px-4 py-1 rounded"
      >
        + Add Answer
      </button>
      <button
        onClick={handleSubmitExam}
        className="bg-red-500 text-white px-4 py-2 rounded ml-2"
      >
        Submit Exam
      </button>
    </div>
  );
}
