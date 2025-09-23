"use client";
import React, { useState } from "react";
import { useAnchorProgram } from "../anchor";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export default function CreateExamForm({ courses = [], onCreate }) {
  const { getProgram, publicKey } = useAnchorProgram();
  const [coursePubkey, setCoursePubkey] = useState("");
  const [title, setTitle] = useState("");
  const [startTs, setStartTs] = useState("");
  const [duration, setDuration] = useState(3600);
  const [questions, setQuestions] = useState([
    { question: "", correct_answer: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () =>
    setQuestions([...questions, { question: "", correct_answer: "" }]);

  const updateQuestion = (idx, key, val) => {
    const copy = [...questions];
    copy[idx][key] = val;
    setQuestions(copy);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!getProgram || !publicKey) return alert("Connect wallet first");
    if (!coursePubkey) return alert("Select course");
    setLoading(true);
    try {
      const parsedStart = Math.floor(new Date(startTs).getTime() / 1000);
      // build the QuestionUpload vector
      const qs = questions.map((q) => ({
        question: q.question,
        correctAnswer: q.correct_answer,
      }));

      const tx = await getProgram.methods
        .createExam(
          title,
          new anchor.BN(parsedStart),
          new anchor.BN(duration),
          qs
        )
        .accounts({
          userAccount: publicKey,
          course: new PublicKey(coursePubkey),
          exam: getProgram.programId, // placeholder PDA
          authority: publicKey,
          systemProgram: getProgram.programId,
        })
        .rpc();

      console.log("createExam tx", tx);
      onCreate && onCreate();
      setTitle("");
      setQuestions([{ question: "", correct_answer: "" }]);
    } catch (err) {
      console.error(err);
      alert("Error creating exam: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-2 mt-4">
      <div className="flex gap-2">
        <select
          value={coursePubkey}
          onChange={(e) => setCoursePubkey(e.target.value)}
          className="flex-1 p-2 border rounded"
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.pubkey.toBase58()} value={c.pubkey.toBase58()}>
              {c.courseName ?? c.course_name ?? "Unnamed Course"}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Exam title"
          className="p-2 border rounded flex-1"
        />
      </div>

      <div className="flex gap-2">
        <input
          type="datetime-local"
          value={startTs}
          onChange={(e) => setStartTs(e.target.value)}
          placeholder="Start time"
          className="p-2 border rounded flex-1"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="Duration (seconds)"
          className="p-2 border rounded flex-1"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Questions</h4>
          <button
            type="button"
            onClick={addQuestion}
            className="px-2 py-1 bg-green-600 text-white rounded text-sm"
          >
            Add Question
          </button>
        </div>
        {questions.map((q, idx) => (
          <div key={idx} className="border p-3 rounded mb-2">
            <input
              value={q.question}
              onChange={(e) => updateQuestion(idx, "question", e.target.value)}
              placeholder="Question"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              value={q.correct_answer}
              onChange={(e) =>
                updateQuestion(idx, "correct_answer", e.target.value)
              }
              placeholder="Correct answer"
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
      </div>

      <div>
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Exam"}
        </button>
      </div>
    </form>
  );
}
