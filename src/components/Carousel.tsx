"use client";

import { useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

interface CarouselProps {
  title: string;
  images: string[];
}

export default function Carousel({ title, images }: CarouselProps) {
  const id = useId();

  return (
    <div className="flex flex-col items-center text-center my-8">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <div className="relative w-[90%] rounded-sm shadow-md overflow-hidden">
        <Swiper
          spaceBetween={10}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          modules={[Navigation, A11y]}
          navigation={{
            nextEl: `.swiper-button-next-${id}`,
            prevEl: `.swiper-button-prev-${id}`,
          }}
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <Image
                width={640}
                height={480}
                src={src}
                alt={`${title} Image ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Buttons with Unique Classes */}
        <button
          className={`swiper-button-prev-${id} absolute left-0 top-1/2 z-10 -translate-y-1/2`}
        >
          <ArrowBigLeft className="text-gray-800 fill-white" size={50} />
        </button>
        <button
          className={`swiper-button-next-${id} absolute right-0 top-1/2 z-10 -translate-y-1/2`}
        >
          <ArrowBigRight className="text-gray-800 fill-white" size={50} />
        </button>
      </div>
    </div>
  );
}
