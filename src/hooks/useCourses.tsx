"use client";
import { useEffect, useState } from "react";
import { useAnchorProgram } from "../lib/anchor";

export function useCourses() {
  const program = useAnchorProgram();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!program) return;
    (async () => {
      try {
        const allCourses = await program.account.course.all();
        setCourses(allCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    })();
  }, [program]);

  return courses;
}
