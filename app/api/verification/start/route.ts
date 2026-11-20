import { randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/server/mongodb";
import { Registration, Verification } from "@/app/lib/server/models";
import { OmniError, omniConfigured, sendEmail, sendWhatsApp } from "@/app/lib/server/omni";
import { clientIp, hit, HOUR } from "@/app/lib/server/rateLimit";
import { fail, readTarget } from "@/app/lib/server/verificationServer";
import { CONTEST_NAME, EDITION } from "@/app/lib/contest";
import { CODE_TTL_MS } from "@/app/lib/verification";

/** Dev only: print codes to the server console instead of sending them. */
const LOG_CODES = process.env.NODE_ENV !== "production" && process.env.VERIFICATION_LOG_CODES === "1";

/**
 * Sends a 6-digit code to an address or a phone number. Only its hash is
 * kept; a new request replaces any code still pending for the same target.
 */
export async function POST(req: Request) {
  const parsed = await readTarget(req);
  if (parsed instanceof NextResponse) return parsed;
  const { channel, target } = parsed;

  if (!LOG_CODES && !omniConfigured()) {
    console.error("verification: OMNI_API_URL / OMNI_API_KEY / OMNI_SHOP not set");
    return fail("UNAVAILABLE", 503);
  }

  try {
    await connectDB();

    const allowed = await hit([
      { name: "vstart-target", id: `${channel}:${target}`, max: 5, windowMs: HOUR },
      { name: "vstart-ip", id: clientIp(req), max: 20, windowMs: HOUR },
    ]);
    if (!allowed) return fail("RATE_LIMITED", 429);

    // No point proving an address that the registration would refuse anyway.
    const taken =
      channel === "email"
        ? await Registration.exists({ edition: EDITION, $or: [{ email: target }, { "members.email": target }] })
        : await Registration.exists({ edition: EDITION, "members.telephone": target });
    if (taken) return fail("ALREADY_REGISTERED", 409);

    const code = randomInt(100000, 1000000).toString();
    await Verification.deleteMany({ edition: EDITION, channel, target, consumedAt: null });
    const row = await Verification.create({
      edition: EDITION,
      channel,
      target,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    try {
      if (LOG_CODES) {
        console.info(`[verification] ${channel} ${target} → ${code}`);
      } else if (channel === "email") {
        await sendEmail(
          target,
          `Code ${CONTEST_NAME} : ${code}`,
          `Votre code de vérification ${CONTEST_NAME} : ${code}\n\nValable 10 minutes. Si vous n'avez pas demandé ce code, ignorez ce message.`,
          `mbaya-otp-${randomUUID()}`,
        );
      } else {
        await sendWhatsApp(target, `Votre code ${CONTEST_NAME} : ${code} (valable 10 min).`, `mbaya-otp-${randomUUID()}`);
      }
    } catch (error) {
      await Verification.deleteOne({ _id: row._id });
      console.error("verification: delivery failed", error instanceof OmniError ? `${error.status} ${error.code} ${error.message}` : error);
      return fail("DELIVERY_FAILED", 502);
    }

    return NextResponse.json({ started: true, expiresInSeconds: CODE_TTL_MS / 1000 });
  } catch (error) {
    console.error("verification start:", error);
    return fail("UNAVAILABLE", 500);
  }
}
