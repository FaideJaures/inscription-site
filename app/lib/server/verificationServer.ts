import "server-only";
import { NextResponse } from "next/server";
import { REGISTRATION_OPEN } from "@/app/lib/contest";
import {
  isValidTarget,
  normalizeTarget,
  VERIFICATION_MESSAGES,
  type VerificationChannel,
  type VerificationErrorCode,
} from "@/app/lib/verification";

export function fail(code: VerificationErrorCode, status: number) {
  return NextResponse.json({ code, message: VERIFICATION_MESSAGES[code] }, { status });
}

/** Parses `{ channel, value }` into a normalised target, or the response to send back. */
export async function readTarget(
  req: Request,
): Promise<{ channel: VerificationChannel; target: string; body: Record<string, unknown> } | NextResponse> {
  if (!REGISTRATION_OPEN) return NextResponse.json({ message: "Les inscriptions sont closes." }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_TARGET", 400);
  }
  const channel = body?.channel;
  if ((channel !== "email" && channel !== "phone") || typeof body.value !== "string") return fail("INVALID_TARGET", 400);
  const target = normalizeTarget(channel, body.value);
  if (!isValidTarget(channel, target)) return fail("INVALID_TARGET", 400);
  return { channel, target, body };
}
