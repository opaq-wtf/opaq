import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const emailVerification = pgTable("email_verification", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
