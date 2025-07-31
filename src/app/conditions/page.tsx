"use client"
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  return (

    <div className="flex flex-col items-center justify-center max-w-6xl mx-auto p-4">
      <button onClick={() => router.back()} className="bg-gray-500 hover:bg-black text-white font-bold py-2 px-4 rounded">
        Retour
      </button>
      <Image
        width={1200}
        height={1200}
        alt="conditions"
        src="/conditions/condition.jpg"
      />
    </div>
  );
}
