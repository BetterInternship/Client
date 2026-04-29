import type { StaticImageData } from "next/image";

export type PanelKey = "overview" | "challenge" | "submission";

export type SubmissionStep = 1 | 2;

export type PccSubmissionForm = {
  email: string;
  fullName: string;
  facebookLink: string;
  submissionLink: string;
  submissionNotes: string;
};

export type CEOProfile = {
  name: string;
  role: string;
  imageSrc: string | StaticImageData;
  profileUrl: string;
};
