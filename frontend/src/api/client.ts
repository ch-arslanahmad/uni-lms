// Phase 1 API seam. Pages import from src/api/, never from src/mock/ directly.
// Replacing mockApi.loadTeacherSnapshot with fetch() is the Phase 2 change.

import { useEffect, useState } from "react";
import {
  teacherAssessments,
  teacherSubmissions,
  teacherQuestions,
  teacherMaterials,
  teacherAnnouncements,
  teacherEvents,
  assessmentQuestions,
  assessmentAttempts,
  assessmentAnswers,
  gradeCategories,
  sectionResultStates,
  getTeacherProfile,
  type AssessmentAnswer,
  type AssessmentAttempt,
  type AssessmentQuestion,
  type GradeCategory,
  type SectionResultState,
  type TeacherAnnouncement,
  type TeacherAssessment,
  type TeacherEvent,
  type TeacherMaterial,
  type TeacherQuestion,
  type TeacherSubmission,
  type SubmissionFile,
} from "../mock/teacher";

export interface TeacherSnapshot {
  assessments: TeacherAssessment[];
  submissions: TeacherSubmission[];
  questions: TeacherQuestion[];
  materials: TeacherMaterial[];
  announcements: TeacherAnnouncement[];
  events: TeacherEvent[];
  assessmentQuestions: AssessmentQuestion[];
  assessmentAttempts: AssessmentAttempt[];
  assessmentAnswers: AssessmentAnswer[];
  categories: GradeCategory[];
  resultStates: SectionResultState[];
}

export type SavedTeacherSnapshot = Partial<TeacherSnapshot>;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Shared by every localStorage-backed workspace so keys never drift.
export const TEACHER_SNAPSHOT_KEY = "uni-lms.teacher-snapshot.v2";
export const TEACHER_SNAPSHOT_VERSION = 3;

// Stored snapshots carry a version so older saved state can be merged with
// newly seeded records instead of hiding them.
export interface PersistedTeacherSnapshot {
  version: number;
  data: TeacherSnapshot;
}

// Every reader of the teacher snapshot must see the saved state, not the seeds.
// Older flat snapshots stay readable during the Phase 1 migration.
export function readSavedTeacherSnapshot(): SavedTeacherSnapshot {
  try {
    const raw = localStorage.getItem(TEACHER_SNAPSHOT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedTeacherSnapshot | SavedTeacherSnapshot;
    if (parsed && typeof parsed === "object" && "data" in parsed && parsed.data) {
      return parsed.data as SavedTeacherSnapshot;
    }
    return parsed as SavedTeacherSnapshot;
  } catch {
    return {};
  }
}

// Phase 1 identity/time helpers: mutations record the signed-in teacher and the
// real time instead of seed values.
export function currentTeacherName(): string {
  return getTeacherProfile()?.name ?? "Teacher";
}

export function nowTimestamp(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

export const mockApi = {
  async loadTeacherSnapshot(): Promise<TeacherSnapshot> {
    await delay(150); // lets the loading state be visible in Phase 1
    return clone({
      assessments: teacherAssessments,
      submissions: teacherSubmissions,
      questions: teacherQuestions,
      materials: teacherMaterials,
      announcements: teacherAnnouncements,
      events: teacherEvents,
      assessmentQuestions,
      assessmentAttempts,
      assessmentAnswers,
      categories: gradeCategories,
      resultStates: sectionResultStates,
    });
  },
};

// Phase 1 file storage: keep the real bytes as a data URL in the mock snapshot.
// Phase 2 replaces this with an upload endpoint returning a stored file URL.
export function fileToSubmissionFile(file: File): Promise<SubmissionFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      url: String(reader.result),
    });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export interface ApiQuery<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useApiQuery<T>(loader: () => Promise<T>, deps: unknown[] = [], enabled = true): ApiQuery<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setData(null);
    setLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Could not load data.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, enabled]);

  return { data, loading, error, retry: () => setNonce((value) => value + 1) };
}
