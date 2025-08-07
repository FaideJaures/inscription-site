"use client";

import Image from "next/image";
import React from "react";

type ListProps = {
  title: string;
  images: string[];
};

const List: React.FC<ListProps> = ({ title, images }) => {
  return (
    <div className="animate-fadeIn bg-white text-black py-8 px-4">
      <style jsx global>{`
        .titleH2::after {
          content: "";
          position: absolute;
          bottom: -.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 50%;
          height: 0.25rem;
          background-color: black;
          border-radius: 25px;
        }
      `}</style>
      <h2 className="relative titleH2 text-3xl font-bold text-center mb-6">{title}</h2>
      <div className="flex flex-wrap items-center justify-around gap-4 shadow rounded">
        {images.map((src, index) => (
          <div
            key={index}
            className="flex items-center justify-between w-[150px] h-max overflow-hidden"
          >
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

export default List;
