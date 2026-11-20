import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/server/mongodb";
import { LegacyUser, Registration } from "@/app/lib/server/models";
import { EDITION } from "@/app/lib/contest";
import type { AdminRegistration } from "@/app/lib/admin-types";

// Compared against when the address is unknown, so a wrong e-mail and a wrong
// password take the same time to answer.
const DUMMY_HASH = "$2b$10$ZfvHqJmmGCbdtTzdT8FlwOexacDzxVJZ.ZrEKbYVOlkOKVjYjKgWO";

const text = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * Credentials travel in the body of a POST — the 2025 version put them in the
 * query string of a GET, where they ended up in every access log.
 */
export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown; scope?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible." }, { status: 400 });
  }
  const email = text(body.email).trim().toLowerCase();
  const password = text(body.password);
  const scope = body.scope === "archive" ? "archive" : "current";
  if (!email || !password) {
    return NextResponse.json({ message: "E-mail et mot de passe requis." }, { status: 400 });
  }

  try {
    await connectDB();
    const admin = await LegacyUser.findOne({ email, role: "admin" }).lean();
    const valid = await bcrypt.compare(password, admin?.password || DUMMY_HASH);
    if (!admin || !valid) {
      return NextResponse.json({ message: "Identifiants invalides, ou ce compte n'est pas administrateur." }, { status: 401 });
    }

    let registrations: AdminRegistration[];
    if (scope === "current") {
      const docs = await Registration.find({ edition: EDITION }).sort({ createdAt: -1 }).lean();
      registrations = docs.map((doc) => ({
        id: String(doc._id),
        edition: doc.edition,
        registrationType: doc.registrationType,
        groupName: doc.groupName,
        email: doc.email,
        createdAt: new Date(doc.createdAt).toISOString(),
        project: {
          titre: text(doc.project?.titre),
          descriptif: text(doc.project?.descriptif),
          langages: text(doc.project?.langages),
          autres: text(doc.project?.autres),
        },
        members: doc.members.map((m) => ({
          nom: m.nom,
          prenom: m.prenom,
          sexe: text(m.sexe),
          telephone: m.telephone,
          email: m.email,
          etablissement: text(m.etablissement),
          niveau: text(m.niveau),
          specialite: text(m.specialite),
          emailVerified: Boolean(m.emailVerifiedAt),
          phoneVerified: Boolean(m.phoneVerifiedAt),
        })),
      }));
    } else {
      // The 2025 edition, as the previous app stored it.
      const docs = await LegacyUser.find({ role: "user" }, { password: 0 }).sort({ createdAt: -1 }).lean();
      registrations = docs.map((doc) => ({
        id: String(doc._id),
        edition: EDITION - 1,
        registrationType: doc.registrationType === "groupe" ? "groupe" : "solo",
        groupName: text(doc.groupName) || text(doc.name),
        email: text(doc.email),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
        project: {
          titre: text(doc.project?.titre),
          descriptif: text(doc.project?.descriptif),
          langages: text(doc.project?.langages),
          autres: text(doc.project?.autres),
        },
        members: (doc.members ?? []).map((m, i) => ({
          nom: text(m.nom),
          prenom: text(m.prenom),
          // 2025 kept only the account holder's sex, not each member's.
          sexe: i === 0 ? text(doc.sexe) : "",
          telephone: text(m.telephone),
          email: text(m.email),
          etablissement: text(m.etablissement),
          niveau: text(m.niveau),
          specialite: text(m.specialite),
        })),
      }));
    }

    return NextResponse.json({ scope, edition: scope === "current" ? EDITION : EDITION - 1, registrations });
  } catch (error) {
    console.error("admin/registrations:", error);
    return NextResponse.json({ message: "Base de données injoignable." }, { status: 500 });
  }
}
