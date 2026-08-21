import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@betterinternship/components";
import { useAuthContext } from "@/app/hire/authctx";

export default function HeroSection() {
  const router = useRouter();
  const { redirectIfLoggedIn } = useAuthContext();

  redirectIfLoggedIn();
  const handleRequestAccess = () => router.push("/register");
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-8 pt-8 text-center">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Main Heading */}
        <h1 className="text-7xl font-bold text-black tracking-tighter mb-10">
          Need Interns? <span className="text-primary">Done.</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-700 max-w-2xl mx-auto flex justify-center items-center gap-x-2">
          We are the largest platform dedicated to hiring PH interns.
        </p>

        <p className="text-xl text-gray-700 max-w-2xl mx-auto flex justify-center items-center gap-x-[0.33em]">
          <span className="font-bold italic">Free</span> to use.{" "}
          <span className="font-bold italic">Loved</span> by students.{" "}
          <span className="font-bold italic">Mindblowingly</span> efficient.
        </p>

        {/* Statistics */}
        <div className="translate-y-[-0.3em] pb-6">
          <p className="text-xl text-gray-700 flex justify-center items-center gap-x-2">
            Save your company
            <span className="text-3xl font-bold text-gray-700">125</span> hours
            a year (10 interns).
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-5">
          <Button
            className="w-1/2 bg-black hover:bg-gray-900 transition-all duration-200"
            size="lg"
            scheme="default"
            onClick={handleRequestAccess}
          >
            Request Access
          </Button>
        </div>
      </div>
    </div>
  );
}
