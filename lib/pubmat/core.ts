import type { PubmatData } from "./params";

export type PosterField =
  | "company"
  | "title"
  | "description"
  | "location"
  | "setup"
  | "pay"
  | "link"
  | "companyLogo"
  | "contrast";
export class PubmatFitError extends Error {
  constructor(
    public readonly field: PosterField,
    message: string,
  ) {
    super(message);
    this.name = "PubmatFitError";
  }
}
export type PosterCopy = Partial<
  Pick<
    PubmatData,
    "company" | "title" | "description" | "location" | "setup" | "pay"
  >
>;
