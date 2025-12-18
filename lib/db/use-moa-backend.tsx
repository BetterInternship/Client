/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-12-18 16:20:48
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { PublicUser } from "./db.types";
import { UserService } from "../api/services";

// Environment setup
const DB_URL = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_URL;
const DB_ANON_KEY = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_ANON_KEY;

if (!DB_URL || !DB_ANON_KEY) {
  console.warn("Missing supabase configuration for MOA docs backend.");
  // ! PUT THIS BACK IN when codebase becomes stable
  // throw new Error("[ERROR:ENV] Missing supabase configuration (for MOA docs backend).");
}

export interface FormTemplate {
  formDocument: string;
  formVersion: number;
  formName: string;
  formLabel: string;
}

/**
 * Fetches all forms from the database given the user's department.
 *
 * @returns
 */
export const fetchForms = async (user: PublicUser) => {
  if (!user.department) return [];
  const r = await UserService.getMyFormTemplates();
  return r;
};
