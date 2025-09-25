"use client";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";

// Paste your full IDL object here
const IDL = {
  address: "Naccww3abFJ8Q6Tq6LVMpbNBGEmzgP12ezKLyv5NjMN",
  metadata: {
    name: "school_assess",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "create_course",
      docs: ["Lecturer creates a course account"],
      accounts: [
        { name: "user_account", isMut: true, isSigner: false },
        {
          name: "course",
          isMut: true,
          isSigner: false,
        },
        { name: "authority", isMut: true, isSigner: true },
        { name: "system_program", isMut: false, isSigner: false },
      ],
      args: [
        { name: "course_name", type: "string" },
        { name: "course_code", type: { option: "string" } },
      ],
    },
    {
      name: "create_exam",
      docs: [
        "Lecturer creates an exam and uploads questions & correct answers in bulk.",
        "Questions and answers are stored on-chain inside the Exam account.",
      ],
      accounts: [
        { name: "user_account", isMut: true, isSigner: false },
        { name: "course", isMut: true, isSigner: false },
        { name: "exam", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "system_program", isMut: false, isSigner: false },
      ],
      args: [
        { name: "title", type: "string" },
        { name: "start_timestamp", type: "i64" },
        { name: "duration_seconds", type: "u64" },
        {
          name: "questions",
          type: { vec: { defined: "QuestionUpload" } },
        },
      ],
    },
    {
      name: "enroll_course",
      docs: ["Student enrolls into a course"],
      accounts: [
        { name: "user_account", isMut: true, isSigner: false },
        { name: "course", isMut: true, isSigner: false },
        { name: "enrollment", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "system_program", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "register_user",
      accounts: [
        { name: "user_account", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "system_program", isMut: false, isSigner: false },
      ],
      args: [
        { name: "role", type: { defined: "Role" } },
        { name: "name", type: "string" },
        { name: "course", type: { option: "string" } },
        { name: "matric_number", type: { option: "string" } },
      ],
    },
    {
      name: "submit_exam",
      docs: [
        "Student submits exam answers. Score is computed on-chain, stored in Submission account.",
      ],
      accounts: [
        { name: "user_account", isMut: true, isSigner: false },
        { name: "course", isMut: true, isSigner: false },
        { name: "exam", isMut: true, isSigner: false },
        { name: "enrollment", isMut: true, isSigner: false },
        { name: "submission", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "system_program", isMut: false, isSigner: false },
      ],
      args: [{ name: "answers", type: { vec: "string" } }],
    },
  ],
  accounts: [
    { name: "Course", type: { kind: "struct", fields: [] } },
    { name: "Enrollment", type: { kind: "struct", fields: [] } },
    { name: "Exam", type: { kind: "struct", fields: [] } },
    { name: "Submission", type: { kind: "struct", fields: [] } },
    { name: "UserAccount", type: { kind: "struct", fields: [] } },
  ],
  types: [
    {
      name: "Course",
      type: {
        kind: "struct",
        fields: [
          { name: "lecturer", type: "publicKey" },
          { name: "course_name", type: "string" },
          { name: "course_code", type: { option: "string" } },
          { name: "enrolled_count", type: "u64" },
          { name: "bump", type: "u8" },
          { name: "created_at", type: "i64" },
        ],
      },
    },
    {
      name: "Enrollment",
      type: {
        kind: "struct",
        fields: [
          { name: "course", type: "publicKey" },
          { name: "student", type: "publicKey" },
          { name: "enrolled_at", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Exam",
      type: {
        kind: "struct",
        fields: [
          { name: "course", type: "publicKey" },
          { name: "lecturer", type: "publicKey" },
          { name: "title", type: "string" },
          { name: "start_timestamp", type: "i64" },
          { name: "duration_seconds", type: "u64" },
          { name: "questions", type: { vec: { defined: "Question" } } },
          { name: "bump", type: "u8" },
          { name: "created_at", type: "i64" },
        ],
      },
    },
    {
      name: "Question",
      type: {
        kind: "struct",
        fields: [
          { name: "question", type: "string" },
          { name: "correct_answer", type: "string" },
        ],
      },
    },
    {
      name: "QuestionUpload",
      type: {
        kind: "struct",
        fields: [
          { name: "question", type: "string" },
          { name: "correct_answer", type: "string" },
        ],
      },
    },
    {
      name: "Role",
      type: {
        kind: "enum",
        variants: [{ name: "Lecturer" }, { name: "Student" }],
      },
    },
    {
      name: "Submission",
      type: {
        kind: "struct",
        fields: [
          { name: "exam", type: "publicKey" },
          { name: "student", type: "publicKey" },
          { name: "answers", type: { vec: "string" } },
          { name: "score", type: "u64" },
          { name: "submitted_at", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "UserAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "name", type: "string" },
          { name: "role", type: { defined: "Role" } },
          { name: "course", type: { option: "string" } },
          { name: "matric_number", type: { option: "string" } },
          { name: "bump", type: "u8" },
          { name: "created_at", type: "i64" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "Unauthorized", msg: "Unauthorized" },
    { code: 6001, name: "InvalidInput", msg: "Invalid input" },
    {
      code: 6002,
      name: "MissingMatric",
      msg: "Missing matric number for student",
    },
    { code: 6003, name: "ExamNotStarted", msg: "Exam has not started" },
    { code: 6004, name: "ExamEnded", msg: "Exam has ended" },
    { code: 6005, name: "Overflow", msg: "Numeric overflow" },
  ],
};

// Use the program ID directly
const PROGRAM_ID = new PublicKey("Naccww3abFJ8Q6Tq6LVMpbNBGEmzgP12ezKLyv5NjMN");

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL, PROGRAM_ID, provider);
  }, [provider]);

  return { program, publicKey: wallet?.publicKey };
}
