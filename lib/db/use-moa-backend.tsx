/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-10-15 00:45:13
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { useEffect, useMemo, useState } from "react";
import {
  DocumentDatabase,
  DocumentTables,
  EntityDatabase,
  EntityTables,
} from "@betterinternship/schema.moa";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import {
  create as createBatchedFetcher,
  keyResolver,
  windowScheduler,
} from "@yornaath/batshit";
import z, { ZodType } from "zod";
import { Database, Tables } from "@betterinternship/schema.base";

// Environment setup
const DB_URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const DB_ANON_KEY_BASE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DB_URL = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_URL;
const DB_ANON_KEY = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_ANON_KEY;
const DB_URL_ENT = process.env.NEXT_PUBLIC_MOA_ENTITY_SUPABASE_URL;
const DB_ANON_KEY_ENT = process.env.NEXT_PUBLIC_MOA_ENTITY_SUPABASE_ANON_KEY;

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
const db_ent = createClient<EntityDatabase>(
  DB_URL_ENT ?? "",
  DB_ANON_KEY_ENT ?? "",
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
  validators: ZodType[];
  transformers: ZodType[];
}

export const fetchForms = async (): Promise<IFormSchema[]> => {
  const { data, error } = await db
    .from("form_schemas")
    .select("*")
    .contains("initiators", ["student"]);
  if (error) {
    throw new Error(
      `[form_schemas/select] ${error.code ?? ""} ${error.message}`,
    );
  }
  return data ?? [];
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

  // Maps validators to their db fetches
  const mapValidators = async (validators?: string[]) =>
    await Promise.all(
      validators?.map(
        async (v) =>
          await fieldValidatorFetcher
            .fetch(v)
            .then((v) => (v?.rule ? evalZodSchema(v.rule) : z.any())),
      ) ?? [],
    );

  const mapTransformers = async (transformers?: string[]) =>
    await Promise.all(
      transformers?.map(
        async (t) =>
          await fieldTransformerFetcher
            .fetch(t)
            .then((t) => (t?.rule ? evalZodSchema(t.rule) : z.any())),
      ) ?? [],
    );

  // Maps fields to their db fetches
  const mapFields = async (fields: string[]) =>
    await Promise.all(
      fields.map(
        async (f) =>
          await fieldFetcher.fetch(f).then(async (field: IField | null) => ({
            ...(field ?? ({} as IField)),
            type: field?.type ?? "text",
            label: field?.label ?? "",
            section: field?.section,
            validators: await mapValidators(field?.validators ?? undefined),
            transformers: await mapTransformers(field?.transformers),
          })),
      ),
    );

  useEffect(() => {
    const schema = (data?.schema ?? []) as { field: string }[];
    const fields = schema.map((s) => s.field);

    const list =
      safeToArray(data?.fields_filled_by_user) || safeToArray(fields);

    if (list.length === 0) {
      setFields([]);
      setMappingLoading(false);
      return;
    }

    setMappingLoading(true);
    void mapFields(list)
      .then((fields) =>
        setFields(
          fields.map((f) => ({
            ...f,
            section: f.section ?? null,
          })),
        ),
      )
      .finally(() => setMappingLoading(false));
  }, [data?.fields_filled_by_user, data?.schema]);

  return {
    fields,
    error,
    isLoading: collectionLoading || mappingLoading,
  };
};

export const fetchAllUserForms = async (userId: string) => {
  console.log(userId, "im in");
  if (!userId) return;

  const { data, error } = await db_base
    .from("user_internship_forms")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(`Could not fetch user forms: ${error.message}`);
  return data as IUserForm[];
};

// Helpers
const safeToArray = (val: unknown): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};
