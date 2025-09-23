import { PublicKey } from "@solana/web3.js";

export interface Course {
  pubkey: PublicKey;
  course_name?: string;
  courseName?: string;
  lecturer?: PublicKey;
  enrolled_count?: number;
}

export interface Exam {
  pubkey: PublicKey;
  title: string;
  course: PublicKey;
  startTimestamp?: number;
  start_timestamp?: number;
  questions?: Array<{ question: string }>;
}

export interface CourseListProps {
  courses?: Course[];
  exams?: Exam[];
  refresh: () => void;
}
