import { NextResponse } from "next/server";
import connectDB, { DatabaseNotConfiguredError } from "@/app/lib/server/mongodb";
import { Registration, Verification } from "@/app/lib/server/models";
import { EDITION, REGISTRATION_OPEN } from "@/app/lib/contest";
import { normalizeRegistration, validateRegistration, type RegistrationInput } from "@/app/lib/registration";

export async function POST(req: Request) {
  if (!REGISTRATION_OPEN) {
    return NextResponse.json({ message: "Les inscriptions sont closes." }, { status: 403 });
  }

  let body: RegistrationInput & { acceptedTerms?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || body.acceptedTerms !== true) {
    return NextResponse.json({ message: "Le règlement doit être accepté." }, { status: 400 });
  }

  const errors = validateRegistration(body);
  if (errors) {
    return NextResponse.json({ message: errors.form ?? "Certains champs sont invalides.", errors }, { status: 400 });
  }

  const data = normalizeRegistration(body);
  const emails = data.members.map((m) => m.email);

  try {
    await connectDB();

    // One person, one registration per edition — whether they lead it or not.
    const clash = await Registration.findOne(
      { edition: EDITION, $or: [{ email: { $in: emails } }, { "members.email": { $in: emails } }] },
      { email: 1, "members.email": 1 },
    ).lean();
    if (clash) {
      const taken = new Set([clash.email, ...clash.members.map((m) => m.email)]);
      const already = emails.filter((email) => taken.has(email));
      return NextResponse.json(
        {
          message: `${already.length > 1 ? "Ces adresses sont déjà inscrites" : "Cette adresse est déjà inscrite"} à l'édition en cours : ${already.join(", ")}.`,
        },
        { status: 409 },
      );
    }

    // Every member's address and number must have been proven with a code.
    const now = new Date();
    const proofs = await Verification.find(
      {
        edition: EDITION,
        verifiedAt: { $ne: null },
        consumedAt: null,
        expiresAt: { $gt: now },
        $or: [
          { channel: "email", target: { $in: emails } },
          { channel: "phone", target: { $in: data.members.map((m) => m.telephone).filter(Boolean) } },
        ],
      },
      { channel: 1, target: 1, verifiedAt: 1 },
    ).lean();
    const proofOf = (channel: "email" | "phone", target: string) =>
      proofs.find((p) => p.channel === channel && p.target === target);
    const unverified = data.members.map((m) => ({
      ...(proofOf("email", m.email) ? {} : { email: "Adresse non vérifiée." }),
    }));
    if (unverified.some((e) => Object.keys(e).length > 0)) {
      return NextResponse.json(
        {
          message: "Chaque adresse e-mail doit être vérifiée avec un code avant l'envoi.",
          errors: { members: unverified, project: {} },
        },
        { status: 400 },
      );
    }

    const created = await Registration.create({
      edition: EDITION,
      registrationType: data.type,
      groupName: data.groupName,
      email: data.members[0].email,
      project: data.project,
      members: data.members.map((m) => ({
        ...m,
        emailVerifiedAt: proofOf("email", m.email)?.verifiedAt,
        phoneVerifiedAt: proofOf("phone", m.telephone)?.verifiedAt,
      })),
      acceptedTermsAt: now,
    });

    // One proof, one registration.
    await Verification.updateMany({ _id: { $in: proofs.map((p) => p._id) } }, { $set: { consumedAt: new Date() } });

    return NextResponse.json({ message: "Inscription enregistrée.", id: String(created._id) }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ message: "Cette adresse est déjà inscrite à l'édition en cours." }, { status: 409 });
    }
    console.error(error instanceof DatabaseNotConfiguredError ? "register: MONGODB_URI is not set" : "register:", error);
    return NextResponse.json(
      { message: "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
