export type AdminMember = {
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  email: string;
  etablissement: string;
  niveau: string;
  specialite: string;
  /** Proven with a code at registration (not tracked before 2026). */
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type AdminRegistration = {
  id: string;
  edition: number;
  registrationType: "solo" | "groupe";
  groupName: string;
  email: string;
  createdAt: string;
  project: { titre: string; descriptif: string; langages: string; autres: string };
  members: AdminMember[];
};
