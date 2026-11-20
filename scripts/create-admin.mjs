// Creates (or resets the password of) an admin account.
//
//   MONGODB_URI=... npm run create-admin -- admin@example.com "un-mot-de-passe-solide"
//
// Admins live in the `users` collection, like in the 2025 app, so existing
// admin accounts keep working without running this at all.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [email, password] = process.argv.slice(2);
const uri = "";

if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}
if (!email || !password || password.length < 10) {
  console.error('Usage: npm run create-admin -- <email> "<password of 10+ characters>"');
  process.exit(1);
}

await mongoose.connect(uri);
const users = mongoose.connection.collection("users");
const hash = await bcrypt.hash(password, 10);
const result = await users.updateOne(
  { email: email.trim().toLowerCase() },
  {
    $set: { password: hash, role: "admin", name: "Administrateur", updatedAt: new Date() },
    $setOnInsert: { email: email.trim().toLowerCase(), createdAt: new Date(), members: [] },
  },
  { upsert: true },
);
console.log(result.upsertedCount ? `Admin created: ${email}` : `Admin updated: ${email}`);
await mongoose.disconnect();
