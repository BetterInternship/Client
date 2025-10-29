/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-10-29 16:45:16
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { useEffect, useState, useMemo } from "react";
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

type FilledBy =
  | "student"
  | "entity"
  | "university"
  | "system"
  | "student-guardian";

type FieldRoles = Record<string, { for?: FilledBy }>;

/**
 * Joined field.
 * All validators are included.
 */
interface IJoinedField extends Omit<IField, "validators" | "transformers"> {
  value?: any;
  params?: Record<string, any>;
  validators: ZodType[];
  transformers: ZodType[];
}

// Gets field keys by role
function fieldKeysByRole(
  data?: IFormSchema,
  role?: FilledBy | "all",
): string[] {
  const roles = (data?.fields ?? {}) as FieldRoles;
  if (!roles) return [];
  if (!role || role === "all") return Object.keys(roles);
  return Object.entries(roles)
    .filter(([, meta]) => meta?.for === role)
    .map(([k]) => k);
}

/**
 * Fetches all forms from the database given the user's department.
 *
 * @returns
 */
export const fetchForms = async (user: PublicUser): Promise<IFormSchema[]> => {
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

  // Fetch all forms for user
  const { data: forms, error: formsError } = await db
    .from("form_schemas")
    .select("*")
    .in("name", formGroup?.forms ?? []);

  console.log(formGroup?.forms);

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

// Maps validators to Zod schemas (always returns ZodType[])
const mapValidators = async (
  validators?: string[] | null,
  params?: any,
): Promise<ZodType[]> => {
  if (!validators || validators.length === 0) return [];
  const rows = await Promise.all(
    validators.map((id) => fieldValidatorFetcher.fetch(id)),
  );
  return rows.map((row) =>
    row?.rule ? evalZodSchema(row.rule, params) : z.any(),
  );
};

// Maps transformers to Zod schemas (always returns ZodType[])
// If a transformer row has no rule, default to z.any()
const mapTransformers = async (
  transformers?: string[] | null,
  params?: any,
): Promise<ZodType[]> => {
  if (!transformers || transformers.length === 0) return [];
  const rows = await Promise.all(
    transformers.map((id) => fieldTransformerFetcher.fetch(id)),
  );
  return rows.map((row) =>
    row?.rule ? evalZodSchema(row.rule, params) : z.any(),
  );
};

async function fetchFieldDefs(
  keys: string[],
  formParams?: Record<string, any>,
) {
  if (keys.length === 0) return [];
  return Promise.all(
    keys.map(async (k) => {
      const field = await fieldFetcher.fetch(k); // IField | null
      const name = field?.name ?? k;
      const fp = formParams?.[name]; // per-form overrides

      const validators = await mapValidators(
        field?.validators ?? undefined,
        fp?.params,
      );
      const transformers = await mapTransformers(
        field?.transformers ?? undefined,
        fp?.params,
      );

      return {
        ...(field ?? ({} as IField)),
        name, // ensure name exists
        type: field?.type ?? "text",
        label: field?.label ?? "",
        value: fp?.value ?? undefined, // seed value if provided
        params: fp?.params ?? undefined, // <- **attach params here**
        validators,
        transformers,
      } as IJoinedField;
    }),
  );
}

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
export const useDynamicFormSchema = (
  name: string,
  opts?: { role?: FilledBy | "all" },
) => {
  const role = opts?.role ?? "student";
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

  const formParams = useMemo(
    () => (data?.params ?? {}) as Record<string, any>,
    [data?.params],
  );

  useEffect(() => {
    const run = async () => {
      setMappingLoading(true);
      try {
        // get keys by role (student-only by default)
        const keys = fieldKeysByRole(data, role);

        // fetch minimal defs
        const defs = await fetchFieldDefs(keys, formParams);

        // attach filledBy if you want it on the object
        const roles = (data?.fields ?? {}) as FieldRoles;
        const joined = defs.map((f: any) => ({
          ...f,
          filledBy: roles[f?.name ?? ""]?.for,
        })) as IJoinedField[];

        setFields(joined);
      } finally {
        setMappingLoading(false);
      }
    };
    run();
  }, [data?.fields, data?.schema, data?.params]);

  return {
    fields, // student fields only by default
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
  if (!baseDocumentId) return;
  const baseDocument = await db
    .from("base_documents")
    .select("url")
    .eq("id", baseDocumentId)
    .single();

  return baseDocument;
};
