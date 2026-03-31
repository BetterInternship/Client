export type PanelKey = "overview" | "challenge" | "submission";

export type SubmissionStep = 1 | 2;

export type AnterioreSubmissionForm = {
  email: string;
  fullName: string;
  facebookLink: string;
  submissionLink: string;
  submissionNotes: string;
};

type WorkWithQuote = {
  quote: string;
  speaker: string;
  speakerTitle: string;
};

export type OverviewContent = {
  whoWeAre: string;
  opportunity: string;
  workWith: WorkWithQuote;
};
