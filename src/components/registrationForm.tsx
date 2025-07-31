"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Define validation types
type Member = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  etablissement: string;
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
  members: (Partial<Record<keyof Member, string>>)[];
  project?: Partial<Record<keyof Project, string>>;
};

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
        memberErrors.nom = "Last name is required";
        isValid = false;
      }
      
      if (!member.prenom.trim()) {
        memberErrors.prenom = "First name is required";
        isValid = false;
      }
      
      if (!member.telephone.trim()) {
        memberErrors.telephone = "Phone number is required";
        isValid = false;
      } else if (!/^[0-9+\s]{8,}$/.test(member.telephone)) {
        memberErrors.telephone = "Invalid phone number";
        isValid = false;
      }
      
      if (!member.email.trim()) {
        memberErrors.email = "Email is required";
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(member.email)) {
        memberErrors.email = "Invalid email format";
        isValid = false;
      }
      
      if (!member.etablissement.trim()) {
        memberErrors.etablissement = "Institution is required";
        isValid = false;
      }
      
      if (!member.niveau.trim()) {
        memberErrors.niveau = "Level is required";
        isValid = false;
      }
      
      if (!member.specialite.trim()) {
        memberErrors.specialite = "Specialty is required";
        isValid = false;
      }
      
      newErrors.members[index] = memberErrors;
    });

    // Validate project
    const projectErrors: Partial<Record<keyof Project, string>> = {};
    
    if (!project.titre.trim()) {
      projectErrors.titre = "Project title is required";
      isValid = false;
    }
    
    if (!project.descriptif.trim()) {
      projectErrors.descriptif = "Project description is required";
      isValid = false;
    }
    
    if (!project.langages.trim()) {
      projectErrors.langages = "Programming languages are required";
      isValid = false;
    }
    
    newErrors.project = projectErrors;

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const finalGroupName =
        type === "solo" ? `${members[0].prenom} ${members[0].nom}` : groupName;
      const finalMembers = type === "solo" ? members.slice(0, 1) : members;
      
      const data = {
        groupName: finalGroupName,
        type,
        project: {
          ...project,
          autres: project.autres.trim() || "None",
        },
        members: finalMembers,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
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
    }
  };

  const handleMemberChange = (
    index: number,
    field: keyof Member,
    value: string
  ) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
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
    <div className="w-11/12 mx-auto md:max-w-2xl py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Group Information</h2>
          <div className="space-y-4">
            {type === "groupe" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
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
                  <p className="mt-1 text-sm text-red-600">{errors.groupName}</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Type
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
            {type === "solo" ? "Your Details" : "Member Details"}
          </h2>
          {(type === "solo" ? members.slice(0, 1) : members).map(
            (member, index) => (
              <div key={index} className="space-y-4 mb-6 border-b pb-4">
                {type === "groupe" && (
                  <h3 className="text-lg font-semibold">Member {index + 1}</h3>
                )}
                
                {Object.entries(member).map(([field, value]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field}
                    </label>
                    <input
                      type={
                        field === "email" 
                          ? "email" 
                          : field === "telephone" 
                            ? "tel" 
                            : "text"
                      }
                      value={value}
                      onChange={(e) => 
                        handleMemberChange(
                          index, 
                          field as keyof Member, 
                          e.target.value
                        )
                      }
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                        errors.members[index]?.[field as keyof Member]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.members[index]?.[field as keyof Member] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index]?.[field as keyof Member]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
          {type === "groupe" && (
            <button
              type="button"
              onClick={addMember}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add Member
            </button>
          )}
        </div>

        {/* Project Details */}
        <div>
          <h2 className="text-xl font-bold mb-4">Project Details</h2>
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
                        ? "Other Details (Optional)" 
                        : field.charAt(0).toUpperCase() + field.slice(1)
                    }
                    className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                      errors.project?.[field as keyof Project] && field !== "autres"
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
                {errors.project?.[field as keyof Project] && field !== "autres" && (
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
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}