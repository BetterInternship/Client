const Hero = () => {
  return (
    <div className="flex flex-col gap-8 justify-between h-full w-full">
      <img
        src="/registerPage/register-page-0.png"
        className="w-full"
        alt="BetterInternship"
      />
      <h1 className="font-light tracking-tighter text-justify text-gray-700 p-6">
        <span className="font-semibold">Better internships</span> start{" "}
        <span className="text-primary font-semibold">here</span>.
      </h1>
    </div>
  );
};

const SuperListings = () => {
  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex flex-col space-y-8 py-6">
        <div className="flex flex-row justify-center w-full">
          <img
            src="/registerPage/register-page-1.png"
            className="w-3/4"
            alt="BetterInternship"
          />
        </div>
        <h1 className="text-gray-700 font-semibold tracking-tighter text-left px-12 leading-[1.05]">
          Stand out from other interns
          <br />
          even with no experience.
        </h1>
        <span className="text-gray-500 text-justify text-md px-12">
          <span className="font-bold">Not all internships need resumes.</span>{" "}
          <br />
          <br />
          Some of our companies{" "}
          <span className="font-bold">
            give challenges instead to prove yourself as an applicant.
          </span>{" "}
          <br />
          <br />
          If you impress the company, you get in. <br />
          <span className="font-bold">Even with no experience.</span>
        </span>
      </div>
    </div>
  );
};

const FormAutomation = () => {
  return (
    <div className="flex flex-col justify-between h-full w-full p-6">
      <img
        src="/registerPage/register-page-2.png"
        className="w-full"
        alt="BetterInternship"
      />
      <h1 className="text-gray-700 tracking-tighter font-normal">
        <span className="font-semibold">100s of pages</span> of paperwork,{" "}
        <span className="text-primary font-semibold">automated.</span>
      </h1>
    </div>
  );
};

const Connect = () => {
  return (
    <div className="flex flex-col justify-between h-full w-full p-6">
      <img
        src="/registerPage/register-page-3.png"
        className="w-full"
        alt="BetterInternship"
      />
      <h1 className="text-gray-700 tracking-tighter font-normal">
        <span className="font-semibold">Connect</span> with hundreds of{" "}
        <span className="text-primary font-semibold">employers.</span>
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
