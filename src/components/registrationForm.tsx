"use client";

import { useState, useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define validation types
type Member = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  etablissement: string;
  etablissementCustom?: string;
  niveau: string;
  specialite: string;
};

type Project = {
  titre: string;
  descriptif: string;
  langages: string;
  autres: string;
};

type Errors = {
  groupName?: string;
  members: Partial<Record<keyof Member, string>>[];
  project?: Partial<Record<keyof Project, string>>;
};

const LMD_LEVELS = [
  { value: "", label: "Sélectionner un niveau" },
  { value: "L1", label: "Licence 1 (L1)" },
  { value: "L2", label: "Licence 2 (L2)" },
  { value: "L3", label: "Licence 3 (L3)" },
  { value: "M1", label: "Master 1 (M1)" },
  { value: "M2", label: "Master 2 (M2)" },
  { value: "D1", label: "Doctorat 1ère année (D1)" },
  { value: "D2", label: "Doctorat 2ème année (D2)" },
  { value: "D3", label: "Doctorat 3ème année (D3)" },
];

const ETABLISSEMENTS = [
  { value: "", label: "Sélectionner un établissement" },
  { value: "USTM", label: "USTM" },
  { value: "INPTIC", label: "INPTIC" },
  { value: "ITA", label: "ITA" },
  { value: "IAI", label: "IAI" },
  { value: "others", label: "Autres" },
];

export default function RegistrationForm() {
  const router = useRouter();
  const [type, setType] = useState<"solo" | "groupe">("solo");
  const [members, setMembers] = useState<Member[]>([
    {
      nom: "",
      prenom: "",
      telephone: "",
      email: "",
      etablissement: "",
      etablissementCustom: "",
      niveau: "",
      specialite: "",
    },
  ]);
  const [groupName, setGroupName] = useState("");
  const [project, setProject] = useState<Project>({
    titre: "",
    descriptif: "",
    langages: "",
    autres: "",
  });
  const [errors, setErrors] = useState<Errors>({ members: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConditionsPopup, setShowConditionsPopup] = useState(false);
  const [pendingSubmissionData, setPendingSubmissionData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (type === "solo" && members.length > 1) {
      setMembers([members[0]]);
    }
  }, [type, members]);

  const addMember = () => {
    if (type === "groupe") {
      setMembers([
        ...members,
        {
          nom: "",
          prenom: "",
          telephone: "",
          email: "",
          etablissement: "",
          etablissementCustom: "",
          niveau: "",
          specialite: "",
        },
      ]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = { members: [] };
    let isValid = true;

    // Validate group name
    if (type === "groupe" && !groupName.trim()) {
      newErrors.groupName = "Group name is required";
      isValid = false;
    }

    // Validate members
    members.forEach((member, index) => {
      const memberErrors: Partial<Record<keyof Member, string>> = {};

      if (!member.nom.trim()) {
        memberErrors.nom = "Le nom est requis";
        isValid = false;
      }

      if (!member.prenom.trim()) {
        memberErrors.prenom = "Le prénom est requis";
        isValid = false;
      }

      if (!member.telephone.trim()) {
        memberErrors.telephone = "Le numéro de téléphone est requis";
        isValid = false;
      } else if (!/^[0-9+\s]{8,}$/.test(member.telephone)) {
        memberErrors.telephone = "Numéro de téléphone invalide";
        isValid = false;
      }

      if (!member.email.trim()) {
        memberErrors.email = "L'email est requis";
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(member.email)) {
        memberErrors.email = "Format d'email invalide";
        isValid = false;
      }

      if (!member.etablissement.trim()) {
        memberErrors.etablissement = "L'etablissement est requis";
        isValid = false;
      }

      if (
        member.etablissement === "others" &&
        !member.etablissementCustom?.trim()
      ) {
        memberErrors.etablissementCustom = "Veuillez spécifier l'établissement";
        isValid = false;
      }

      if (!member.niveau.trim()) {
        memberErrors.niveau = "Le niveau scolaire est requis";
        isValid = false;
      }

      if (!member.specialite.trim()) {
        memberErrors.specialite = "La specialite est requise";
        isValid = false;
      }

      newErrors.members[index] = memberErrors;
    });

    // Validate project
    const projectErrors: Partial<Record<keyof Project, string>> = {};

    if (!project.titre.trim()) {
      projectErrors.titre = "Le titre du projet est requis";
      isValid = false;
    }

    if (!project.descriptif.trim()) {
      projectErrors.descriptif = "La description du projet est requise";
      isValid = false;
    }

    if (!project.langages.trim()) {
      projectErrors.langages =
        "Les langages de programmation utilisés sont requis";
      isValid = false;
    }

    newErrors.project = projectErrors;

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Prepare submission data
    const finalGroupName =
      type === "solo" ? `${members[0].prenom} ${members[0].nom}` : groupName;
    const finalMembers = (type === "solo" ? members.slice(0, 1) : members).map(
      (member) => ({
        ...member,
        etablissement:
          member.etablissement === "others"
            ? member.etablissementCustom
            : member.etablissement,
      })
    );

    const data = {
      groupName: finalGroupName,
      type,
      project: {
        ...project,
        autres: project.autres.trim() || "None",
      },
      members: finalMembers,
    };

    // Store data and show conditions popup
    setPendingSubmissionData(data);
    setShowConditionsPopup(true);
  };

  const handleAcceptConditions = async () => {
    if (!pendingSubmissionData) return;

    setIsSubmitting(true);
    setShowConditionsPopup(false);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(pendingSubmissionData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 3000);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setPendingSubmissionData(null);
    }
  };

  const handleDenyConditions = () => {
    setShowConditionsPopup(false);
    setPendingSubmissionData(null);
    router.push("/");
  };

  const handleMemberChange = (
    index: number,
    field: keyof Member,
    value: string
  ) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };

    // Clear custom etablissement when changing from "others"
    if (field === "etablissement" && value !== "others") {
      newMembers[index].etablissementCustom = "";
    }

    setMembers(newMembers);

    // Clear error when user corrects
    if (errors.members[index]?.[field]) {
      const newErrors = { ...errors };
      if (newErrors.members[index]) {
        delete newErrors.members[index]![field];
        // Remove member error object if empty
        if (Object.keys(newErrors.members[index]!).length === 0) {
          newErrors.members[index] = undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      }
      setErrors(newErrors);
    }
  };

  const handleProjectChange = (field: keyof Project, value: string) => {
    setProject({ ...project, [field]: value });

    // Clear error when user corrects
    if (errors.project?.[field]) {
      const newErrors = { ...errors };
      if (newErrors.project) {
        delete newErrors.project[field];
      }
      setErrors(newErrors);
    }
  };

  // Conditions Popup Component
  const ConditionsPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Conditions d&apos;utilisation
            </h2>
            <button
              onClick={() => setShowConditionsPopup(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="mb-6">
            <Image
              width={640}
              height={480}
              src={`/conditions/condition.jpg`}
              alt={`Conditions d'utilisation`}
              className="w-full h-auto rounded-lg"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div
              style={{ display: "none" }}
              className="bg-gray-100 p-8 rounded-lg text-center"
            >
              <p className="text-gray-600">
                Image des conditions non disponible
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Veuillez accepter les conditions pour continuer
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={handleDenyConditions}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={handleAcceptConditions}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Vous êtes ajoutés!
          </h2>
          <p className="text-gray-600 mb-6">
            Votre inscription a été enregistrée avec succès.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full animate-pulse"
              style={{ width: "70%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-11/12 mx-auto md:max-w-2xl py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Information */}
          <div>
            <div className="space-y-4">
              {type === "groupe" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    Information du groupe
                  </h2>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du groupe
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group Name"
                    className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                      errors.groupName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required={type === "groupe"}
                  />
                  {errors.groupName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.groupName}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d&apos;inscription
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="solo"
                      checked={type === "solo"}
                      onChange={() => setType("solo")}
                      className="mr-2"
                    />
                    Solo
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="groupe"
                      checked={type === "groupe"}
                      onChange={() => setType("groupe")}
                      className="mr-2"
                    />
                    Groupe
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Member Details */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              {type === "solo" ? "Vos informations" : "Information des membres"}
            </h2>
            {(type === "solo" ? members.slice(0, 1) : members).map(
              (member, index) => (
                <div key={index} className="space-y-4 mb-6 border-b pb-4">
                  {type === "groupe" && (
                    <h3 className="text-lg font-semibold">
                      Membre {index + 1}
                    </h3>
                  )}

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={member.nom}
                      onChange={(e) =>
                        handleMemberChange(index, "nom", e.target.value)
                      }
                      placeholder="Nom"
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.nom
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.members[index]?.nom && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.nom}
                      </p>
                    )}
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={member.prenom}
                      onChange={(e) =>
                        handleMemberChange(index, "prenom", e.target.value)
                      }
                      placeholder="Prénom"
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.prenom
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.members[index]?.prenom && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.prenom}
                      </p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={member.telephone}
                      onChange={(e) =>
                        handleMemberChange(index, "telephone", e.target.value)
                      }
                      placeholder="Téléphone"
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.telephone
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.members[index]?.telephone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.telephone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) =>
                        handleMemberChange(index, "email", e.target.value)
                      }
                      placeholder="Email"
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.members[index]?.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.email}
                      </p>
                    )}
                  </div>

                  {/* Établissement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Établissement
                    </label>
                    <select
                      value={member.etablissement}
                      onChange={(e) =>
                        handleMemberChange(
                          index,
                          "etablissement",
                          e.target.value
                        )
                      }
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.etablissement
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    >
                      {ETABLISSEMENTS.map((etablissement) => (
                        <option
                          key={etablissement.value}
                          value={etablissement.value}
                        >
                          {etablissement.label}
                        </option>
                      ))}
                    </select>
                    {errors.members[index]?.etablissement && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.etablissement}
                      </p>
                    )}
                  </div>

                  {/* Custom Établissement Input */}
                  {member.etablissement === "others" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spécifiez l&apos;établissement
                      </label>
                      <input
                        type="text"
                        value={member.etablissementCustom || ""}
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            "etablissementCustom",
                            e.target.value
                          )
                        }
                        placeholder="Nom de l'établissement"
                        className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                          errors.members[index]?.etablissementCustom
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {errors.members[index]?.etablissementCustom && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.members[index]?.etablissementCustom}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Niveau */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau
                    </label>
                    <select
                      value={member.niveau}
                      onChange={(e) =>
                        handleMemberChange(index, "niveau", e.target.value)
                      }
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.niveau
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    >
                      {LMD_LEVELS.map((niveau) => (
                        <option key={niveau.value} value={niveau.value}>
                          {niveau.label}
                        </option>
                      ))}
                    </select>
                    {errors.members[index]?.niveau && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.niveau}
                      </p>
                    )}
                  </div>

                  {/* Spécialité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spécialité
                    </label>
                    <input
                      type="text"
                      value={member.specialite}
                      onChange={(e) =>
                        handleMemberChange(index, "specialite", e.target.value)
                      }
                      placeholder="Spécialité"
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.specialite
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.members[index]?.specialite && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.specialite}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
            {type === "groupe" && (
              <button
                type="button"
                onClick={addMember}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Ajouter des membres
              </button>
            )}
          </div>

          {/* Project Details */}
          <div>
            <h2 className="text-xl font-bold mb-4">Details du projet</h2>
            <div className="space-y-4">
              {Object.entries(project).map(([field, value]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  {field === "descriptif" || field === "autres" ? (
                    <textarea
                      value={value}
                      onChange={(e) =>
                        handleProjectChange(
                          field as keyof Project,
                          e.target.value
                        )
                      }
                      placeholder={
                        field === "autres"
                          ? "Autres informations (Optionel)"
                          : field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.project?.[field as keyof Project] &&
                        field !== "autres"
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } min-h-[100px]`}
                      required={field !== "autres"}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        handleProjectChange(
                          field as keyof Project,
                          e.target.value
                        )
                      }
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.project?.[field as keyof Project]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      required={field !== "autres"}
                    />
                  )}
                  {errors.project?.[field as keyof Project] &&
                    field !== "autres" && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.project[field as keyof Project]}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
                isSubmitting
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              {isSubmitting
                ? "Envoie de l'inscription..."
                : "Envoyer l'inscription"}
            </button>
          </div>
        </form>
      </div>

      {/* Conditions Popup */}
      {showConditionsPopup && <ConditionsPopup />}
    </>
  );
}
