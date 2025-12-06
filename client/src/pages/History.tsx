import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/hooks/use-sound";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.98 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <Layout>
      <motion.div 
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${noiseBg})` }}
        animate={{ opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        className="container mx-auto px-4 py-12 relative z-10 min-h-[80vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-display uppercase"
            animate={{ 
              textShadow: [
                "0 0 0px transparent",
                "3px 3px 0px rgba(255,0,255,0.2)",
                "0 0 0px transparent"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            YOUR <motion.span 
              className="bg-black text-white px-2 inline-block"
              whileHover={{ scale: 1.05 }}
            >FAILURES</motion.span>
          </motion.h1>
          <Link href="/">
            <motion.button 
              className="bg-accent text-black font-bold px-6 py-3 border-2 border-black brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
              data-testid="button-new-ritual"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playSound('click')}
            >
              NEW RITUAL
            </motion.button>
          </Link>
        </motion.div>

        {isLoading ? (
          <motion.div 
            className="text-center font-mono text-2xl"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 bg-secondary"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            Loading your corporate trauma...
          </motion.div>
        ) : sessions && sessions.length > 0 ? (
          <motion.div 
            className="grid gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {sessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  variants={cardVariants}
                  className="border-4 border-black bg-white p-6 brutalist-shadow relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
                  data-testid={`card-session-${session.id}`}
                  onMouseEnter={() => playSound('hover')}
                  whileHover={{ 
                    borderColor: "#ff00ff",
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/5 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.h3 
                          className="font-display text-2xl"
                          whileHover={{ scale: 1.02 }}
                        >
                          {session.archetype}
                        </motion.h3>
                        <motion.span 
                          className="bg-gray-100 border border-black px-2 py-1 text-xs font-mono"
                          whileHover={{ backgroundColor: "#ff00ff", color: "#fff" }}
                        >
                          #{session.id}
                        </motion.span>
                      </div>
                      {session.corporateTitle && (
                        <motion.p 
                          className="font-mono text-sm text-secondary mb-2" 
                          data-testid={`text-title-${session.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                          "{session.corporateTitle}"
                        </motion.p>
                      )}
                      <p className="font-mono text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <motion.div 
                      className="text-right"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + idx * 0.1, type: "spring" }}
                    >
                      <motion.div 
                        className={`text-5xl font-display ${getScoreColor(session.score)}`} 
                        data-testid={`text-score-${session.id}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {session.score}
                      </motion.div>
                      <motion.div 
                        className="text-xs font-mono uppercase bg-black text-white px-2 py-1 inline-block"
                        whileHover={{ backgroundColor: "#ff00ff" }}
                      >
                        {getScoreLabel(session.score)}
                      </motion.div>
                    </motion.div>
                  </div>

                  {session.verdict && (
                    <motion.div 
                      className="bg-gray-50 border border-black p-3 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                    >
                      <p className="font-mono text-xs text-gray-700 line-clamp-2" data-testid={`text-verdict-${session.id}`}>
                        {session.verdict}
                      </p>
                    </motion.div>
                  )}

                  <motion.div 
                    className="border-t-2 border-black pt-4 mt-4 flex justify-between items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <p className="font-mono text-sm text-gray-600">
                      {session.transcript.length} messages exchanged with HR-9000
                    </p>
                    <motion.div 
                      className="text-xs font-mono text-gray-400"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ARCHIVED
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="absolute top-0 right-0 bg-destructive text-white px-3 py-1 text-xs font-bold"
                    initial={{ x: 50 }}
                    animate={{ x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                  >
                    EVALUATED
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center border-4 border-black bg-white p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.p 
              className="font-display text-3xl mb-4"
              animate={{ 
                textShadow: [
                  "0 0 0px transparent",
                  "0 0 10px rgba(255,0,255,0.3)",
                  "0 0 0px transparent"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              NO FAILURES YET
            </motion.p>
            <p className="font-mono text-sm mb-6">You haven't been evaluated by the system.</p>
            <motion.button
              onClick={() => { playSound('click'); setLocation("/"); }}
              className="bg-primary text-white font-bold px-8 py-4 border-2 border-black brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
              data-testid="button-start-first-ritual"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your First Ritual
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
