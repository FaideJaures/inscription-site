// this page condition will display only a single image on teh whole width viewport with a max width of 600 px and a black bg

import Image from "next/image";

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Image
        width={600}
        height={600}
        alt="conditions"
        src="/conditions/condition"
      />
    </div>
  );
}
