"use client";

import { FeatureSteps } from "@/components/landingStudent/sections/3rdSection/feature-section";

const features = [
	{
		step: "Step 1",
		title: "Calendar Integration",
		content:
			"See student availability instantly and book interviews in seconds—no more email back-and-forth.",
		image: "/landingPage/2ndSec/popimage3.png",
	},
	{
		step: "Step 2",
		title: "Automated Paperwork",
		content: "We generate and fill out all the school’s internship documents for you.",
		image: "/landingPage/2ndSec/popimage1.png",
	},
	{
		step: "Step 3",
		title: "All-in-One Dashboard",
		content:
			"Track, message, and manage every applicant in one place—no spreadsheets needed.",
		image: "/landingPage/2ndSec/popimage2.png",
	},
];

export function PlatformSection() {
	return (
		<div className="border-t border-b border-gray-900 h-[100vh] bg-black text-white">
			<FeatureSteps
				features={features}
				title="Everything you need to hire interns, in one platform."
				autoPlayInterval={10000}
				imageHeight="h-[500px]"
			/>
		</div>
	);
}
