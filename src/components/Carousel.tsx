"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules"; 
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

interface CarouselProps {
  title: string;
  images: string[];
}

export default function Carousel({ title, images }: CarouselProps) {
  return (
    <div className="text-center my-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <Swiper spaceBetween={10} slidesPerView={1} breakpoints={{
    640: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
  }} navigation modules={[Navigation]}>
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
    </div>
  );
}
