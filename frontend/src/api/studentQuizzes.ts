// Phase 1 bridge: student quizzes show the questions their teacher created in
// the teacher workspace. Questions are read from the same localStorage snapshot
// the teacher edits, so a reload after editing reflects immediately on quizzes.

import { quizzes, type Quiz, type QuizQuestion } from "../mock/student";
import type { AssessmentQuestion } from "../mock/teacher";
import { TEACHER_SNAPSHOT_KEY } from "./client";

interface TeacherSnapshotQuestions {
  assessmentQuestions?: AssessmentQuestion[];
}

function readTeacherQuestions(): AssessmentQuestion[] {
  try {
    const raw = localStorage.getItem(TEACHER_SNAPSHOT_KEY);
    if (!raw) return [];
    const saved = JSON.parse(raw) as TeacherSnapshotQuestions;
    return Array.isArray(saved.assessmentQuestions) ? saved.assessmentQuestions : [];
  } catch {
    return [];
  }
}

function toQuizQuestion(question: AssessmentQuestion): QuizQuestion {
  const written = question.type === "written";
  return {
    id: question.id,
    text: question.text,
    options: written ? [] : question.options ?? [],
    answer: written ? -1 : question.correctOption ?? 0,
    points: question.marks,
    type: written ? "written" : "mcq",
  };
}

export function getStudentQuizzes(): Quiz[] {
  const teacherQuestions = readTeacherQuestions();
  if (teacherQuestions.length === 0) return quizzes;

  return quizzes.map((quiz) => {
    if (!quiz.sourceAssessmentId) return quiz;
    const sourced = teacherQuestions.filter((q) => q.assessmentId === quiz.sourceAssessmentId);
    if (sourced.length === 0) return quiz;
    return { ...quiz, questions: sourced.map(toQuizQuestion) };
  });
}

export function isWrittenQuestion(question: QuizQuestion): boolean {
  return question.type === "written";
}

export type QuizAnswerValue = number | string;
