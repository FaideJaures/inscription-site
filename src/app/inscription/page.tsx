'use client';

import Link from 'next/link';
import RegistrationForm from "@/components/registrationForm";

export default function Inscription() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link href="/" className="mb-4 inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-black">
        Acceuil
      </Link>
      <h1 className="text-3xl font-bold mb-4">Enregistrement pour la 3eme edition de MBAYA CODE CONTEST.</h1>
      <RegistrationForm />
    </div>
  );
}