import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: text("id").primaryKey(),
        fullName: text("full_name").notNull(),
        email: text("email").notNull().unique(),
        username: text("username").unique().notNull(),
        password: text("password").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }),
        updatedAt: timestamp("updated_at", { withTimezone: true }),
        emailVerified: timestamp("email_verified", { withTimezone: true }),
    },
    (table) => ({
        emailIdx: uniqueIndex("email_idx").on(table.email),
        usernameIdx: uniqueIndex("username_idx").on(table.username),
    })
);
