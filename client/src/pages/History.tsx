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

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

      <div className="container mx-auto px-4 py-12 relative z-10 min-h-[80vh]">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display uppercase">
            YOUR <span className="bg-black text-white px-2">FAILURES</span>
          </h1>
          <Link href="/">
            <button className="bg-accent text-black font-bold px-6 py-3 border-2 border-black brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
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
                className="border-4 border-black bg-white p-6 brutalist-shadow relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-2xl mb-2">
                      {session.archetype}
                    </h3>
                    <p className="font-mono text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-display">{session.score}%</div>
                    <div className="text-xs font-mono uppercase">
                      {session.score > 60 ? "Mid" : "Failed"}
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-black pt-4 mt-4">
                  <p className="font-mono text-sm text-gray-600">
                    {session.transcript.length} messages exchanged with HR-9000
                  </p>
                </div>

                {/* Status badge */}
                <div className="absolute top-0 right-0 bg-destructive text-white px-3 py-1 text-xs font-bold">
                  ARCHIVED
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
            >
              Start Your First Ritual
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
