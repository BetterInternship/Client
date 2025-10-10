/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-10-11 01:02:33
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { DocumentDatabase, DocumentTables } from '@betterinternship/schema.moa';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// Environment setup
const DB_URL = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_URL;
const DB_ANON_KEY = process.env.NEXT_PUBLIC_MOA_DOCS_SUPABASE_ANON_KEY;

if (!DB_URL || !DB_ANON_KEY) {
  console.warn('Missing supabase configuration for MOA docs backend.');
  // ! PUT THIS BACK IN when codebase becomes stable
  // throw new Error("[ERROR:ENV] Missing supabase configuration (for MOA docs backend).");
}
const db = createClient<DocumentDatabase>(DB_URL ?? '', DB_ANON_KEY ?? '');

/**
 * Moa backend types.
 */
type FieldValidator = DocumentTables<'field_validators'>;
type FieldSchema = DocumentTables<'field_schemas'>;

/**
 * Util functions for fetching.
 */
const fetchFieldValidator = async (name: string): Promise<FieldValidator> => {
  const { data, error } = await db
    .from('field_validators')
    .select('*')
    .eq('name', name)
    .single();
  if (error) throw new Error(`Field validator "${name}" does not exist.`);
  return data as FieldValidator;
};

/**
 * Fetches actual data from db.
 *
 * @returns
 */
export const useFieldValidator = (name: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    enabled: Boolean(name),
    queryKey: ['field-validators', name],
    queryFn: () => fetchFieldValidator(name),
    initialData: () => {
      const fieldValidators = queryClient.getQueryData<Array<FieldValidator>>([
        'field-validators',
      ]);
      return fieldValidators?.find((f: FieldValidator) => f.name === name);
    },
    initialDataUpdatedAt: () => {
      const state = queryClient.getQueryState(['field-validators']);
      return state?.dataUpdatedAt;
    },
    staleTime: 5 * 60 * 1000, // ! in the future, make this a day
  });
};
