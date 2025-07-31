import Image from 'next/image';
import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="animate-fadeIn bg-white text-black py-8 text-center h-screen flex flex-col items-center justify-center gap-10">
      <div className="flex justify-center mb-4">
        <Image 
          src="/logo.png" 
          alt="Contest Logo" 
          width={150}
          height={150}
          className="flex-1 object-contain w-full max-w-xl h-[40vh]"
        />
      </div>
      <h1 className="w-[94%] text-3xl md:text-3xl font-bold">
        Bienvenue au <b className='text-blue-500'>MBAYA_CODE_CONTEST</b> édition 3
      </h1>
    </div>
  );
};

export default Hero;