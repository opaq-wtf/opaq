import { pgTable, text, timestamp, uniqueIndex, boolean } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    username: text("username").unique().notNull(),
    password: text("password").notNull(),
    bio: text("bio"),
    location: text("location"),
    website: text("website"),
    contactVisible: boolean("contact_visible").default(false),
    profilePicture: text("profile_picture"), // URL to uploaded profile picture
    profilePictureData: text("profile_picture_data"), // Base64 encoded image data stored in DB
    profilePictureIrysId: text("profile_picture_irys_id"), // Irys ID for decentralized storage
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }), // Date of birth - can only be set once
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
    usernameIdx: uniqueIndex("username_idx").on(table.username),
  }),
);
