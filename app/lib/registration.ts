/**
 * The registration's shape and its rules, shared by the form and the API so
 * the two can never disagree about what "valid" means.
 */
import { LMD_LEVELS, OTHER_SCHOOL, SCHOOLS } from "./contest";
import { hasPhone, isValidTarget, normalizePhone } from "./verification";

export type RegistrationType = "solo" | "groupe";

export type Member = {
  nom: string;
  prenom: string;
  sexe: "M" | "F";
  telephone: string;
  email: string;
  /** A SCHOOLS value, or OTHER_SCHOOL with `etablissementCustom` filled in. */
  etablissement: string;
  etablissementCustom: string;
  niveau: string;
  specialite: string;
};

export type Project = {
  titre: string;
  descriptif: string;
  langages: string;
  autres: string;
};

export type RegistrationInput = {
  type: RegistrationType;
  groupName: string;
  members: Member[];
  project: Project;
};

export type MemberErrors = Partial<Record<keyof Member, string>>;
export type ProjectErrors = Partial<Record<keyof Project, string>>;
export type RegistrationErrors = {
  groupName?: string;
  members: MemberErrors[];
  project: ProjectErrors;
  form?: string;
};

export const MIN_GROUP_MEMBERS = 2;
export const DUPLICATE_PHONE = "Ce numéro est déjà utilisé par un autre membre.";
export const MAX_MEMBERS = 10;

export const EMPTY_MEMBER: Member = {
  nom: "",
  prenom: "",
  sexe: "M",
  telephone: "",
  email: "",
  etablissement: "",
  etablissementCustom: "",
  niveau: "",
  specialite: "",
};

export const EMPTY_PROJECT: Project = { titre: "", descriptif: "", langages: "", autres: "" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = { short: 80, medium: 160, long: 3000 };

const blank = (value: unknown) => typeof value !== "string" || value.trim() === "";
const tooLong = (value: string, max: number) => value.trim().length > max;

export function validateMember(member: Member): MemberErrors {
  const errors: MemberErrors = {};
  if (blank(member.nom)) errors.nom = "Le nom est requis.";
  else if (tooLong(member.nom, LIMITS.short)) errors.nom = "Le nom est trop long.";
  if (blank(member.prenom)) errors.prenom = "Le prénom est requis.";
  else if (tooLong(member.prenom, LIMITS.short)) errors.prenom = "Le prénom est trop long.";
  if (member.sexe !== "M" && member.sexe !== "F") errors.sexe = "Le sexe est requis.";
  if (hasPhone(member.telephone) && !isValidTarget("phone", normalizePhone(member.telephone))) errors.telephone = "Numéro de téléphone invalide.";
  if (blank(member.email)) errors.email = "L'adresse e-mail est requise.";
  else if (!EMAIL.test(member.email.trim()) || tooLong(member.email, LIMITS.medium)) errors.email = "Format d'e-mail invalide.";
  if (blank(member.etablissement)) errors.etablissement = "L'établissement est requis.";
  else if (member.etablissement !== OTHER_SCHOOL && !SCHOOLS.some((s) => s.value === member.etablissement))
    errors.etablissement = "Établissement inconnu.";
  if (member.etablissement === OTHER_SCHOOL) {
    if (blank(member.etablissementCustom)) errors.etablissementCustom = "Précisez le nom de l'établissement.";
    else if (tooLong(member.etablissementCustom, LIMITS.medium)) errors.etablissementCustom = "Nom trop long.";
  }
  if (blank(member.niveau)) errors.niveau = "Le niveau d'études est requis.";
  else if (!LMD_LEVELS.some((l) => l.value === member.niveau)) errors.niveau = "Niveau inconnu.";
  if (blank(member.specialite)) errors.specialite = "La spécialité est requise.";
  else if (tooLong(member.specialite, LIMITS.medium)) errors.specialite = "Spécialité trop longue.";
  return errors;
}

export function validateProject(project: Project): ProjectErrors {
  const errors: ProjectErrors = {};
  if (blank(project.titre)) errors.titre = "Le titre du projet est requis.";
  else if (tooLong(project.titre, LIMITS.medium)) errors.titre = "Titre trop long.";
  if (blank(project.descriptif)) errors.descriptif = "La description du projet est requise.";
  else if (tooLong(project.descriptif, LIMITS.long)) errors.descriptif = "Description trop longue (3 000 caractères max).";
  if (blank(project.langages)) errors.langages = "Indiquez les langages ou technologies utilisés.";
  else if (tooLong(project.langages, LIMITS.medium)) errors.langages = "Liste trop longue.";
  if (typeof project.autres === "string" && tooLong(project.autres, LIMITS.long)) errors.autres = "Texte trop long.";
  return errors;
}

export function validateGroupName(type: RegistrationType, groupName: string): string | undefined {
  if (type !== "groupe") return undefined;
  if (blank(groupName)) return "Le nom du groupe est requis.";
  if (tooLong(groupName, LIMITS.short)) return "Nom de groupe trop long.";
  return undefined;
}

const isEmpty = (errors: object) => Object.keys(errors).length === 0;

export function validateRegistration(input: RegistrationInput): RegistrationErrors | null {
  const errors: RegistrationErrors = { members: [], project: {} };
  let ok = true;

  if (input.type !== "solo" && input.type !== "groupe") {
    errors.form = "Type d'inscription inconnu.";
    return errors;
  }
  const groupError = validateGroupName(input.type, input.groupName);
  if (groupError) {
    errors.groupName = groupError;
    ok = false;
  }
  if (!Array.isArray(input.members) || input.members.length === 0) {
    errors.form = "Au moins un participant est requis.";
    return errors;
  }
  if (input.type === "solo" && input.members.length !== 1) {
    errors.form = "Une inscription solo compte exactement un participant.";
    ok = false;
  }
  if (input.type === "groupe" && input.members.length < MIN_GROUP_MEMBERS) {
    errors.form = `Une équipe compte au moins ${MIN_GROUP_MEMBERS} membres.`;
    ok = false;
  }
  if (input.members.length > MAX_MEMBERS) {
    errors.form = `Une équipe compte au plus ${MAX_MEMBERS} membres.`;
    ok = false;
  }

  const emails = new Set<string>();
  const phones = new Set<string>();
  input.members.forEach((member, i) => {
    const memberErrors = validateMember(member);
    const email = typeof member.email === "string" ? member.email.trim().toLowerCase() : "";
    if (!memberErrors.email && email) {
      if (emails.has(email)) memberErrors.email = "Cette adresse est déjà utilisée par un autre membre.";
      emails.add(email);
    }
    if (!memberErrors.telephone && hasPhone(member.telephone)) {
      const phone = normalizePhone(member.telephone);
      if (phones.has(phone)) memberErrors.telephone = DUPLICATE_PHONE;
      phones.add(phone);
    }
    errors.members[i] = memberErrors;
    if (!isEmpty(memberErrors)) ok = false;
  });

  errors.project = validateProject(input.project ?? EMPTY_PROJECT);
  if (!isEmpty(errors.project)) ok = false;

  return ok ? null : errors;
}

/** Trims every string and resolves "Autres" into the school's actual name. */
export function normalizeRegistration(input: RegistrationInput) {
  const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const members = input.members.map((m) => ({
    nom: clean(m.nom),
    prenom: clean(m.prenom),
    sexe: m.sexe === "F" ? "F" : "M",
    telephone: hasPhone(clean(m.telephone)) ? normalizePhone(clean(m.telephone)) : "",
    email: clean(m.email).toLowerCase(),
    etablissement: m.etablissement === OTHER_SCHOOL ? clean(m.etablissementCustom) : clean(m.etablissement),
    niveau: clean(m.niveau),
    specialite: clean(m.specialite),
  }));
  const groupName =
    input.type === "groupe" ? clean(input.groupName) : `${members[0].prenom} ${members[0].nom}`;
  return {
    type: input.type,
    groupName,
    members,
    project: {
      titre: clean(input.project.titre),
      descriptif: clean(input.project.descriptif),
      langages: clean(input.project.langages),
      autres: clean(input.project.autres),
    },
  };
}

export function schoolLabel(member: Pick<Member, "etablissement" | "etablissementCustom">) {
  if (member.etablissement === OTHER_SCHOOL) return member.etablissementCustom.trim();
  return SCHOOLS.find((s) => s.value === member.etablissement)?.name ?? member.etablissement;
}

export function levelLabel(value: string) {
  return LMD_LEVELS.find((l) => l.value === value)?.label ?? value;
}
