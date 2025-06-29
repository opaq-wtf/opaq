import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { users } from "./user";
import { relations } from "drizzle-orm";

export const pitches = pgTable("pitches", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    fileUrl: text("file_url").notNull(),
    irysId: text("irys_id").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull(),
    visibility: text("visibility").notNull().default("private"), // "private" | "public"
    viewsCount: integer("views_count").notNull().default(0),
    likesCount: integer("likes_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Table to store OTP for pitch visibility change
export const pitchOtpVerification = pgTable("pitch_otp_verification", {
    id: text("id").primaryKey(),
    pitchId: text("pitch_id")
        .notNull()
        .references(() => pitches.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    otpHash: text("otp_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Table to track individual user interactions with pitches
export const pitchInteractions = pgTable("pitch_interactions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    pitchId: text("pitch_id")
        .notNull()
        .references(() => pitches.id, { onDelete: "cascade" }),
    hasViewed: integer("has_viewed").notNull().default(0), // 0 = false, 1 = true
    hasLiked: integer("has_liked").notNull().default(0), // 0 = false, 1 = true
    firstViewedAt: timestamp("first_viewed_at", { withTimezone: true }),
    lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
    likedAt: timestamp("liked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pitchesRelations = relations(pitches, ({ one, many }) => ({
    user: one(users, {
        fields: [pitches.userId],
        references: [users.id],
    }),
    interactions: many(pitchInteractions),
    otpVerification: one(pitchOtpVerification, {
        fields: [pitches.id],
        references: [pitchOtpVerification.pitchId],
    }),
}));

export const pitchInteractionsRelations = relations(pitchInteractions, ({ one }) => ({
    user: one(users, {
        fields: [pitchInteractions.userId],
        references: [users.id],
    }),
    pitch: one(pitches, {
        fields: [pitchInteractions.pitchId],
        references: [pitches.id],
    }),
}));

export const pitchOtpVerificationRelations = relations(pitchOtpVerification, ({ one }) => ({
    user: one(users, {
        fields: [pitchOtpVerification.userId],
        references: [users.id],
    }),
    pitch: one(pitches, {
        fields: [pitchOtpVerification.pitchId],
        references: [pitches.id],
    }),
}));
