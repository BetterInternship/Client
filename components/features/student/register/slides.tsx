import { Job, EmployerApplication } from "@/lib/db/db.types";
import { JobListingsBox } from "../../hire/dashboard/JobListingsBox";
import { JobCard } from "@/components/shared/jobs";

const Hero = () => {
  return (
    <div className="flex flex-col gap-8 justify-end bg-primary h-full w-full p-6">
      <img
        src="/BetterInternshipLogo.png"
        className="w-32 aspect-square"
        alt="BetterInternship"
      />
      <h1 className="text-white font-light tracking-tighter text-justify">
        Better Internships start <span className="italic font-bold">here</span>.
      </h1>
    </div>
  );
};

const SuperListings = () => {
  return (
    <div className="flex flex-col justify-between bg-muted h-full w-full p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <JobCard
            job={
              {
                id: "1",
                title: "Software Development Intern",
                is_active: true,
                employer: {
                  name: "Philippine Chamber of Commerce",
                  profile_picture_url: null,
                },
                challenge: {
                  id: "1",
                  title:
                    "Deliver one practical improvement that helps Philippine businesses navigate a high-friction process",
                },
              } as Job
            }
          />
        </div>
      </div>
      <div>
        <h1 className="text-gray-700 font-light tracking-tighter text-justify">
          Make a real impact and stand out from other interns.
        </h1>
        <span className="text-gray-500 text-justify text-lg">
          Super listings are challenges from our partner companies that give you
          the opportunity to demonstrate your skills directly; no resume needed.
          You are guaranteed a response in 24 hours.
        </span>
      </div>
    </div>
  );
};

const FormAutomation = () => {
  return (
    <div className="flex flex-col justify-end bg-muted h-full w-full p-6">
      <h1 className="text-gray-700 font-light tracking-tighter text-justify">
        Hundreds of pages of paperwork, automated.
      </h1>
    </div>
  );
};

const Connect = () => {
  return (
    <div className="flex flex-col justify-end bg-muted h-full w-full p-6">
      <h1 className="text-gray-700 font-light tracking-tighter text-justify">
        Connect to hundreds of employers.
      </h1>
    </div>
  );
};

export const slides = [
  {
    id: 1,
    content: <Hero />,
  },
  {
    id: 2,
    content: <SuperListings />,
  },
  {
    id: 3,
    content: <FormAutomation />,
  },
  {
    id: 4,
    content: <Connect />,
  },
];
