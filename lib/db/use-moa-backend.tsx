/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-10-16 02:50:30
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { useEffect, useState } from "react";
import { DocumentDatabase, DocumentTables } from "@betterinternship/schema.moa";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import {
  create as createBatchedFetcher,
  keyResolver,
  windowScheduler,
} from "@yornaath/batshit";
import z, { ZodType } from "zod";
import { Database, Tables } from "@betterinternship/schema.base";
import { PublicUser } from "./db.types";

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
type FieldValidator = DocumentTables<"field_validators">;
type FieldTransformer = DocumentTables<"field_transformers">;
type IField = DocumentTables<"field_repository">;
export type IUserForm = Tables<"user_internship_forms">;
type IFormSchema = DocumentTables<"form_schemas">;

/**
 * Joined field.
 * All validators are included.
 */
interface IJoinedField extends Omit<IField, "validators" | "transformers"> {
  value: undefined;
  validators: ZodType[];
  transformers: ZodType[];
}

/**
 * Fetches all forms from the database given the user's department.
 *
 * @returns
 */
export const fetchForms = async (user: PublicUser): Promise<IFormSchema[]> => {
  if (!user.department) {
    console.log("Department required to lookup forms.");
    return [];
  }
  console.log("dept", user.department);

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

  // Fetch all forms for user
  const { data: forms, error: formsError } = await db
    .from("form_schemas")
    .select("*")
    .contains("initiators", ["student"])
    .in("id", formGroup?.forms ?? []);

  if (formsError) {
    console.log("Could not fetch user forms.");
    console.log("Actually, something went wrong: " + formsError?.message);
    return [];
  }

  return forms ?? [];
};

/**
 * Allows us to batch requests to the endpoint.
 * Fetches field transformer.
 */
const fieldTransformerFetcher = createBatchedFetcher({
  fetcher: async (ids: string[]): Promise<FieldTransformer[]> => {
    const { data, error } = await db
      .from("field_transformers")
      .select("*")
      .in("id", ids);
    if (error)
      throw new Error(`Could not find at least one of the field transformers.`);
    return data as FieldTransformer[];
  },
  resolver: keyResolver("id"),
  scheduler: windowScheduler(100),
});

/**
 * Allows us to batch requests to the endpoint.
 * Fetches field validstors.
 */
const fieldValidatorFetcher = createBatchedFetcher({
  fetcher: async (ids: string[]): Promise<FieldValidator[]> => {
    const { data, error } = await db
      .from("field_validators")
      .select("*")
      .in("id", ids);
    if (error)
      throw new Error(`Could not find at least one of the field validators.`);
    return data as FieldValidator[];
  },
  resolver: keyResolver("id"),
  scheduler: windowScheduler(100),
});

/**
 * Allows us to batch requests to the endpoint.
 * Fetches fields.
 */
const fieldFetcher = createBatchedFetcher({
  fetcher: async (names: string[]): Promise<IField[]> => {
    const { data, error } = await db
      .from("field_repository")
      .select("*")
      .in("name", names);
    if (error)
      throw new Error(
        `Could not find at least one of the field in repository.`,
      );
    return data as IField[];
  },
  resolver: keyResolver("name"),
  scheduler: windowScheduler(100),
});

/**
 * Allows us to batch requests to the endpoint.
 * Fetches fields.
 */
const fetchFieldCollection = async (name: string) => {
  const { data, error } = await db
    .from("form_schemas")
    .select("*")
    .eq("name", name)
    .single();
  if (error) throw new Error(`Could not find the field collections "${name}".`);
  return data as IFormSchema;
};

/**
 * Has an implied eval, hence the name.
 * Only ever evaluates zod schemas, so we're fine.
 *
 * @param schema
 * @returns
 */
function evalZodSchema(schema: string, params?: any) {
  // ? Gotta be careful with this shit
  const ret = `return ${schema}`;
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const evaluator = new Function("z", "params", ret);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return evaluator(z, params ?? {}) as ZodType;
}

/**
 * Fetches actual data from db.
 *
 * @hook
 */
export const useDynamicFormSchema = (name: string) => {
  const [fields, setFields] = useState<IJoinedField[]>([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const {
    data,
    error,
    isLoading: collectionLoading,
  } = useQuery({
    queryKey: ["field-collections", name],
    queryFn: () => fetchFieldCollection(name),
    staleTime: 10000,
    gcTime: 10000,
  });
  const formParams = (data?.params ?? {}) as Record<string, any>;

  // Maps validators to their db fetches
  const mapValidators = async (validators?: string[], params?: any) =>
    await Promise.all(
      validators?.map(
        async (v) =>
          await fieldValidatorFetcher
            .fetch(v)
            .then((v) => (v?.rule ? evalZodSchema(v.rule, params) : z.any())),
      ) ?? [],
    );

  const mapTransformers = async (transformers?: string[], params?: any) =>
    await Promise.all(
      transformers?.map(
        async (t) =>
          await fieldTransformerFetcher
            .fetch(t)
            .then((t) => (t?.rule ? evalZodSchema(t.rule, params) : z.any())),
      ) ?? [],
    );

  // Maps fields to their db fetches
  const mapFields = async (fields: string[], formParams?: any) =>
    await Promise.all(
      fields.map(
        async (f) =>
          await fieldFetcher.fetch(f).then(async (field: IField | null) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const fieldParams = formParams?.[field?.name ?? ""];

            return {
              ...(field ?? ({} as IField)),
              type: field?.type ?? "text",
              label: field?.label ?? "",
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              value: fieldParams?.value ?? undefined,
              section: field?.section,
              validators: await mapValidators(
                field?.validators ?? undefined,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                fieldParams?.params,
              ),
              transformers: await mapTransformers(
                field?.transformers,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                fieldParams?.params,
              ),
            };
          }),
      ),
    );

  useEffect(() => {
    const schema = (data?.schema ?? []) as { field: string }[];
    const fields = schema.map((s) => s.field);

    const list = data?.fields_filled_by_user || fields;

    if (list.length === 0) {
      setFields([]);
      setMappingLoading(false);
      return;
    }

    setMappingLoading(true);
    void mapFields(list, formParams)
      .then((fields) =>
        setFields(
          fields.map((f) => ({
            ...f,
            section: f.section ?? null,
          })),
        ),
      )
      .finally(() => setMappingLoading(false));
  }, [data?.fields_filled_by_user, data?.schema, formParams]);

  return {
    fields,
    error,
    isLoading: collectionLoading || mappingLoading,
  };
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
  console.log("id", baseDocumentId);
  if (!baseDocumentId) return;
  const baseDocument = await db
    .from("base_documents")
    .select("url")
    .eq("id", baseDocumentId)
    .single();

  console.log("baseDoc", baseDocument);
  return baseDocument;
};
