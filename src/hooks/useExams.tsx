"use client";
import { useEffect, useState } from "react";
import { useAnchorProgram } from "../lib/anchor";

export function useExams(courseName: string) {
  const { getProgram } = useAnchorProgram();
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    if (!getProgram || !courseName) return;
    (async () => {
      try {
        const allExams = await getProgram.account.exam.all();
        const filtered = allExams.filter(
          (exam) => exam.account.courseName === courseName
        );
        setExams(filtered);
      } catch (err) {
        console.error("Error fetching exams:", err);
      }
    })();
  }, [getProgram, courseName]);

  return exams;
}
