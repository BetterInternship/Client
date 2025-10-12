/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-22 14:37:59
 * @ Modified time: 2025-10-11 00:03:47
 * @ Description:
 *
 * Separates out the server component of the context.
 */

import { useCallback, useEffect, useState } from "react";
import { Moa } from "./db.types";
import { createClient } from "@supabase/supabase-js";

// Environment setup
const DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const DB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!DB_URL || !DB_ANON_KEY)
  throw new Error("[ERROR:ENV] Missing supabase configuration.");
const db = createClient(DB_URL ?? "", DB_ANON_KEY ?? "");

/**
 * Fetches actual data from db.
 *
 * @returns
 */
export const createBiMoaContext = () => {
  const [moa, setMoa] = useState<Moa[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the entire moa table.
   */
  const fetchMoaRefTable = async () => {
    const { data, error } = await db.from("moa").select("*");
    if (error) console.error(error);
    else setMoa(data);
    setLoading(false);
  };

  /**
   * Checks whether or not an association between the employer and university exists.
   *
   * @param employer_id
   * @param university_id
   */
  const check = useCallback(
    (employer_id: string, university_id: string) => {
      if (loading) return false;
      return moa.some(
        (m) =>
          m.employer_id === employer_id &&
          m.university_id === university_id &&
          new Date(m.expires_at ?? "").getTime() > new Date().getTime()
      );
    },
    [moa, loading]
  );

  useEffect(() => {
    fetchMoaRefTable();
  }, []);

  return {
    check,
  };
};
