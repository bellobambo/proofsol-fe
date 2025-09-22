"use client";
import { useAnchorProgram } from "../lib/anchor";
import * as anchor from "@project-serum/anchor";

export default function EnrollCourseButton({
  courseName,
}: {
  courseName: string;
}) {
  const { getProgram, publicKey } = useAnchorProgram();

  const handleEnroll = async () => {
    if (!getProgram || !publicKey) return alert("Connect wallet first");

    try {
      const [coursePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("course"), publicKey.toBuffer(), Buffer.from(courseName)],
        getProgram.programId
      );

      const [enrollPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("enrollment"), coursePda.toBuffer(), publicKey.toBuffer()],
        getProgram.programId
      );

      const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        getProgram.programId
      );

      const tx = await getProgram.methods
        .enrollCourse()
        .accounts({
          userAccount: userPda,
          course: coursePda,
          enrollment: enrollPda,
          authority: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Enrolled:", tx);
      alert("✅ Enrolled in course!");
    } catch (err) {
      console.error(err);
      alert("❌ Enrollment failed");
    }
  };

  return (
    <button
      onClick={handleEnroll}
      className="bg-purple-500 text-white px-4 py-2 rounded"
    >
      Enroll in {courseName}
    </button>
  );
}
