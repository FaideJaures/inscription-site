/**
 * Contact verification rules shared by the form and the API: how a phone
 * number or an address is normalised (the key a proof is stored under), the
 * timings, and the error codes the UI turns into sentences.
 */

export type VerificationChannel = "email" | "phone";

export const CODE_LENGTH = 6;
/** A sent code is valid this long. */
export const CODE_TTL_MS = 10 * 60 * 1000;
/** A confirmed proof is kept this long: long enough to fill in the rest of the form. */
export const VERIFIED_TTL_MS = 60 * 60 * 1000;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_S = 30;

export const DEFAULT_DIAL = "+241";

/** Dial codes offered next to the phone field. Gabon first. */
export const DIAL_CODES = [
  { code: "+241", label: "GA +241" },
  { code: "+237", label: "CM +237" },
  { code: "+242", label: "CG +242" },
  { code: "+243", label: "CD +243" },
  { code: "+240", label: "GQ +240" },
  { code: "+235", label: "TD +235" },
  { code: "+236", label: "CF +236" },
  { code: "+225", label: "CI +225" },
  { code: "+221", label: "SN +221" },
  { code: "+33", label: "FR +33" },
];

export type VerificationErrorCode =
  | "INVALID_TARGET"
  | "ALREADY_REGISTERED"
  | "RATE_LIMITED"
  | "DELIVERY_FAILED"
  | "INVALID_CODE"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "NO_PENDING_VERIFICATION"
  | "VERIFICATION_ALREADY_USED"
  | "UNAVAILABLE";

export const VERIFICATION_MESSAGES: Record<VerificationErrorCode, string> = {
  INVALID_TARGET: "Valeur invalide.",
  ALREADY_REGISTERED: "Déjà inscrit à l'édition en cours.",
  RATE_LIMITED: "Trop de demandes. Réessayez plus tard.",
  DELIVERY_FAILED: "Le code n'a pas pu être envoyé. Vérifiez la saisie et réessayez.",
  INVALID_CODE: "Code incorrect.",
  CODE_EXPIRED: "Code expiré. Demandez-en un nouveau.",
  TOO_MANY_ATTEMPTS: "Trop d'essais. Demandez un nouveau code.",
  NO_PENDING_VERIFICATION: "Aucun code en attente. Demandez-en un.",
  VERIFICATION_ALREADY_USED: "Cette vérification a déjà servi.",
  UNAVAILABLE: "Vérification momentanément indisponible.",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const E164 = /^\+[1-9]\d{7,14}$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * E.164 form ("+24107123456"). Separators are dropped and "00" becomes "+".
 * A number typed without a country code gets `dial` (Gabon by default). The
 * leading 0 is kept: Gabonese numbers keep it after +241.
 */
export function normalizePhone(value: string, dial = DEFAULT_DIAL): string {
  let v = value.trim().replace(/[\s.()-]/g, "");
  if (v.startsWith("00")) v = `+${v.slice(2)}`;
  if (!v.startsWith("+")) v = `${dial}${v}`;
  return v;
}

export function normalizeTarget(channel: VerificationChannel, value: string): string {
  return channel === "email" ? normalizeEmail(value) : normalizePhone(value);
}

export function isValidTarget(channel: VerificationChannel, normalized: string): boolean {
  return channel === "email" ? EMAIL.test(normalized) && normalized.length <= 160 : E164.test(normalized);
}

/** Splits a stored E.164 value back into the dial-code select and the national part. */
/** The phone is optional: a lone dial code ("+241") counts as nothing typed. */
export function hasPhone(value: string): boolean {
  return /\d/.test(splitPhone(value).national);
}

export function splitPhone(value: string): { dial: string; national: string } {
  const v = value.trim();
  const match = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length).find((d) => v.startsWith(d.code));
  if (match) return { dial: match.code, national: v.slice(match.code.length) };
  if (v.startsWith("+")) return { dial: "", national: v };
  return { dial: DEFAULT_DIAL, national: v };
}
