import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/server/mongodb";
import { Verification } from "@/app/lib/server/models";
import { clientIp, hit, HOUR } from "@/app/lib/server/rateLimit";
import { fail, readTarget } from "@/app/lib/server/verificationServer";
import { EDITION } from "@/app/lib/contest";
import { CODE_LENGTH, MAX_ATTEMPTS, VERIFIED_TTL_MS } from "@/app/lib/verification";

/** Checks a code; on success the proof is kept for an hour, until the registration uses it. */
export async function POST(req: Request) {
  const parsed = await readTarget(req);
  if (parsed instanceof NextResponse) return parsed;
  const { channel, target, body } = parsed;
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code)) return fail("INVALID_CODE", 400);

  try {
    await connectDB();

    const allowed = await hit([
      { name: "vconfirm-target", id: `${channel}:${target}`, max: 10, windowMs: HOUR },
      { name: "vconfirm-ip", id: clientIp(req), max: 40, windowMs: HOUR },
    ]);
    if (!allowed) return fail("RATE_LIMITED", 429);

    const row = await Verification.findOne({ edition: EDITION, channel, target }).sort({ createdAt: -1 });
    if (!row) return fail("NO_PENDING_VERIFICATION", 404);
    if (row.consumedAt) return fail("VERIFICATION_ALREADY_USED", 409);
    if (row.expiresAt.getTime() <= Date.now()) return fail("CODE_EXPIRED", 410);
    if (row.verifiedAt) return NextResponse.json({ verified: true });
    if (row.attempts >= MAX_ATTEMPTS) return fail("TOO_MANY_ATTEMPTS", 429);

    if (!(await bcrypt.compare(code, row.codeHash))) {
      await Verification.updateOne({ _id: row._id }, { $inc: { attempts: 1 } });
      return fail(row.attempts + 1 >= MAX_ATTEMPTS ? "TOO_MANY_ATTEMPTS" : "INVALID_CODE", 400);
    }

    await Verification.updateOne(
      { _id: row._id },
      { $set: { verifiedAt: new Date(), expiresAt: new Date(Date.now() + VERIFIED_TTL_MS) } },
    );
    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("verification confirm:", error);
    return fail("UNAVAILABLE", 500);
  }
}
