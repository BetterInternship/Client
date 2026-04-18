/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-22 14:37:59
 * @ Modified time: 2026-04-19 00:00:00
 * @ Description:
 *
 * Server-only data loader for moa records.
 */

import "server-only";
import { Moa } from "./db.types";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "@betterinternship/schema.base";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error("[ERROR:ENV] Missing database url.");

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: DATABASE_URL,
    }),
  }),
});

export interface BIMoaData {
  moa: Moa[];
}

/**
 * Fetches the moa table on the server and returns serializable data for clients.
 */
export const getBiMoaData = async (): Promise<BIMoaData> => {
  const moa = await db.selectFrom("moa").selectAll().execute();
  return { moa };
};
