import React, { createContext, useContext, useState } from "react";

type Archetype = "MBA" | "BTech" | "Analyst" | null;

interface SessionState {
  archetype: Archetype;
  setArchetype: (a: Archetype) => void;
  name: string;
  setName: (n: string) => void;
  score: number;
  setScore: (s: number) => void;
  transcript: { role: "hr" | "user"; text: string }[];
  addTranscript: (role: "hr" | "user", text: string) => void;
}

const SessionContext = createContext<SessionState | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [archetype, setArchetype] = useState<Archetype>(null);
  const [name, setName] = useState("Candidate 404");
  const [score, setScore] = useState(50);
  const [transcript, setTranscript] = useState<{ role: "hr" | "user"; text: string }[]>([]);

  const addTranscript = (role: "hr" | "user", text: string) => {
    setTranscript((prev) => [...prev, { role, text }]);
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
