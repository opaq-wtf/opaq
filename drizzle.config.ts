import type { Config } from "drizzle-kit";

// Validate connection string
const connectionString = process.env.NEXT_DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Database connection string not found in environment variables",
  );
}

export default {
  schema: "./src/lib/db/schema/*.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  url: connectionString,
  verbose: true,
  strict: true,
  tablesFilter: ["!pg_stat_statements", "!pg_stat_statements_info"],
} as Config;
