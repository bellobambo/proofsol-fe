// components/CourseList.tsx
"use client";
import React from "react";
import EnrollButton from "./EnrollButton";
import { CourseListProps } from "@/types";

export default function CourseList({
  courses = [],
  exams = [],
  refresh,
}: CourseListProps) {
  if (!courses || courses.length === 0)
    return <p className="text-sm text-gray-500">No courses yet</p>;

  return (
    <div className="space-y-4">
      {courses.map((c) => (
        <div key={c.pubkey.toBase58()} className="border p-3 rounded">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                {c.course_name || c.courseName || "Unnamed Course"}
              </div>
              <div className="text-xs text-gray-500">
                {/* Lecturer: {c.lecturer?.toBase58?.() ?? c.lecturer ?? "Unknown"} */}
                Lecturer: {c.lecturer ? c.lecturer.toBase58() : "Unknown"}
              </div>
              <div className="text-xs text-gray-500">
                Enrolled:{" "}
                {c.enrolled_count?.toString?.() ?? c.enrolled_count ?? 0}
              </div>
            </div>
            <div className="space-y-1">
              <EnrollButton course={c} onEnrolled={refresh} />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-semibold">Exams</div>
            <div className="mt-2 space-y-1">
              {exams.filter(
                (e) => e.course?.toBase58?.() === c.pubkey.toBase58()
              ).length === 0 && (
                <div className="text-xs text-gray-500">
                  No exams for this course
                </div>
              )}
              {exams
                .filter((e) => e.course?.toBase58?.() === c.pubkey.toBase58())
                .map((ex) => (
                  <div key={ex.pubkey.toBase58()} className="text-sm">
                    {ex.title} — starts:{" "}
                    {new Date(
                      Number(ex.startTimestamp ?? ex.start_timestamp ?? 0) *
                        1000
                    ).toLocaleString()}
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
