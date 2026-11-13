/**
 * Client-safe lesson test accessor. Returns the bundled lesson testbench,
 * starter files, and declared test names for the workspace UI and the
 * /api/sim call. Lesson benches are intentionally client-visible
 * (freeCodeCamp-style): the graded problem-set benches are NOT — they live in
 * lib/server/psets and are only reachable from app/api/grade.
 */
import type { LessonTestSpec } from "./tests-content/types";
import { LESSON_TESTS_ALL } from "./tests-content/lessons";

export function getLessonTests(key: string): LessonTestSpec | null {
  return LESSON_TESTS_ALL[key] ?? null;
}

export function lessonTestKey(
  chapterSlug: string,
  lessonSlug: string,
): string {
  return `${chapterSlug}:${lessonSlug}`;
}