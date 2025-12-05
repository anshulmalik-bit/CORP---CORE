import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  archetype: text("archetype").notNull(),
  score: integer("score").notNull(),
  transcript: jsonb("transcript").notNull().$type<Array<{ role: "hr" | "user"; text: string }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type InterviewSession = typeof interviewSessions.$inferSelect;
