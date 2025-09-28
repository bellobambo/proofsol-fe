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

// types.ts
export interface CourseListProps {
  courses: any[];
  exams: any[];
  enrollments?: any[];
  refresh: () => void;
  userAccount?: any;
}

export interface EnrollButtonProps {
  course: any;
  onEnrolled: () => void;
  userAccount?: any;
  isEnrolled?: boolean;
}