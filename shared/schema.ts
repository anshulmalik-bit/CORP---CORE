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

export interface ATSScore {
  overall: number;
  sections: {
    experience: number;
    skills: number;
    keywords: number;
    formatting: number;
    education: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
  parsedSections: {
    experience?: string;
    skills?: string;
    education?: string;
    summary?: string;
  };
}

export interface CompanyProfile {
  name: string;
  industry: string;
  overview: string;
  history: string;
  financialSituation: string;
  futurePlans: string;
  culture: string;
  interviewStyle: string;
  typicalQuestions: string[];
  values: string[];
  recentNews: string;
  sources: string[];
}

export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  archetype: text("archetype").notNull(),
  score: integer("score").notNull(),
  transcript: jsonb("transcript").notNull().$type<Array<{ role: "hr" | "user"; text: string }>>(),
  resumeSummary: text("resume_summary"),
  verdict: text("verdict"),
  corporateTitle: text("corporate_title"),
  strengths: jsonb("strengths").$type<string[]>(),
  areasForImprovement: jsonb("areas_for_improvement").$type<string[]>(),
  realAdvice: text("real_advice"),
  interviewTips: jsonb("interview_tips").$type<string[]>(),
  companyName: text("company_name"),
  companyProfile: jsonb("company_profile").$type<CompanyProfile>(),
  atsScore: jsonb("ats_score").$type<ATSScore>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type InterviewSession = typeof interviewSessions.$inferSelect;
