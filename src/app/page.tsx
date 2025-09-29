// In your Home component
"use client";
import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import CreateCourseForm from "@/components/CreateCourseForm";
import CreateExamForm from "@/components/CreateExamForm";
import CourseList from "@/components/CourseList";
import RegisterUserForm from "@/components/RegisterUserForm";
import { useAnchorProgram } from "@/lib/anchor";

export default function Home() {
  const { program, publicKey } = useAnchorProgram();
  const [courses, setCourses] = useState<any>([]);
  const [exams, setExams] = useState<any>([]);
  const [enrollments, setEnrollments] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [userAccount, setUserAccount] = useState<any>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  // Fetch user account to check if registered
  // Update your fetchUserAccount function
  const fetchUserAccount = async () => {
    if (!program || !publicKey) {
      setUserAccount(null);
      return;
    }

    setIsCheckingUser(true);
    try {
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        program.programId
      );

      // Add a small delay to ensure transaction is confirmed
      await new Promise(resolve => setTimeout(resolve, 1000));

      const account = await program.account.user.fetch(userPda);
      setUserAccount(account);
    } catch (error: any) {
      console.log("User not registered or account not found:", error.message);
      setUserAccount(null);
    } finally {
      setIsCheckingUser(false);
    }
  };
  const fetchCourses = async () => {
    if (!program) return;
    setLoading(true);
    try {
      const accounts = await program.account.course.all();
      const cs = accounts.map((a) => ({ pubkey: a.publicKey, ...a.account }));
      setCourses(cs);
    } catch (e) {
      console.error("fetchCourses", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    if (!program) return;
    try {
      const accounts = await program.account.exam.all();
      const es = accounts.map((a) => ({ pubkey: a.publicKey, ...a.account }));
      setExams(es);
    } catch (e) {
      console.error("fetchExams", e);
    }
  };

  const fetchEnrollments = async () => {
    if (!program || !publicKey) return;
    try {
      const accounts = await program.account.enrollment.all();
      const userEnrollments = accounts
        .map((a) => ({ pubkey: a.publicKey, ...a.account }))
        .filter((e: any) => e.student?.toBase58?.() === publicKey.toBase58()); // Add type annotation
      setEnrollments(userEnrollments);
    } catch (e) {
      console.error("fetchEnrollments", e);
    }
  };


  const handleManualRefresh = async () => {
    await fetchUserAccount();
    await fetchCourses();
    await fetchExams();
    await fetchEnrollments();
  }

  useEffect(() => {
    if (!program) return;
    fetchCourses();
    fetchExams();
    if (publicKey) {
      fetchEnrollments();
    }
  }, [program, publicKey]);

  useEffect(() => {
    fetchUserAccount();
  }, [program, publicKey]);

  const handleUserRegistered = () => {
    fetchUserAccount();
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {loading && (
        <div className="text-sm text-blue-500">Loading courses...</div>
      )}

      <header className="mb-6">
        <h1 className="text-3xl font-bold">School Assess — Frontend</h1>
        <p className="text-sm text-gray-600">
          Connected wallet: {publicKey?.toBase58() ?? "not connected"}
        </p>

        {publicKey && userAccount && (
          <button
            onClick={handleManualRefresh}
            className="ml-2 px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
          >
            Refresh ↻
          </button>
        )}
        {publicKey && (
          <div className="mt-2">
            {isCheckingUser ? (
              <p className="text-sm text-blue-500">Checking registration status...</p>
            ) : userAccount ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600">
                  ✅ Registered as {userAccount.role?.student ? "Student" : "Lecturer"} - {userAccount.name}
                </span>
                {userAccount.matricNumber && (
                  <span className="text-sm text-gray-600">
                    (Matric: {userAccount.matricNumber})
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-orange-500">
                ⚠️ You are not registered. Please register below.
              </p>
            )}
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="col-span-2 space-y-6">
          {userAccount && !userAccount.role?.student && (
            <div className="p-4 bg-white rounded shadow">
              <h2 className="font-semibold mb-3">Create (lecturer)</h2>
              <CreateCourseForm onCreate={fetchCourses} />
              <CreateExamForm courses={courses} onCreate={fetchExams} />
            </div>
          )}

          {!userAccount && publicKey && (
            <div className="p-4 bg-white rounded shadow">
              <h2 className="font-semibold mb-3">Register (user)</h2>
              <RegisterUserForm onRegistered={handleUserRegistered} />
            </div>
          )}

          {!publicKey && (
            <div className="p-4 bg-white rounded shadow">
              <h2 className="font-semibold mb-3">Register (user)</h2>
              <p className="text-sm text-gray-500">
                Please connect your wallet to register.
              </p>
            </div>
          )}

          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold mb-3">Available Courses</h2>
            <CourseList
              courses={courses}
              exams={exams}
              enrollments={enrollments}
              refresh={() => {
                fetchCourses();
                fetchExams();
                fetchEnrollments();
              }}
              userAccount={userAccount}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold mb-3">All Exams</h3>
            {exams.length === 0 ? (
              <p className="text-sm text-gray-500">No exams found</p>
            ) : (
              exams.map((e: any) => (
                <div
                  key={e.pubkey.toBase58()}
                  className="border p-3 rounded mb-3"
                >
                  <div className="text-sm font-medium">{e.title}</div>
                  {userAccount && (
                    <div className="text-xs text-gray-500 mt-1">
                      Course: {e.course.toBase58().slice(0, 8)}...
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {userAccount && (
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-semibold mb-3">Your Profile</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {userAccount.name}
                </div>
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  {userAccount.role?.student ? "Student" : "Lecturer"}
                </div>
                {userAccount.matricNumber && (
                  <div>
                    <span className="font-medium">Matric Number:</span>{" "}
                    {userAccount.matricNumber}
                  </div>
                )}
                <div>
                  <span className="font-medium">Wallet:</span>{" "}
                  {publicKey?.toBase58().slice(0, 8)}...
                </div>
                {userAccount.role?.student && enrollments.length > 0 && (
                  <div>
                    <span className="font-medium">Enrolled in:</span>{" "}
                    {enrollments.length} course(s)
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}