// Phase 1 bridge: student quizzes show the questions their teacher created in
// the teacher workspace. Questions and the single attempt per assessment are
// read from localStorage, so a reload reflects edits on both sides immediately.

import { quizzes, type Quiz, type QuizQuestion } from "../mock/student";
import type { AssessmentQuestion } from "../mock/teacher";
import { nowTimestamp, readSavedTeacherSnapshot } from "./client";

const QUIZ_ATTEMPT_KEY = "uni-lms.student-quiz-attempts.v1";

// FR4/FR22: MCQs are marked on submission and revealed on the review page.
// Written answers still wait for teacher grading.
export const QUIZ_SCORES_MESSAGE = "MCQ scores and answers appear on the review page after you submit.";

export interface StoredQuizAttempt {
  answers: Record<string, QuizAnswerValue>;
  score: number;
  started: string;
  completed: string;
  duration: string;
  grade: string;
}

type QuizAttemptMap = Record<string, StoredQuizAttempt>;

function readStoredAttempts(): QuizAttemptMap {
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as QuizAttemptMap;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredAttempts(attempts: QuizAttemptMap): void {
  try {
    localStorage.setItem(QUIZ_ATTEMPT_KEY, JSON.stringify(attempts));
  } catch {
    // Storage quota can be reached by large demo uploads; keep this attempt in memory.
  }
}

export function getQuizAttempt(quiz: Quiz): StoredQuizAttempt | undefined {
  const saved = readStoredAttempts()[quiz.id];
  if (saved) return saved;
  if (!quiz.attempt) return undefined;

  // Seeded completed attempts have no answer sheet; reconstruct one for review.
  const answers: Record<string, QuizAnswerValue> = {};
  quiz.questions.forEach((question, index) => {
    if (question.type === "written") {
      answers[question.id] = "";
      return;
    }
    const missed = quiz.grade < quiz.max && index === quiz.questions.length - 1;
    answers[question.id] = missed ? (question.answer + 1) % question.options.length : question.answer;
  });
  return { ...quiz.attempt, answers, score: quiz.grade };
}

export function saveQuizAttempt(
  quiz: Quiz,
  answers: Record<string, QuizAnswerValue>,
  elapsedSeconds: number,
): StoredQuizAttempt {
  const score = quiz.questions.reduce((sum, question) =>
    sum + (question.type !== "written" && answers[question.id] === question.answer ? question.points : 0), 0);
  const attempt: StoredQuizAttempt = {
    answers,
    score,
    started: nowTimestamp(),
    completed: nowTimestamp(),
    duration: `${Math.max(1, Math.round(elapsedSeconds / 60))} min`,
    grade: `${score.toFixed(2)} / ${quiz.max.toFixed(2)}`,
  };
  writeStoredAttempts({ ...readStoredAttempts(), [quiz.id]: attempt });
  return attempt;
}

export function areQuizScoresRevealed(quiz: Quiz): boolean {
  return getQuizAttempt(quiz) != null;
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
  const teacherQuestions = readSavedTeacherSnapshot().assessmentQuestions ?? [];
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
