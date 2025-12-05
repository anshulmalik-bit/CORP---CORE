import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInterviewSessionSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Save an interview session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertInterviewSessionSchema.parse(req.body);
      const session = await storage.createInterviewSession(validatedData);
      res.json(session);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to save session" });
    }
  });

  // Get recent interview sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await storage.getInterviewSessions(limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get a specific interview session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getInterviewSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  return httpServer;
}
