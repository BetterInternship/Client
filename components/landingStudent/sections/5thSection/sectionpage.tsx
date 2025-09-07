"use client";

import { LogoCarousel } from "@/components/landingStudent/sections/5thSection/companies";
import { Card, CardContent } from "@/components/landingStudent/ui/card";

const demoLogos = [
  {
    id: 1,
    name: "Asian Institute of Management",
    src: "/landingPage/logos/aim.png",
  },
  {
    id: 2,
    name: "Alaska Milk Corporation",
    src: "/landingPage/logos/alaska.png",
  },
  {
    id: 3,
    name: "APC by Schneider Electric",
    src: "/landingPage/logos/apc.jpeg",
  },
  { id: 4, name: "Jollibee", src: "/landingPage/logos/jollibee.png" },
  { id: 5, name: "Manulife", src: "/landingPage/logos/manulife.png" },
  { id: 6, name: "Oracle", src: "/landingPage/logos/oracle.png" },
  { id: 7, name: "SeriousMD", src: "/landingPage/logos/srsmd.jpeg" },
  { id: 8, name: "Sun Life Financial", src: "/landingPage/logos/sunlife.png" },
  { id: 9, name: "WWF Philippines", src: "/landingPage/logos/wwf.jpeg" },
  { id: 10, name: "MegaWorld", src: "/landingPage/logos/megaworld.png" },
];

function LogoCarouselBasic() {
  return (
    <div className="mt-10">
      <div className="text-center justify-center">
        <h2 className="text-xl font-light tracking-tight leading-none">
          The best are already here.
        </h2>
      </div>
      <LogoCarousel logos={demoLogos} />
      <div></div>
    </div>
  );
}

export { LogoCarouselBasic };
