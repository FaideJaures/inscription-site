import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  registrationType: { type: String, enum: ["solo", "groupe"], required: true },
  groupName: { type: String },
  project: {
    titre: { type: String, required: true },
    descriptif: String,
    langages: String,
    autres: String,
  },
  members: [{
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true },
    etablissement: String,
    niveau: String,
    specialite: String,
  }],
}, { timestamps: true });

const User = models.User || model("User", userSchema);

export default User;