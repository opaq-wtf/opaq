import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema/user";
import { emailVerification } from "./schema/email-verification";

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.NEXT_DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Database connection string not found in environment variables",
  );
}
const client = postgres(connectionString);
export const db = drizzle(client, {
  schema: {
    users,
    emailVerification,
  },
  logger: true,
});
