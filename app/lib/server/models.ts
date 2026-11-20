import "server-only";
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const memberSchema = new Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    sexe: { type: String, enum: ["M", "F"] },
    telephone: { type: String, default: "" },
    email: { type: String, required: true },
    etablissement: String,
    niveau: String,
    specialite: String,
    emailVerifiedAt: Date,
    phoneVerifiedAt: Date,
  },
  { _id: false },
);

/**
 * A registration for one edition.
 *
 * Its own collection, not the legacy `users` one: that collection has a
 * unique index on `email`, so anyone who took part in 2025 could never sign up
 * again with the same address. Here an address is unique per edition only.
 */
const registrationSchema = new Schema(
  {
    edition: { type: Number, required: true, index: true },
    registrationType: { type: String, enum: ["solo", "groupe"], required: true },
    groupName: { type: String, required: true },
    /** The first member's address: the contact for the whole registration. */
    email: { type: String, required: true },
    project: {
      titre: { type: String, required: true },
      descriptif: String,
      langages: String,
      autres: String,
    },
    members: { type: [memberSchema], required: true },
    acceptedTermsAt: { type: Date, required: true },
  },
  { timestamps: true },
);

registrationSchema.index({ edition: 1, email: 1 }, { unique: true });
registrationSchema.index({ edition: 1, "members.email": 1 });

export type RegistrationDoc = InferSchemaType<typeof registrationSchema>;

export const Registration: Model<RegistrationDoc> =
  (models.Registration as Model<RegistrationDoc>) || model<RegistrationDoc>("Registration", registrationSchema);

/**
 * The 2025 app's collection. Still read for two things: admin accounts
 * (role "admin", bcrypt hash in `password`) and the 2025 registrations, shown
 * as an archive in the admin. Never written to by registrations any more.
 */
const legacyUserSchema = new Schema(
  {
    name: String,
    sexe: { type: String, enum: ["M", "F"] },
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    registrationType: { type: String, enum: ["solo", "groupe"] },
    groupName: String,
    project: { titre: String, descriptif: String, langages: String, autres: String },
    members: [
      {
        nom: String,
        prenom: String,
        telephone: String,
        email: String,
        etablissement: String,
        niveau: String,
        specialite: String,
      },
    ],
  },
  { timestamps: true, collection: "users" },
);

export type LegacyUserDoc = InferSchemaType<typeof legacyUserSchema>;

export const LegacyUser: Model<LegacyUserDoc> =
  (models.User as Model<LegacyUserDoc>) || model<LegacyUserDoc>("User", legacyUserSchema);

/**
 * One proof that someone controls an address or a phone number. Only the
 * bcrypt hash of the code is stored. The row deletes itself at `expiresAt`
 * (TTL index): 10 min while a code is pending, longer once confirmed, and
 * `consumedAt` is set when a registration uses it, so one proof serves once.
 */
const verificationSchema = new Schema(
  {
    edition: { type: Number, required: true },
    channel: { type: String, enum: ["email", "phone"], required: true },
    /** Normalised: lowercase address, or E.164 number. */
    target: { type: String, required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationSchema.index({ channel: 1, target: 1 });

export type VerificationDoc = InferSchemaType<typeof verificationSchema>;

export const Verification: Model<VerificationDoc> =
  (models.Verification as Model<VerificationDoc>) || model<VerificationDoc>("Verification", verificationSchema);

/**
 * Fixed-window counters for rate limiting, shared by every server instance
 * (an in-memory map would reset on each deploy and multiply per instance).
 */
const rateCounterSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

rateCounterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateCounterDoc = InferSchemaType<typeof rateCounterSchema>;

export const RateCounter: Model<RateCounterDoc> =
  (models.RateCounter as Model<RateCounterDoc>) || model<RateCounterDoc>("RateCounter", rateCounterSchema);
