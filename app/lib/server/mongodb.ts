import "server-only";
import mongoose, { type Mongoose } from "mongoose";

declare global {
  var mongooseCache: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined;
}

const cache = (globalThis.mongooseCache ??= { conn: null, promise: null });

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not set");
  }
}

/**
 * One connection per server instance, reused across requests (and across hot
 * reloads in dev). Throws rather than crashing at import time, so a missing
 * MONGODB_URI fails the request that needs the database and nothing else.
 */
export default async function connectDB(): Promise<Mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseNotConfiguredError();
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}
