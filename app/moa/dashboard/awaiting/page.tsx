"use client";

import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { ErrorLabel } from "@/components/ui/labels";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "../../components/card";
import { Download, SendHorizonal, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const LoginPage = () => {
  const router = useRouter();

  return (
    <div className="w-[100vw] h-[100vh] overflow-auto">
      <div className="w-[100vw] min-h-screen flex flex-col justify-left items-center">
        <div className="w-fit my-16">
          <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
            Your Response is Required
          </div>
          <div className="my-4 text-gray-500">MOA Request History</div>
          <br />
          <Timeline />
          <div className="flex flex-row gap-2">
            <Button
              scheme="default"
              variant="outline"
              size="lg"
              className="flex-1 h-24"
            >
              Respond
            </Button>
            <Button scheme="supportive" size="lg" className="flex-1 h-24">
              Approve and Sign
            </Button>
            <Button scheme="destructive" size="lg" className="flex-1 h-24">
              Reject and Withdraw
            </Button>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
};

const timelineData = [
  {
    side: "employer",
    date: "May 25, 2025",
    title: "Employer MOA Revision Request",
    content:
      "The MOA needs to be edited to align with our company's NDA policy to ensure consistency in confidentiality obligations and prevent conflicts.",
    file: {
      name: "revised_moa.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
  {
    side: "university",
    date: "May 27, 2025",
    title: "University Feedback",
    content:
      "The proposed edits are acceptable, but ensure that the NDA is mutual. See revised language in document attached.",
    file: {
      name: "revised_moa.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
  {
    side: "employer",
    date: "May 28, 2025",
    title: "Employer Response",
    content:
      "Confirmed. The NDA has been adjusted to reflect mutual protection as per your request.",
    file: {
      name: "revised_moa.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
  {
    side: "university",
    date: "May 29, 2025",
    title: "University Feedback",
    content:
      "Looks like there was a mistype on the Section 3 header. I fixed it. Please see attached.",
    file: {
      name: "corrected_section3.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
];

const Timeline = () => {
  return (
    <div className="flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-4xl relative">
        {/* Timeline Items */}
        <div className="relative">
          {timelineData.map((item, index) => (
            <div
              key={index}
              className={`relative flex justify-${
                item.side === "employer" ? "start" : "end"
              } items-center w-full mb-2`}
            >
              <div
                className={`w-1/2 px-4 ${
                  item.side === "employer"
                    ? "text-left self-start"
                    : "text-right self-end"
                }`}
              >
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">{item.date}</div>
                  <div className="font-semibold text-gray-800 mb-1">
                    {item.title}
                  </div>
                  <div className="text-gray-700 text-sm leading-snug mb-2">
                    {item.content}
                  </div>
                  {item.file && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm hover:underline cursor-pointer">
                      <Download className="w-4 h-4" />
                      <a href={item.file.url} download target="_blank">
                        {item.file.name}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {/* Dot on the center line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full z-10"></div>
            </div>
          ))}

          {/* Center Line spanning only between first and last dots */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 z-0"
            style={{
              top: `calc(1.5rem + 0.5rem)`,
              bottom: `calc(3rem + 0.5rem)`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
