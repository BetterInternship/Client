import type { PosterCopy } from "./core";
import {
  LISTING_TITLE_MAX_LENGTH,
  PUBMAT_DESCRIPTION_MAX_LENGTH,
  PUBMAT_COMPANY_MAX_LENGTH,
  PUBMAT_PAY_MAX_LENGTH,
} from "../consts/listing-limits";
import { PUBMAT_LOCATION_MAX_LENGTH } from "./params";

const fill = (text: string, length: number) =>
  text.repeat(Math.ceil(length / text.length)).slice(0, length);

/** Shared by the playground shortcut and render regression checks. */
export const PUBMAT_MAX_COPY: PosterCopy = {
  title: fill(
    "Marketing and Business Development Intern ",
    LISTING_TITLE_MAX_LENGTH,
  ),
  description: fill(
    "Build meaningful projects with our team and gain practical experience. ",
    PUBMAT_DESCRIPTION_MAX_LENGTH,
  ),
  company: fill("Northstar Media Group ", PUBMAT_COMPANY_MAX_LENGTH),
  location: fill("Northgate Cyberzone Alabang ", PUBMAT_LOCATION_MAX_LENGTH),
  pay: fill("₱15,000 / month paid ", PUBMAT_PAY_MAX_LENGTH),
  setup: "On-site",
};
