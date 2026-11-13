/**
 * Server-only accessor for hidden pset testbenches. Import this from route
 * handlers and scripts ONLY — never from client components.
 */
import type { PSetTestSpec } from "../tests-content/types";
import { PSETS_ALL } from "./psets/index";

export function getPSetTests(key: string): PSetTestSpec | null {
  return PSETS_ALL[key] ?? null;
}

export function psetKey(chapterSlug: string, psetSlug: string): string {
  return `${chapterSlug}:${psetSlug}`;
}