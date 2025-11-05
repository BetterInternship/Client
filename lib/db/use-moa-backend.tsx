/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-11-02 20:28:14
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { DocumentDatabase } from "@betterinternship/schema.moa";
import { createClient } from "@supabase/supabase-js";
import { Database, Tables } from "@betterinternship/schema.base";
import { PublicUser } from "./db.types";
import { UserService } from "../api/services";
import { IFormMetadata } from "@betterinternship/core/forms";

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

/**
 * Fetches all forms from the database given the user's department.
 *
 * @returns
 */
export const fetchForms = async (
  user: PublicUser,
): Promise<
  (IFormMetadata & {
    name: string;
    version: number;
    base_document_id: string;
  })[]
> => {
  if (!user.department) {
    return [];
  }
  // Pull mapping for user department
  const { data: internshipFormMapping, error: internshipFormMappingError } =
    await db_base
      .from("internship_form_mappings")
      .select("*")
      .eq("department_id", user.department)
      .single();

  // Handle error or nonexistent mapping
  if (!internshipFormMapping?.form_group_id) {
    console.log("Could not find mapping for department.");
    if (internshipFormMappingError)
      console.log(
        "Actually, something went wrong: " +
          internshipFormMappingError?.message,
      );
    return [];
  }

  // Get form group
  const { data: formGroup, error: formGroupError } = await db
    .from("form_groups")
    .select("*")
    .eq("id", internshipFormMapping.form_group_id)
    .single();

  const forms = await Promise.all(
    formGroup?.forms.map(async (formName: string) => {
      const { formMetadata, formDocument } =
        await UserService.getForm(formName);
      return { ...formMetadata, ...formDocument };
    }) ?? [],
  );

  return forms ?? [];
};

/**
 * Fetches all past user-filled forms.
 *
 * @param userId
 * @returns
 */
export const fetchAllUserForms = async (userId: string) => {
  if (!userId) return;

  const { data, error } = await db_base
    .from("user_internship_forms")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(`Could not fetch user forms: ${error.message}`);
  return data as IUserForm[];
};

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

export const fetchTemplateDocument = async (baseDocumentId: string) => {
  if (!baseDocumentId) return;
  const baseDocument = await db
    .from("base_documents")
    .select("url")
    .eq("id", baseDocumentId)
    .single();

  return baseDocument;
};
