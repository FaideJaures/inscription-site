/**
 * Everything that changes from one edition to the next lives here.
 *
 * Bump EDITION / YEAR, set EVENT_DATE once the organising committee has fixed
 * it, and every page — hero, timeline, form, admin — follows.
 */

export const CONTEST_NAME = "MBAYA CODE CONTEST";
export const EDITION = 4;
export const YEAR = 2026;

/**
 * ISO date of the final presentation (e.g. "2026-12-12"), or null while the
 * committee has not announced it. Null renders "Date annoncée prochainement"
 * everywhere instead of an invented date.
 */
export const EVENT_DATE: string | null = null;

/** Flip to false to close the form; the pages then say so instead of linking to it. */
export const REGISTRATION_OPEN = true;

export const CONTACT_PHONE = "+241 02 35 31 34";
export const CONTACT_PHONE_HREF = "tel:+24102353134";

/** "4ᵉ édition" — the superscript ordinal the French typography expects. */
export const EDITION_LABEL = `${EDITION}ᵉ édition`;

export function formatEventDate(iso: string | null = EVENT_DATE): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export const EVENT_DATE_LABEL = formatEventDate() ?? "Date annoncée prochainement";

export const PARTNERS = [
  { name: "CGI", src: "/partenaires/cgi.png", width: 1080, height: 1080 },
  { name: "Airtel", src: "/partenaires/airtel.png", width: 2500, height: 874 },
];

export const SCHOOLS = [
  { value: "USTM", name: "USTM", src: "/schools/USTM.png", width: 600, height: 600 },
  { value: "INPTIC", name: "INPTIC", src: "/schools/INPTIC-logo.png", width: 553, height: 538 },
  { value: "ITA", name: "ITA", src: "/schools/logo-ITA.jpg", width: 729, height: 734 },
  { value: "IAI", name: "IAI", src: "/schools/IAI-Gabon.jpg", width: 400, height: 250 },
];

export const LMD_LEVELS = [
  { value: "L1", label: "Licence 1 (L1)" },
  { value: "L2", label: "Licence 2 (L2)" },
  { value: "L3", label: "Licence 3 (L3)" },
  { value: "M1", label: "Master 1 (M1)" },
  { value: "M2", label: "Master 2 (M2)" },
  { value: "D1", label: "Doctorat 1ʳᵉ année (D1)" },
  { value: "D2", label: "Doctorat 2ᵉ année (D2)" },
  { value: "D3", label: "Doctorat 3ᵉ année (D3)" },
];

export const OTHER_SCHOOL = "others";

/** Photos of the previous editions, as shipped in public/contestN/pics. */
export const PAST_EDITIONS = [
  { edition: 1, label: "Première édition", folder: "contest1", count: 19, width: 1080, height: 810 },
  { edition: 2, label: "Deuxième édition", folder: "contest2", count: 59, width: 1080, height: 720 },
];

export function editionPhotos(folder: string, count: number) {
  return Array.from({ length: count }, (_, i) => `/${folder}/pics/${i + 1}.jpg`);
}
