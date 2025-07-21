import { Features } from "@/components/landingHire/sections/3rdSection/feature-section";

import { Brain, BrainCog } from "lucide-react";

const features = [
	{
		id: 1,
		icon: BrainCog,
		title: "Calendar Integration",
		description:
			"See student availability instantly and book interviews in seconds—no more email back-and-forth.",
		image: "/landingPage/2ndSec/popimage3.png",
	},
	{
		id: 2,
		icon: BrainCog,
		title: "Automated Paperwork",
		description:
			"We generate and fill out all the school’s internship documents for you.",
		image: "/landingPage/2ndSec/popimage1.png",
	},
	{
		id: 3,
		icon: Brain,
		title: "All-in-One Dashboard",
		description:
			"Track, message, and manage every applicant in one place—no spreadsheets needed.",
		image: "/landingPage/2ndSec/popimage2.png",
	},
];

const DemoOne = () => {
	return (
		<div className="dark">
			<Features
				primaryColor="sky-500"
				progressGradientLight="bg-white"
				progressGradientDark="bg-white"
				features={features}
			/>
		</div>
	);
};

export { DemoOne };
