// Course result calculation for the teacher's publish view (FR15, FR21).
// Category averages, weights, missing items = zero, Midterm/Final required before finalizing.

import {
  getSectionStudents,
  mcqMarksFor,
  requiresViva,
  type AssessmentAnswer,
  type AssessmentAttempt,
  type AssessmentQuestion,
  type GradeCategory,
  type TeacherAssessment,
  type TeacherSubmission,
} from "../mock/teacher";

export interface CourseResultInput {
  sectionId: number;
  categories: GradeCategory[];
  assessments: TeacherAssessment[];
  submissions: TeacherSubmission[];
  questions: AssessmentQuestion[];
  attempts: AssessmentAttempt[];
  answers: AssessmentAnswer[];
}

export interface CourseResultRow {
  studentId: number;
  studentName: string;
  categoryPercents: Record<string, number>;
  coursePercent: number;
  letter: string;
  gradePoints: number;
  complete: boolean;
}

export function gradeForPercent(percent: number): { letter: string; gradePoints: number } {
  if (percent >= 85) return { letter: "A", gradePoints: 4 };
  if (percent >= 80) return { letter: "A-", gradePoints: 3.75 };
  if (percent >= 75) return { letter: "B+", gradePoints: 3.5 };
  if (percent >= 70) return { letter: "B", gradePoints: 3 };
  if (percent >= 65) return { letter: "C+", gradePoints: 2.5 };
  if (percent >= 60) return { letter: "C", gradePoints: 2 };
  if (percent >= 55) return { letter: "D+", gradePoints: 1.5 };
  if (percent >= 50) return { letter: "D", gradePoints: 1 };
  return { letter: "F", gradePoints: 0 };
}

// For a project the teacher splits max marks between question marks and viva.
export function vivaCapFor(assessment: TeacherAssessment, questions: AssessmentQuestion[]): number {
  if (assessment.kind !== "project") return assessment.maxMarks;
  const questionMarks = questions
    .filter((question) => question.assessmentId === assessment.id)
    .reduce((sum, question) => sum + question.marks, 0);
  return Math.max(0, assessment.maxMarks - questionMarks);
}

function marksFor(
  assessment: TeacherAssessment,
  studentId: number,
  input: CourseResultInput,
): number | null {
  const submission = input.submissions.find(
    (item) => item.assessmentId === assessment.id && item.studentId === studentId,
  );
  const attempt = input.attempts.find(
    (item) => item.assessmentId === assessment.id && item.studentId === studentId,
  );
  const submissionViva = requiresViva(assessment) ? (submission?.viva?.marks ?? 0) : 0;

  // Project scores come from the attempt; a physical assignment has no attempt.
  if (assessment.kind !== "project" && submission?.marks != null) {
    return Math.min(assessment.maxMarks, submission.marks + submissionViva);
  }

  if (!attempt) return null;

  const viva = assessment.kind === "project"
    ? Math.min(attempt.viva?.marks ?? 0, vivaCapFor(assessment, input.questions))
    : submissionViva;
  const attemptAnswers = input.answers.filter((answer) => answer.attemptId === attempt.id);
  let total = 0;
  let hasAnswer = false;
  for (const question of input.questions.filter((item) => item.assessmentId === assessment.id)) {
    const answer = attemptAnswers.find((item) => item.questionId === question.id);
    if (!answer) continue;
    hasAnswer = true;
    total += question.type === "mcq" ? mcqMarksFor(question, answer) : (answer.marksAwarded ?? 0);
  }
  return hasAnswer ? Math.min(assessment.maxMarks, total + viva) : null;
}

// MCQ marks are derived from the key; written marks are entered by the teacher.
export function calculateAttemptTotal(questions: AssessmentQuestion[], answers: AssessmentAnswer[]): number {
  return questions.reduce((sum, question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    return sum + (question.type === "mcq" ? mcqMarksFor(question, answer) : (answer?.marksAwarded ?? 0));
  }, 0);
}

export function autoGradeMcqAnswers(questions: AssessmentQuestion[], answers: AssessmentAnswer[]): AssessmentAnswer[] {
  return answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    return question?.type === "mcq"
      ? { ...answer, marksAwarded: mcqMarksFor(question, answer) }
      : answer;
  });
}

export function calculateCourseResults(input: CourseResultInput): CourseResultRow[] {
  const sectionAssessments = input.assessments.filter((item) => item.sectionId === input.sectionId);
  const sectionCategories = input.categories.filter((item) => item.sectionId === input.sectionId);
  const roster = getSectionStudents(input.sectionId);
  const midterm = sectionAssessments.find((item) => item.category === "Midterm");
  const final = sectionAssessments.find((item) => item.category === "Final");

  return roster.map((student) => {
    const categoryPercents: Record<string, number> = {};
    let coursePercent = 0;

    for (const category of sectionCategories) {
      const items = sectionAssessments.filter((item) => item.category === category.name);
      let categorySum = 0;
      for (let index = 0; index < category.count; index += 1) {
        const item = items[index];
        if (!item) continue; // missing scheduled item contributes zero
        const marks = marksFor(item, student.id, input);
        categorySum += marks == null ? 0 : (marks / item.maxMarks) * 100;
      }
      const percent = category.count > 0 ? categorySum / category.count : 0;
      categoryPercents[category.name] = percent;
      coursePercent += percent * (category.weight / 100);
    }

    const complete = Boolean(
      midterm && final &&
        marksFor(midterm, student.id, input) != null &&
        marksFor(final, student.id, input) != null,
    );
    const grade = complete ? gradeForPercent(coursePercent) : { letter: "—", gradePoints: 0 };

    return {
      studentId: student.id,
      studentName: student.name,
      categoryPercents,
      coursePercent,
      ...grade,
      complete,
    };
  });
}
