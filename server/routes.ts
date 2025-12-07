import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInterviewSessionSchema, type CompanyProfile } from "@shared/schema";
import { fromError } from "zod-validation-error";
import {
  analyzeResume,
  generateHRResponse,
  generateVerdict,
  generateInitialGreeting,
  type Archetype
} from "./openai";
import { researchCompany, researchCompanyWithGroq, isPerplexityConfigured } from "./perplexity";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/company/status", async (req, res) => {
    res.json({ configured: isPerplexityConfigured() });
  });

  app.post("/api/company/research", async (req, res) => {
    try {
      const { companyName } = req.body;
      if (!companyName) {
        return res.status(400).json({ error: "Company name is required" });
      }

      let profile: CompanyProfile;

      if (isPerplexityConfigured()) {
        // Use Perplexity for real-time research
        profile = await researchCompany(companyName);
      } else {
        // Use Groq fallback (based on training data)
        console.log(`Using Groq fallback for company research: ${companyName}`);
        profile = await researchCompanyWithGroq(companyName);
      }
      res.json({ profile });
    } catch (error: any) {
      console.error("Company research error:", error);
      res.status(500).json({ error: "Failed to research company" });
    }
  });

  app.post("/api/resume/analyze", async (req, res) => {
    try {
      const { resumeText, archetype, companyProfile } = req.body;
      if (!resumeText || !archetype) {
        return res.status(400).json({ error: "Resume text and archetype required" });
      }
      const analysis = await analyzeResume(resumeText, archetype as Archetype, companyProfile);
      res.json(analysis);
    } catch (error: any) {
      console.error("Resume analysis error:", error);
      res.status(500).json({ error: "Failed to analyze resume" });
    }
  });

  // Generate initial greeting for interview
  app.post("/api/interview/greeting", async (req, res) => {
    try {
      const { archetype, resumeSummary, companyProfile } = req.body;
      if (!archetype) {
        return res.status(400).json({ error: "Archetype required" });
      }
      const greeting = await generateInitialGreeting(archetype as Archetype, resumeSummary, companyProfile);
      res.json({ greeting });
    } catch (error: any) {
      console.error("Greeting error:", error);
      res.status(500).json({ error: "Failed to generate greeting" });
    }
  });

  // Chat with HR-9000
  app.post("/api/interview/chat", async (req, res) => {
    try {
      const { archetype, currentAct, conversationHistory, messagesInCurrentAct, resumeSummary, companyProfile } = req.body;
      if (!archetype || currentAct === undefined || !conversationHistory) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const response = await generateHRResponse(
        archetype as Archetype,
        currentAct,
        conversationHistory,
        resumeSummary,
        messagesInCurrentAct || 0,
        companyProfile
      );
      res.json(response);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Generate final verdict
  app.post("/api/interview/verdict", async (req, res) => {
    try {
      const { archetype, transcript, resumeSummary, companyProfile } = req.body;
      if (!archetype || !transcript) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const verdict = await generateVerdict(archetype as Archetype, transcript, resumeSummary, companyProfile);
      res.json(verdict);
    } catch (error: any) {
      console.error("Verdict error:", error);
      res.status(500).json({ error: "Failed to generate verdict" });
    }
  });

  // Save an interview session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = {
        ...req.body,
        strengths: req.body.strengths || [],
        areasForImprovement: req.body.areasForImprovement || [],
        interviewTips: req.body.interviewTips || [],
      };
      const validatedData = insertInterviewSessionSchema.parse(sessionData);
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
