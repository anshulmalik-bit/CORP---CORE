import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";

interface InterviewSession {
  id: number;
  archetype: string;
  score: number;
  createdAt: string;
  transcript: Array<{ role: "hr" | "user"; text: string }>;
  corporateTitle?: string;
  verdict?: string;
}

export default function History() {
  const [_, setLocation] = useLocation();

  const { data: sessions, isLoading } = useQuery<InterviewSession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return response.json();
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "EMPLOYABLE";
    if (score >= 60) return "PROCESSING";
    if (score >= 40) return "POTENTIAL";
    return "CONCERNING";
  };

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

      <div className="container mx-auto px-4 py-12 relative z-10 min-h-[80vh]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <h1 className="text-4xl md:text-6xl font-display uppercase">
            YOUR <span className="bg-black text-white px-2">FAILURES</span>
          </h1>
          <Link href="/">
            <button 
              className="bg-accent text-black font-bold px-6 py-3 border-2 border-black brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
              data-testid="button-new-ritual"
            >
              NEW RITUAL
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center font-mono text-2xl animate-pulse">
            Loading your corporate trauma...
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid gap-6">
            {sessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-4 border-black bg-white p-6 brutalist-shadow relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
                data-testid={`card-session-${session.id}`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-2xl">
                        {session.archetype}
                      </h3>
                      <span className="bg-gray-100 border border-black px-2 py-1 text-xs font-mono">
                        #{session.id}
                      </span>
                    </div>
                    {session.corporateTitle && (
                      <p className="font-mono text-sm text-secondary mb-2" data-testid={`text-title-${session.id}`}>
                        "{session.corporateTitle}"
                      </p>
                    )}
                    <p className="font-mono text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-display ${getScoreColor(session.score)}`} data-testid={`text-score-${session.id}`}>
                      {session.score}
                    </div>
                    <div className="text-xs font-mono uppercase bg-black text-white px-2 py-1 inline-block">
                      {getScoreLabel(session.score)}
                    </div>
                  </div>
                </div>

                {session.verdict && (
                  <div className="bg-gray-50 border border-black p-3 mb-4">
                    <p className="font-mono text-xs text-gray-700 line-clamp-2" data-testid={`text-verdict-${session.id}`}>
                      {session.verdict}
                    </p>
                  </div>
                )}

                <div className="border-t-2 border-black pt-4 mt-4 flex justify-between items-center">
                  <p className="font-mono text-sm text-gray-600">
                    {session.transcript.length} messages exchanged with HR-9000
                  </p>
                  <div className="text-xs font-mono text-gray-400">
                    ARCHIVED
                  </div>
                </div>

                <div className="absolute top-0 right-0 bg-destructive text-white px-3 py-1 text-xs font-bold">
                  EVALUATED
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center border-4 border-black bg-white p-12">
            <p className="font-display text-3xl mb-4">NO FAILURES YET</p>
            <p className="font-mono text-sm mb-6">You haven't been evaluated by the system.</p>
            <button
              onClick={() => setLocation("/")}
              className="bg-primary text-white font-bold px-8 py-4 border-2 border-black brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
              data-testid="button-start-first-ritual"
            >
              Start Your First Ritual
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
