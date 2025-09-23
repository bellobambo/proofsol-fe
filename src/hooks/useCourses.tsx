"use client";
import { useEffect, useState } from "react";
import { useAnchorProgram } from "../lib/anchor";

export function useCourses() {
  const { getProgram } = useAnchorProgram();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!getProgram) return;
    (async () => {
      try {
        const allCourses = await getProgram.account.course.all();
        setCourses(allCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    })();
  }, [getProgram]);

  return courses;
}
