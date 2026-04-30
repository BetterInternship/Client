import type { StaticImageData } from "next/image";

export type PanelKey = "overview" | "challenge" | "submission";

export type SofiAiSubmissionForm = {
  contactNumber: string;
  email: string;
  fullName: string;
  submissionLink: string;
  videoSubmissionLink: string;
};

export type SuperListingUnlockForm = {
  email: string;
};

export type CEOProfile = {
  name: string;
  role: string;
  imageSrc: string | StaticImageData;
  profileUrl: string;
};
