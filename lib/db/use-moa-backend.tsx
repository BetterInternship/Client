/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-12-16 22:06:16
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { DocumentDatabase } from "@betterinternship/schema.moa";
import { createClient } from "@supabase/supabase-js";
import { Database, Tables } from "@betterinternship/schema.base";
import { PublicUser } from "./db.types";
import { UserService } from "../api/services";

// Environment setup
const DB_URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const DB_ANON_KEY_BASE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DB_URL = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_URL;
const DB_ANON_KEY = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_ANON_KEY;

if (!DB_URL || !DB_ANON_KEY) {
  console.warn("Missing supabase configuration for MOA docs backend.");
  // ! PUT THIS BACK IN when codebase becomes stable
  // throw new Error("[ERROR:ENV] Missing supabase configuration (for MOA docs backend).");
}
const db = createClient<DocumentDatabase>(DB_URL ?? "", DB_ANON_KEY ?? "");
const db_base = createClient<Database>(
  DB_URL_BASE ?? "",
  DB_ANON_KEY_BASE ?? "",
);

/**
 * Moa backend types.
 */
export type IUserForm = Tables<"user_internship_forms">;

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
  console.log("ball", r);
  return r;
};

/**
 * Fetches all past user-filled forms.
 *
 * @param userId
 * @returns
 */
export const fetchAllUserInitiatedForms = async (userId: string) => {
  if (!userId) return;

  const { data, error } = await db_base
    .from("user_internship_forms")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(`Could not fetch user forms: ${error.message}`);
  return data as IUserForm[];
};

// ! GET RID OF ALL OF THESE FUNCTIONS BELOW
// ! GET RID OF ALL OF THESE FUNCTIONS BELOW
export const fetchPrefilledDocument = async (prefilledDocumentId: string) => {
  const prefilledDocument = await db
    .from("external_documents")
    .select("*")
    .eq("id", prefilledDocumentId)
    .single();

  return prefilledDocument;
};

export const fetchSignedDocument = async (signedDocumentId: string) => {
  const signedDocument = await db
    .from("signed_documents")
    .select("*")
    .eq("id", signedDocumentId)
    .single();

  return signedDocument;
};

export const fetchPendingDocument = async (pendingDocumentId: string) => {
  const pendingDocument = await db
    .from("pending_documents")
    .select("*")
    .eq("id", pendingDocumentId)
    .single();

  return pendingDocument;
};

// ! GET RID OF ALL OF THESE FUNCTIONS ABOVE
// ! GET RID OF ALL OF THESE FUNCTIONS ABOVE
