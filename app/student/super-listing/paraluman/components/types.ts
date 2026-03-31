export type PanelKey = "overview" | "challenge" | "submission";

export type SubmissionStep = 1 | 2 | 3;

export type ParalumanSubmissionForm = {
  email: string;
  fullName: string;
  facebookLink: string;
  submissionLink: string;
  submissionNotes: string;
};

export type CEOProfile = {
  name: string;
  role: string;
  imageSrc: string;
  profileUrl: string;
};
