import Image from "next/image";
import React from "react";

type SchoolsListProps = {
  images: string[];
};

const SchoolsList: React.FC<SchoolsListProps> = ({ images }) => {
  return (
    <div className="animate-fadeIn bg-white text-black py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        Écoles participantes
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {images.map((src, index) => (
          <div key={index} className="w-[150px] h-[150px] overflow-hidden">
            <Image
              width={150}
              height={150}
              src={src}
              alt={`École participante ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolsList;
