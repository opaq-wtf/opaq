import { db } from "../db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Migrating database...");
  await migrate(db, { migrationsFolder: "src/lib/db/migrations" });
  console.log("Migration complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
