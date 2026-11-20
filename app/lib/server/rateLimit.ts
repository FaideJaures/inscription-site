import "server-only";
import { RateCounter } from "./models";

export type Limit = { name: string; id: string; max: number; windowMs: number };

/**
 * Counts one hit against every limit and says whether all of them still allow
 * it. Fixed windows stored in Mongo, so the count holds across instances and
 * deploys. Call after connectDB().
 */
export async function hit(limits: Limit[]): Promise<boolean> {
  const now = Date.now();
  const counts = await Promise.all(
    limits.map(async ({ name, id, windowMs }) => {
      const bucket = Math.floor(now / windowMs);
      const key = `${name}:${id}:${bucket}`;
      const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * windowMs) } };
      try {
        const doc = await RateCounter.findOneAndUpdate({ key }, update, { upsert: true, new: true }).lean();
        return doc?.count ?? 1;
      } catch (error) {
        // Two first hits raced on the upsert: the other one created the row.
        if ((error as { code?: number }).code !== 11000) throw error;
        const doc = await RateCounter.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { new: true }).lean();
        return doc?.count ?? 1;
      }
    }),
  );
  return counts.every((count, i) => count <= limits[i].max);
}

/** The visitor's IP as the platform's proxy reports it. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export const HOUR = 60 * 60 * 1000;
