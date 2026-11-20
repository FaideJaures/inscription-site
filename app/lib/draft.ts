import { YEAR } from "./contest";
import type { Member, Project, RegistrationType } from "./registration";

/**
 * The form in progress, kept in this browser only so a closed tab or a dropped
 * connection does not cost the visitor their typing. Nothing here is sent
 * anywhere until they submit.
 */
export type Draft = {
  type: RegistrationType;
  groupName: string;
  members: Member[];
  project: Project;
  step: number;
  /** "email:<address>" / "phone:<E.164>" proven with a code (the server re-checks at send). */
  verified?: string[];
};

const KEY = `mbaya-inscription-${YEAR}`;

export function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft;
    if ((draft.type !== "solo" && draft.type !== "groupe") || !Array.isArray(draft.members)) return null;
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage blocked — the form still works, it just won't survive a reload.
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

export function draftHasContent(draft: Draft | null): boolean {
  if (!draft) return false;
  const filled = (value: string) => value.trim() !== "";
  return (
    filled(draft.groupName) ||
    Object.values(draft.project).some(filled) ||
    draft.members.some((m) => [m.nom, m.prenom, m.telephone, m.email, m.specialite].some(filled))
  );
}
