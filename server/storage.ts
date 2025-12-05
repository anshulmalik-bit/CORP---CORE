import { db } from "../db";
import { type User, type InsertUser, type InterviewSession, type InsertInterviewSession, users, interviewSessions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession>;
  getInterviewSessions(limit?: number): Promise<InterviewSession[]>;
  getInterviewSession(id: number): Promise<InterviewSession | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession> {
    const [newSession] = await db.insert(interviewSessions).values(session as any).returning();
    return newSession;
  }

  async getInterviewSessions(limit: number = 10): Promise<InterviewSession[]> {
    return await db.select().from(interviewSessions).orderBy(desc(interviewSessions.createdAt)).limit(limit);
  }

  async getInterviewSession(id: number): Promise<InterviewSession | undefined> {
    const [session] = await db.select().from(interviewSessions).where(eq(interviewSessions.id, id));
    return session;
  }
}

export const storage = new DatabaseStorage();
