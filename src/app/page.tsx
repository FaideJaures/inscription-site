import Hero from "@/components/Hero";
import SchoolsList from "@/components/SchoolsList";
import Carousel from "@/components/Carousel";
import Link from "next/link";

// /contest1/pics/{number} number is from 1 to 19 jpg
const contest1Images = () => {
  const images = [];
  for (let i = 1; i <= 19; i++) {
    images.push(`/contest1/pics/${i}.jpg`);
  }
  return images as string[];
};
// /contest2/pics/{number} number is from 1 to 19 jpg
const contest2Images = () => {
  const images = [];
  for (let i = 1; i <= 19; i++) {
    images.push(`/contest2/pics/${i}.jpg`);
  }
  return images as string[];
};

export default function Home() {
  const contest1 = [...contest1Images()];
  const contest2 = [...contest2Images()];

  return (
    <div>
      <Hero />
      <SchoolsList
        images={[
          "/schools/USTM.png",
          "/schools/INPTIC-logo.png",
          "/schools/logo-ITA.jpg",
          "/schools/IAI-Gabon.jpg",
        ]}
      />

      <Carousel title="Premiere edition" images={contest1} />
      <Carousel title="Deuxieme edition" images={contest2} />
      <div className="fixed text-xl z-30 bottom-24 right-[50%] -translate-x-[-50%] text-center w-max">
        <Link
          href="/inscription"
          className="bg-black text-white px-4 py-2 rounded"
        >
          S&apos;inscrire maintenant
        </Link>
      </div>
    </div>
  );
}
