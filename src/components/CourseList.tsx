// components/CourseList.tsx
"use client";
import React from "react";
import EnrollButton from "./EnrollButton";
import { CourseListProps } from "@/types";

export default function CourseList({
  courses = [],
  exams = [],
  enrollments = [],
  refresh,
  userAccount,
}: CourseListProps) {
  if (!courses || courses.length === 0)
    return <p className="text-sm text-gray-500">No courses yet</p>;

  // Check if user is enrolled in a course - now using the coursePubkey parameter
  const isUserEnrolled = (coursePubkey: any) => {
    if (!userAccount || !enrollments || enrollments.length === 0) return false;
    
    // Convert to string for comparison
    const coursePubkeyString = coursePubkey.toBase58();
    
    // Check if any enrollment matches this course
    return enrollments.some((enrollment: any) => 
      enrollment.course?.toBase58?.() === coursePubkeyString
    );
  };

  return (
    <div className="space-y-4">
      {courses.map((c) => (
        <div key={c.pubkey.toBase58()} className="border p-3 rounded">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                {c.title || c.course_name || c.courseName || "Unnamed Course"}
              </div>
              <div className="text-xs text-gray-500">
                Lecturer: {c.lecturer ? c.lecturer.toBase58() : "Unknown"}
              </div>
              
              {/* Show enrollment status if user is registered */}
              {userAccount && (
                <div className="text-xs mt-1">
                  {isUserEnrolled(c.pubkey) ? (
                    <span className="text-green-600">✅ You are enrolled</span>
                  ) : userAccount.role?.student ? (
                    <span className="text-orange-500">⚠️ Not enrolled</span>
                  ) : (
                    <span className="text-blue-500">👨‍🏫 Your course</span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <EnrollButton 
                course={c} 
                onEnrolled={refresh}
                userAccount={userAccount}
                isEnrolled={isUserEnrolled(c.pubkey)}
              />
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
                    {ex.title} — Date:{" "}
                    {new Date(
                      Number(ex.date ?? ex.startTimestamp ?? ex.start_timestamp ?? 0) * 1000
                    ).toLocaleString()}
                    {ex.duration && ` (Duration: ${ex.duration} mins)`}
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}