/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-10-12 10:05:36
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

// Environment setup
const DB_URL = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_URL;
const DB_ANON_KEY = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_ANON_KEY;

if (!DB_URL || !DB_ANON_KEY) {
  console.warn("Missing supabase configuration for MOA docs backend.");
  // ! PUT THIS BACK IN when codebase becomes stable
  // throw new Error("[ERROR:ENV] Missing supabase configuration (for MOA docs backend).");
}
const db = createClient<DocumentDatabase>(DB_URL ?? "", DB_ANON_KEY ?? "");

/**
 * Moa backend types.
 */
type FieldValidator = DocumentTables<"field_validators">;
type IField = DocumentTables<"field_repository">;
type IFieldCollection = DocumentTables<"form_field_collections">;

/**
 * Joined field.
 * All validators are included.
 */
type IJoinedField = {
  id: string;
  name: string;
  validators: ZodType[];
  type: "text" | "number" | "date" | "select" | "time";
  options?: string;
  label: string;
};

export const fetchForms = async (): Promise<IFieldCollection[]> => {
  const { data, error } = await db.from("form_field_collections").select("*");
  if (error) {
    throw new Error(
      `[form_field_collections/select] ${error.code ?? ""} ${error.message}`,
    );
  }
  // @/ts-ignore
  return data ?? [];
};

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
    .from("form_field_collections")
    .select("*")
    .eq("name", name)
    .single();
  if (error) throw new Error(`Could not find the field collections "${name}".`);
  return data as IFieldCollection;
};

/**
 * Has an implied eval, hence the name.
 * Only ever evaluates zod schemas, so we're fine.
 *
 * @param schema
 * @returns
 */
function evalZodSchema(schema: string) {
  // ? Gotta be careful with this shit
  const ret = `return ${schema}`;
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const evaluator = new Function("z", ret);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return evaluator(z) as ZodType;
}

/**
 * Fetches actual data from db.
 *
 * @hook
 */
export const useDynamicFormSchema = (name: string) => {
  const [fields, setFields] = useState<IJoinedField[]>([]);
  const { data, error } = useQuery({
    queryKey: ["field-collections"],
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

  // Maps fields to their db fetches
  const mapFields = async (fields: string[]) =>
    await Promise.all(
      fields.map(
        async (f) =>
          await fieldFetcher.fetch(f).then(async (field: IField | null) => ({
            ...(field ?? ({} as IField)),
            type: field?.type ?? "text",
            label: field?.label ?? "",
            options: field?.options,
            prefill: field?.prefill,
            filled_by: field?.filled_by,
            validators: await mapValidators(field?.validators),
          })),
      ),
    );

  useEffect(() => {
    if (!data?.fields) return;
    const fieldList = data.fields as string[];
    const fields = mapFields(fieldList);
    console.log("Fields", fields);

    void fields.then((f) => setFields(f));
  }, [data?.fields]);

  return {
    fields,
    error,
  };
};
