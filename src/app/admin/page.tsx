"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Project {
  titre: string;
  descriptif: string;
  langages?: string;
  autres?: string;
}

interface Member {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  etablissement?: string;
  niveau?: string;
  specialite?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  registrationType: "solo" | "groupe";
  groupName?: string;
  project: Project;
  members: Member[];
}

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const fetchUsers = async (email: string, password: string) => {
    setLoading(true);
    const url = `/api/groups?email=${email}&password=${password}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
      setIsAuthenticated(true);
      localStorage.setItem("adminEmail", email);
      localStorage.setItem("adminPassword", password);
    } else {
      alert("Invalid credentials or not an admin");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    await fetchUsers(email, password);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminPassword");
    setIsAuthenticated(false);
    setUsers([]);
    setEmail("");
    setPassword("");
  };

  const handleRefresh = async () => {
    const storedEmail = localStorage.getItem("adminEmail");
    const storedPassword = localStorage.getItem("adminPassword");
    if (storedEmail && storedPassword) {
      await fetchUsers(storedEmail, storedPassword);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminEmail");
    const storedPassword = localStorage.getItem("adminPassword");
    if (storedEmail && storedPassword) {
      fetchUsers(storedEmail, storedPassword);
    }
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          className="border p-2 w-full mb-4 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </div>
    );
  }

  const totalRegistrations = users.length;
  const soloUsers = users.filter((user) => user.registrationType === "solo");
  const groupUsers = users.filter((user) => user.registrationType === "groupe");
  const totalSolo = soloUsers.length;
  const totalGroups = groupUsers.length;
  const totalParticipants =
    soloUsers.length +
    groupUsers.reduce((acc, group) => acc + group.members.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registered Participants</h1>
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-lg">
          Total registrations: {totalRegistrations-1} ({totalSolo -1} solo,{" "}
          {totalGroups} groups)
        </p>
        <p className="text-lg">Total participants: {totalParticipants -1}</p>
      </div>
      {users
        .filter((user) => user.role === "user")
        .map((user) => (
          <div key={user._id} className="bg-white p-6 mb-6 rounded shadow-md">
            <div className="flex justify-between items-center">
              {user.registrationType === "groupe" ? (
                <div>
                  <h2 className="text-2xl font-semibold">{user.groupName}</h2>
                  <p>{user.members.length} members</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  <p>{user.email}</p>
                </div>
              )}
              <button
                onClick={() => toggleExpand(user._id)}
                className="focus:outline-none"
              >
                {expanded[user._id] ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </button>
            </div>
            {expanded[user._id] && (
              <div className="mt-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Project: {user.project.titre}
                  </h3>
                  <p className="mb-2">{user.project.descriptif}</p>
                  <p className="mb-2">
                    <strong>Langages:</strong> {user.project.langages || "N/A"}
                  </p>
                  <p className="mb-2">
                    <strong>Autres:</strong> {user.project.autres || "N/A"}
                  </p>
                </div>
                {user.registrationType === "groupe" && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Members:</h4>
                    <ul className="space-y-2">
                      {user.members.map((member, idx) => (
                        <li key={idx} className="border p-2 rounded">
                          <p>
                            <strong>Nom:</strong> {member.nom}
                          </p>
                          <p>
                            <strong>Prenom:</strong> {member.prenom}
                          </p>
                          <p>
                            <strong>Email:</strong> {member.email}
                          </p>
                          <p>
                            <strong>Telephone:</strong> {member.telephone}
                          </p>
                          {member.etablissement && (
                            <p>
                              <strong>Etablissement:</strong>{" "}
                              {member.etablissement}
                            </p>
                          )}
                          {member.niveau && (
                            <p>
                              <strong>Niveau:</strong> {member.niveau}
                            </p>
                          )}
                          {member.specialite && (
                            <p>
                              <strong>Specialite:</strong> {member.specialite}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
