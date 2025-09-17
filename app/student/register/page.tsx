"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ResumeUpload from "./ResumeUpload";
import { useAnalyzeResume } from "@/hooks/use-register";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";

type Inputs = {
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  university: string;
  college: string;
  degree: string;
  degree_notes: string;
};

// Data for defining the steps of the page
const stepData = [
  { title: "Welcome to BetterInternship" },
  { title: "", exclude: true },
  { title: "Help us figure out who you are" },
  { title: "What kind of internships are you looking for?" },
  { title: "You're good to go!", exclude: true },
];
const offsets = [0];
const stepCount = stepData.filter((step) => !step.exclude).length;
stepData
  .slice(1)
  .map((step) =>
    offsets.push(offsets[offsets.length - 1] + (step.exclude ? 1 : 0))
  );

export const RegisterPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(2);
  const [currentStep, setCurrentStep] = useState(stepData[step]);
  const [currentOffset, setCurrentOffset] = useState(offsets[step]);
  const { upload, fileInputRef, response } = useAnalyzeResume(file);
  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const refs = useDbRefs();

  // Options for dropdowns
  const universityOptions = refs.universities;
  const collegeOptions = useMemo(
    () =>
      refs.colleges.filter((c) =>
        refs.get_colleges_by_university(watch("university")).includes(c.id)
      ),
    [watch("university")]
  );
  const degreeOptions = useMemo(
    () =>
      refs.degrees.filter((c) =>
        refs.get_degrees_by_university(watch("university")).includes(c.id)
      ),
    [watch("university")]
  );

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  // State changes for the step
  const nextStep = () => {
    setStep(step + 1);
  };
  const lastStep = () => {
    setStep(step - 1);
  };

  // Handles update from resume parse
  const handleFormUpdate = (parsedResume: Partial<Inputs>) => {
    console.log("pasred resume", parsedResume);
    const keys = Object.keys(parsedResume) as (keyof Inputs)[];
    for (const key of keys)
      if (parsedResume[key]) setValue(key, parsedResume[key]);
  };

  // Upload file on select
  useEffect(() => {
    upload(file);
  }, [file]);

  useEffect(() => {
    setCurrentStep(stepData[step]);
    setCurrentOffset(offsets[step]);
  }, [step]);

  return (
    <div className="bg-[#FEFCFF] h-full">
      <form onSubmit={handleSubmit(onSubmit)} className="relative h-full">
        <div className="relative h-full flex flex-col justify-start max-w-prose sm:w-1/2 w-fit m-auto my-8">
          <div className="pt-4">
            <h1 className="text-3xl font-semibold tracking-tight text-center text-gray-700">
              <img
                src="/BetterInternshipLogo.png"
                className="w-prose max-w-32 m-auto mt-16 mb-0"
              ></img>
              {currentStep.title.trim() && (
                <>
                  <br />
                  {currentStep.title}
                </>
              )}
            </h1>
          </div>

          {step <= 1 && (
            <ResumeUpload
              ref={fileInputRef}
              promise={response?.then(({ extractedUser }) =>
                handleFormUpdate(extractedUser)
              )}
              onSelect={(file) => {
                setFile(file);
                nextStep();
              }}
              onComplete={() => {
                nextStep();
              }}
            />
          )}

          <div className={cn("", step === 2 ? "" : "hidden")}>
            <div className="flex flex-col gap-2 mt-4">
              {errors.first_name && <span>This field is required</span>}
              <Input
                placeholder="First name..."
                {...register("first_name", { required: true })}
              ></Input>
              <Input
                placeholder="Middle name..."
                {...register("middle_name", { required: true })}
              ></Input>
              <Input
                placeholder="Last name..."
                {...register("last_name", { required: true })}
              ></Input>
              <Input
                placeholder="Phone number..."
                {...register("phone_number", { required: true })}
              ></Input>
              <Autocomplete
                value={watch("university")}
                options={universityOptions}
                setter={(value: any) => setValue("university", value)}
                placeholder="Select university..."
              />
              <Autocomplete
                value={watch("college")}
                options={collegeOptions}
                setter={(value: any) => setValue("college", value)}
                placeholder="Select college..."
              />
              <Autocomplete
                value={watch("degree")}
                options={degreeOptions}
                setter={(value: any) => setValue("degree", value)}
                placeholder="Select degree..."
              />
              <Input
                placeholder="Additional degree notes..."
                {...register("degree_notes", { required: true })}
              ></Input>
              <div className="justify-end flex flex-row gap-1 mt-4">
                <Button
                  scheme="secondary"
                  variant="outline"
                  onClick={() => setStep(0)}
                >
                  Prev
                </Button>
                <Button scheme="primary" onClick={nextStep}>
                  Next
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="w-full text-center opacity-50">
            Step {step + 1 - currentOffset} out of {stepCount}
          </div>

          <div className="mb-16"></div>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
