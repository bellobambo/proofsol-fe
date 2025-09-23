"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "@/lib/anchor";
import CreateCourseForm from "@/components/CreateCourseForm";
import CreateExamForm from "@/components/CreateExamForm";
import CourseList from "@/components/CourseList";
import RegisterUserForm from "@/components/RegisterUserForm";
import EnrollButton from "@/components/EnrollButton";
import SubmitExamForm from "@/components/SubmitExamForm";

export default function Home() {
  const { getProgram, publicKey } = useAnchorProgram();
  const [courses, setCourses] = useState<any>([]);
  const [exams, setExams] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    if (!getProgram) return;
    setLoading(true);
    try {
      const accounts = await getProgram.account.course.all();
      // shape the accounts
      const cs = accounts.map((a) => ({ pubkey: a.publicKey, ...a.account }));
      setCourses(cs);
    } catch (e) {
      console.error("fetchCourses", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    if (!getProgram) return;
    try {
      const accounts = await getProgram.account.exam.all();
      const es = accounts.map((a) => ({ pubkey: a.publicKey, ...a.account }));
      setExams(es);
    } catch (e) {
      console.error("fetchExams", e);
    }
  };

  useEffect(() => {
    if (!getProgram) return;
    fetchCourses();
    fetchExams();
  }, [getProgram]);

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
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="col-span-2 space-y-6">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold mb-3">Create (lecturer)</h2>
            <CreateCourseForm onCreate={fetchCourses} />
            <CreateExamForm courses={courses} onCreate={fetchExams} />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold mb-3">Register (user)</h2>
            <RegisterUserForm />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold mb-3">Available Courses</h2>
            <CourseList
              courses={courses}
              exams={exams}
              refresh={() => {
                fetchCourses();
                fetchExams();
              }}
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
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
