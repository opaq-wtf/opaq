//CONNECTING TO POSTGRESDB

import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.NEXT_DATABASE_URL,
});
