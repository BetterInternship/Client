"use client";

import { LogoCarousel } from "@/components/landingStudent/sections/5th section/companies";
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
		<div className="w-full bg-black border-t border-b border-gray-800 py-8 flex items-center justify-center">
			<Card className="w-full max-w-7xl mx-auto shadow-lg bg-white">
				<CardContent className="bg-white py-12">
					<div className="text-center mb-10">
						<h2 className="sm:text-[3.5rem] text-[2.5rem] font-bold tracking-tight leading-none text-black mb-4">
							It's 100% Free!
						</h2>
						<p className="mt-2 text-lg text-gray-700 max-w-2xl mx-auto">
							Built for employers, at zero cost. BetterInternship makes it easy to connect with motivated students—no fees, no hassle, just great matches.
						</p>
					</div>
					<div className="text-center mb-8">
            <span className="text-base font-medium text-gray-500">
              Trusted by leading companies to discover top student talent with BetterInternship
            </span>
					</div>
					<div className="flex justify-center">
						<LogoCarousel logos={demoLogos} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export { LogoCarouselBasic };
