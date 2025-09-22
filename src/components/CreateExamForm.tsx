"use client";
import { useState } from "react";
import { useAnchorProgram } from "../lib/anchor";
import * as anchor from "@project-serum/anchor";

export default function CreateExamForm({ courseName }: { courseName: string }) {
  const { getProgram, publicKey } = useAnchorProgram();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", correct_answer: "" },
  ]);

  const handleCreateExam = async () => {
    if (!getProgram || !publicKey) return alert("Connect wallet first");

    try {
      const [coursePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("course"), publicKey.toBuffer(), Buffer.from(courseName)],
        getProgram.programId
      );

      const [examPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("exam"), coursePda.toBuffer(), Buffer.from(title)],
        getProgram.programId
      );

      const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        getProgram.programId
      );

      const tx = await getProgram.methods
        .createExam(
          title,
          new anchor.BN(Math.floor(new Date(start).getTime() / 1000)),
          new anchor.BN(parseInt(duration)),
          questions
        )
        .accounts({
          userAccount: userPda,
          course: coursePda,
          exam: examPda,
          authority: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Exam created:", tx);
      alert("✅ Exam created!");
    } catch (err) {
      console.error(err);
      alert("❌ Exam creation failed");
    }
  };

  const handleAddQuestion = () =>
    setQuestions([...questions, { question: "", correct_answer: "" }]);

  return (
    <div className="p-4 border rounded my-2">
      <h2 className="font-bold mb-2">Create Exam</h2>
      <input
        placeholder="Exam Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <input
        placeholder="Duration (seconds)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="border p-2 w-full my-2"
      />
      {questions.map((q, idx) => (
        <div key={idx} className="my-2">
          <input
            placeholder="Question"
            value={q.question}
            onChange={(e) => {
              const copy = [...questions];
              copy[idx].question = e.target.value;
              setQuestions(copy);
            }}
            className="border p-2 w-full my-1"
          />
          <input
            placeholder="Correct Answer"
            value={q.correct_answer}
            onChange={(e) => {
              const copy = [...questions];
              copy[idx].correct_answer = e.target.value;
              setQuestions(copy);
            }}
            className="border p-2 w-full my-1"
          />
        </div>
      ))}
      <button
        onClick={handleAddQuestion}
        className="bg-gray-500 text-white px-4 py-1 rounded"
      >
        + Add Question
      </button>
      <button
        onClick={handleCreateExam}
        className="bg-orange-500 text-white px-4 py-2 rounded ml-2"
      >
        Create Exam
      </button>
    </div>
  );
}
