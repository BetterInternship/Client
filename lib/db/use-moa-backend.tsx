/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-11 00:00:00
 * @ Modified time: 2025-10-11 02:16:20
 * @ Description:
 *
 * This handles interactions with our MOA Api server.
 */

import { useCallback, useEffect, useState } from 'react';
import { DocumentDatabase, DocumentTables } from '@betterinternship/schema.moa';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { create as createBatchedFetcher, keyResolver } from '@yornaath/batshit';

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
 * Allows us to batch requests to the endpoint.
 */
const fieldValidatorFetcher = createBatchedFetcher({
  fetcher: async (names: string[]): Promise<FieldValidator[]> => {
    const { data, error } = await db
      .from('field_validators')
      .select('*')
      .in('name', names);
    if (error)
      throw new Error(`Could not find at least one of the field validators.`);
    return data as FieldValidator[];
  },
  resolver: keyResolver('name'),
});

/**
 * Fetches actual data from db.
 *
 * @returns
 */
export const useFieldValidators = (names: string[]) => {
  const queryClient = useQueryClient();

  // Queries latest names from server
  const [newNames, setNewNames] = useState<string[]>([]);
  const fetchLatestFieldValidators = useCallback(async () => {
    return await Promise.all(
      newNames.map((name) => fieldValidatorFetcher.fetch(name)),
    );
  }, [newNames]);

  // Retrieve validation rules
  const { data, error } = useQuery({
    queryKey: ['field-validators'],
    queryFn: fetchLatestFieldValidators,
  });

  // Refetch called when changing props
  const refetchFieldValidators = (names: string[]) => {
    const missing = [];
    const fieldValidators: FieldValidator[] =
      queryClient.getQueryData<Array<FieldValidator>>(['field-validators']) ??
      [];

    for (const name of names)
      if (!fieldValidators.find((f) => f.name === name)) missing.push(name);

    setNewNames(missing);
  };

  // Trigger refetch if new names requested
  useEffect(() => {
    refetchFieldValidators(names);
    return () => setNewNames([]);
  }, [names]);
};
