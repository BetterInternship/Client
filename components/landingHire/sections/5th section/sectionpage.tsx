"use client";

import { LogoCarousel } from "@/components/landingHire/sections/5th section/companies";
import { Card, CardContent } from "@/components/landingHire/ui/card";

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
		<div className="text-white bg-black border-t border-gray-900 pt-6 w-full flex flex-col items-center justify-center">
			<Card className="w-full max-w-screen-xl bg-black py-32">
				<CardContent className="bg-black px-4 sm:px-8 w-full">
					<div className="text-center justify-center mb-8">
            <h2 className="sm:text-6xl text-4xl font-bold tracking-tight leading-none text-white">
              Join the growing list of companies hiring here.
            </h2>
					</div>
					<div className="w-full flex justify-center">
						<LogoCarousel logos={demoLogos} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export { LogoCarouselBasic };
