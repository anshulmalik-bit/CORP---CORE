import React, { createContext, useContext, useState } from "react";
import type { ATSScore, CompanyProfile } from "@shared/schema";

type Archetype = "MBA" | "BTech" | "Analyst" | null;

interface ResumeAnalysis {
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  buzzwordScore: number;
  atsScore?: ATSScore;
}

interface VerdictData {
  score: number;
  verdict: string;
  corporateTitle: string;
  strengths: string[];
  areasForImprovement: string[];
  realAdvice: string;
  interviewTips: string[];
}

interface SessionState {
  archetype: Archetype;
  setArchetype: (a: Archetype) => void;
  name: string;
  setName: (n: string) => void;
  score: number;
  setScore: (s: number) => void;
  transcript: { role: "hr" | "user"; text: string }[];
  addTranscript: (role: "hr" | "user", text: string) => void;
  clearTranscript: () => void;
  resumeText: string;
  setResumeText: (t: string) => void;
  resumeAnalysis: ResumeAnalysis | null;
  setResumeAnalysis: (a: ResumeAnalysis | null) => void;
  verdictData: VerdictData | null;
  setVerdictData: (v: VerdictData | null) => void;
  targetCompany: string;
  setTargetCompany: (c: string) => void;
  companyProfile: CompanyProfile | null;
  setCompanyProfile: (p: CompanyProfile | null) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionState | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [archetype, setArchetype] = useState<Archetype>(null);
  const [name, setName] = useState("Candidate 404");
  const [score, setScore] = useState(50);
  const [transcript, setTranscript] = useState<{ role: "hr" | "user"; text: string }[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [verdictData, setVerdictData] = useState<VerdictData | null>(null);
  const [targetCompany, setTargetCompany] = useState("");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const addTranscript = (role: "hr" | "user", text: string) => {
    setTranscript((prev) => [...prev, { role, text }]);
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  const resetSession = () => {
    setArchetype(null);
    setName("Candidate 404");
    setScore(50);
    setTranscript([]);
    setResumeText("");
    setResumeAnalysis(null);
    setVerdictData(null);
    setTargetCompany("");
    setCompanyProfile(null);
  };

  return (
    <SessionContext.Provider
      value={{
        archetype,
        setArchetype,
        name,
        setName,
        score,
        setScore,
        transcript,
        addTranscript,
        clearTranscript,
        resumeText,
        setResumeText,
        resumeAnalysis,
        setResumeAnalysis,
        verdictData,
        setVerdictData,
        targetCompany,
        setTargetCompany,
        companyProfile,
        setCompanyProfile,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
