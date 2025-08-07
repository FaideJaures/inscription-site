import Image from 'next/image';
import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="bg-white text-black py-8 text-center h-screen flex flex-col items-center justify-between gap-10">
      <div className="flex justify-center w-[90%] pl-3 mb-4">
        <Image 
          src="/logo.png" 
          alt="Contest Logo" 
          width={600}
          height={600}
          className="flex-1 object-contain w-full max-w-xl h-[40vh]"
        />
      </div>
      <h1 className="w-[90%] text-2xl md:text-3xl font-bold">
        Bienvenue au<br/> <b className='text-blue-500'>MBAYA_CODE_CONTEST</b><br/> édition 3
      </h1>
      <h2 className='text-2xl'>Déroulement le 23 août 2025</h2>
    </div>
  );
};

export default Hero;