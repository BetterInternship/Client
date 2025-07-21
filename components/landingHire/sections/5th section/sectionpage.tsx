"use client";

import { LogoCarousel } from "@/components/landingStudent/sections/5th section/companies";

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
		<div className="w-full bg-black border-t border-b border-gray-800/50 py-16 flex items-center justify-center">
			<div className="w-full max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
				<div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
					<div className="py-20 px-8 sm:px-12 lg:px-16">
						<div className="text-center mb-16">
							<h2 className="text-5xl sm:text-6xl lg:text-6xl font-black tracking-tighter leading-none text-black mb-6">
								It's 100% Free.
							</h2>
							<p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
								Built for employers, at zero cost. BetterInternship makes it easy to connect with motivated students—no fees, no hassle, just great matches.
							</p>
						</div>
						<div className="text-center mb-2">
							<span className="text-lg font-semibold text-gray-600 tracking-wide uppercase">
								Trusted by leading companies to discover top student talent
							</span>
						</div>
						<div className="flex justify-center">
							<LogoCarousel logos={demoLogos} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export { LogoCarouselBasic };
