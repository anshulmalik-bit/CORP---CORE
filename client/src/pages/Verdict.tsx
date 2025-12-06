import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/hooks/use-sound";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import stampImg from "@assets/generated_images/neo-brutalist_corporate_processed_stamp.png";
import hrBotImg from "@assets/generated_images/retro_corporate_hr_robot_head.png";
import { useMutation } from "@tanstack/react-query";

interface VerdictData {
  score: number;
  verdict: string;
  corporateTitle: string;
  strengths: string[];
  areasForImprovement: string[];
  realAdvice: string;
  interviewTips: string[];
}

export default function Verdict() {
  const [_, setLocation] = useLocation();
  const { archetype, transcript, resumeAnalysis, setVerdictData, resetSession, companyProfile, targetCompany } = useSession();
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);

  useEffect(() => {
    const generateVerdict = async () => {
      if (transcript.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/interview/verdict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            archetype: archetype || "BTech",
            transcript,
            resumeSummary: resumeAnalysis?.feedback,
            companyProfile: companyProfile || undefined
          })
        });

        if (response.ok) {
          const data = await response.json();
          setVerdict(data);
          setVerdictData(data);
        } else {
          setVerdict({
            score: Math.floor(Math.random() * 40) + 30,
            verdict: "The algorithm has processed your existence. Results: Inconclusive. Future: Uncertain.",
            corporateTitle: "Pending Human Resource",
            strengths: ["You completed the interview", "You have a pulse", "You can type"],
            areasForImprovement: ["Corporate enthusiasm", "Synergy quotient", "Buzzword density"],
            realAdvice: "Keep practicing! Every interview is a learning opportunity. Focus on specific examples using the STAR method.",
            interviewTips: ["Research the company beforehand", "Prepare concrete examples", "Ask thoughtful questions"]
          });
        }
      } catch (error) {
        console.error("Verdict generation error:", error);
        setVerdict({
          score: Math.floor(Math.random() * 40) + 30,
          verdict: "System error during evaluation. Much like your career prospects, the results are undefined.",
          corporateTitle: "Error 404: Title Not Found",
          strengths: ["Persistence", "Resilience", "Showing up"],
          areasForImprovement: ["Technical connectivity", "System compatibility", "Digital presence"],
          realAdvice: "Technical difficulties happen - what matters is how you handle them. Stay calm and professional.",
          interviewTips: ["Have a backup plan", "Stay composed under pressure", "Follow up professionally"]
        });
      }
      setLoading(false);
    };

    generateVerdict();
  }, []);

  const saveSessionMutation = useMutation({
    mutationFn: async () => {
      if (!verdict) return;
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetype: archetype || "Unknown",
          score: verdict.score,
          transcript,
          resumeSummary: resumeAnalysis?.feedback,
          verdict: verdict.verdict,
          corporateTitle: verdict.corporateTitle,
          strengths: verdict.strengths,
          areasForImprovement: verdict.areasForImprovement,
          realAdvice: verdict.realAdvice,
          interviewTips: verdict.interviewTips,
        }),
      });
      if (!response.ok) throw new Error("Failed to save session");
      return response.json();
    },
  });

  useEffect(() => {
    if (verdict && transcript.length > 0) {
      saveSessionMutation.mutate();
    }
  }, [verdict]);

  const handleTryAgain = () => {
    resetSession();
    setLocation("/");
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "ASSET APPROVED";
    if (score >= 60) return "CONDITIONAL CLEARANCE";
    if (score >= 40) return "PROBATIONARY STATUS";
    return "TERMINATION RECOMMENDED";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { status: "OPTIMAL", color: "bg-accent" };
    if (score >= 60) return { status: "ACCEPTABLE", color: "bg-yellow-400" };
    if (score >= 40) return { status: "SUBOPTIMAL", color: "bg-orange-500" };
    return { status: "CRITICAL", color: "bg-destructive" };
  };

  useEffect(() => {
    if (verdict) {
      setTimeout(() => playSound('stamp'), 1000);
    }
  }, [verdict]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div
            className="relative w-20 h-20 mb-8"
          >
            <motion.div
              className="absolute inset-0 border-4 border-black border-t-secondary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-black border-b-accent"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <motion.h2 
            className="font-display text-2xl uppercase"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            CALCULATING YOUR CORPORATE WORTH...
          </motion.h2>
          <motion.p 
            className="font-mono text-sm mt-4 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            HR-9000 is processing your life choices
          </motion.p>
          <motion.div 
            className="flex gap-2 mt-6"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-secondary"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
              />
            ))}
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!verdict) {
    return (
      <Layout>
        <motion.div 
          className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.h2 
            className="font-display text-3xl uppercase mb-4"
            animate={{ 
              textShadow: [
                "0 0 0px transparent",
                "0 0 20px rgba(255,0,0,0.5)",
                "0 0 0px transparent"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            NO DATA FOUND
          </motion.h2>
          <p className="font-mono mb-8">You must complete an interview first.</p>
          <Link href="/">
            <motion.button 
              className="bg-secondary text-white font-display px-8 py-4 border-4 border-black brutalist-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              START INTERVIEW
            </motion.button>
          </Link>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div 
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${noiseBg})` }}
        animate={{ opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
           
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div 
            className="border-4 border-black bg-white p-6 md:p-10 relative brutalist-shadow-lg"
            whileHover={{ boxShadow: "12px 12px 0 0 #000" }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-yellow-50 opacity-30 pointer-events-none"></div>

            <motion.div 
              initial={{ scale: 3, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 0.8, rotate: -15 }}
              transition={{ delay: 1, type: "spring", bounce: 0.5 }}
              className="absolute -top-8 -right-8 w-32 h-32 md:w-48 md:h-48 pointer-events-none z-30"
            >
               <img src={stampImg} alt="PROCESSED" className="w-full h-full object-contain opacity-70" />
            </motion.div>

            <motion.div 
              className="relative z-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="text-center mb-8" variants={itemVariants}>
                <div className="flex justify-center mb-4">
                  <motion.div
                    className="w-20 h-20 bg-black rounded-full border-4 border-secondary flex items-center justify-center overflow-hidden"
                    animate={{ 
                      boxShadow: [
                        "0 0 0px rgba(255,0,255,0)",
                        "0 0 20px rgba(255,0,255,0.5)",
                        "0 0 0px rgba(255,0,255,0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <img src={hrBotImg} alt="HR-9000" className="w-14 h-14 object-contain" />
                  </motion.div>
                </div>
                <motion.p 
                  className="font-mono text-xs text-gray-500 mb-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  CLASSIFIED DOCUMENT #HR9000-{Math.floor(Math.random() * 999999)}
                </motion.p>
                <motion.h1 
                  className="font-display text-3xl md:text-5xl uppercase mb-4 relative"
                  animate={{ 
                    textShadow: [
                      "0 0 0px transparent",
                      "3px 3px 0px rgba(255,0,255,0.3)",
                      "-2px -2px 0px rgba(0,255,255,0.3)",
                      "0 0 0px transparent"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="relative">
                    CORPORATE FIT REPORT
                    <motion.span 
                      className="absolute -top-2 -right-8 text-xs bg-destructive text-white px-1 rotate-12"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      FINAL
                    </motion.span>
                  </span>
                </motion.h1>
                <div className="flex items-center justify-center gap-2">
                  <motion.div 
                    className={`inline-block ${getScoreStatus(verdict.score).color} text-black px-3 py-1 font-mono text-xs font-bold`}
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    STATUS: {getScoreStatus(verdict.score).status}
                  </motion.div>
                  <motion.div 
                    className="inline-block bg-black text-white px-3 py-1 font-mono text-xs"
                    whileHover={{ backgroundColor: "#ff00ff" }}
                  >
                    {archetype || "UNKNOWN"} TRACK
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                className="text-center mb-8 p-6 border-4 border-black bg-black relative overflow-hidden"
                variants={itemVariants}
              >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.03)_2px,rgba(0,255,0,0.03)_4px)]"></div>
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-0.5 bg-accent"
                  animate={{ 
                    boxShadow: ["0 0 5px #00ff00", "0 0 20px #00ff00", "0 0 5px #00ff00"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="font-mono text-xs mb-3 text-accent relative">▶ SYNERGY QUOTIENT ANALYSIS</p>
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-accent/30 rounded-full"></div>
                  </motion.div>
                  <motion.p 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                    className={`font-display text-8xl md:text-[10rem] ${getScoreColor(verdict.score)} relative`}
                    data-testid="text-score"
                    style={{ textShadow: "0 0 30px currentColor" }}
                  >
                    {verdict.score}
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-4 relative"
                >
                  <div className="inline-block border-2 border-accent bg-black px-4 py-2">
                    <p className="font-mono text-xs text-accent mb-1">CLASSIFICATION:</p>
                    <p 
                      className="font-display text-lg md:text-xl text-white uppercase tracking-widest" 
                      data-testid="text-score-label"
                    >
                      {getScoreLabel(verdict.score)}
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  animate={{ 
                    boxShadow: ["0 0 5px #00ff00", "0 0 20px #00ff00", "0 0 5px #00ff00"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <motion.div 
                className="mb-8 p-4 border-4 border-black bg-gradient-to-r from-secondary/20 via-accent/20 to-secondary/20 relative overflow-hidden"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-accent to-secondary"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded border-2 border-secondary flex items-center justify-center shrink-0">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <div>
                    <h3 className="font-mono text-xs text-gray-500 uppercase">ASSIGNED CORPORATE DESIGNATION:</h3>
                    <motion.p 
                      className="font-display text-xl md:text-2xl uppercase" 
                      data-testid="text-corporate-title"
                      animate={{ 
                        color: ["#000", "#ff00ff", "#000"]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      {verdict.corporateTitle}
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="mb-8 p-4 border-4 border-black bg-gray-50 relative"
                variants={itemVariants}
              >
                <div className="absolute -top-3 left-4 bg-secondary text-white px-3 py-1 font-mono text-xs font-bold">
                  HR-9000 ASSESSMENT
                </div>
                <div className="absolute -top-3 right-4 bg-black text-accent px-2 py-1 font-mono text-[10px] animate-pulse">
                  ● RECORDING
                </div>
                <p className="font-mono text-sm leading-relaxed mt-2 italic" data-testid="text-verdict">
                  "{verdict.verdict}"
                </p>
                <div className="mt-3 pt-2 border-t border-gray-300 flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">SENTIMENT:</span>
                  <span className="text-xs font-mono bg-black text-white px-2 py-0.5">
                    {verdict.score >= 60 ? "TOLERANT" : "DISAPPOINTED"}
                  </span>
                </div>
              </motion.div>

              <motion.div 
                className="grid md:grid-cols-2 gap-4 mb-8"
                variants={itemVariants}
              >
                <motion.div 
                  className="border-4 border-black p-4 bg-black text-white relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-0 right-0 bg-accent text-black px-2 py-0.5 text-[10px] font-mono font-bold">
                    ✓ VERIFIED
                  </div>
                  <h3 className="font-display text-lg mb-3 text-accent flex items-center gap-2">
                    <span className="w-6 h-6 bg-accent text-black flex items-center justify-center text-sm">▲</span>
                    DETECTED ASSETS
                  </h3>
                  <ul className="space-y-3">
                    {verdict.strengths.map((s, i) => (
                      <motion.li 
                        key={i} 
                        className="font-mono text-sm flex items-start gap-2" 
                        data-testid={`text-verdict-strength-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                      >
                        <motion.span 
                          className="text-accent font-bold shrink-0 w-5 h-5 border border-accent flex items-center justify-center text-xs"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ delay: 1.3 + i * 0.1, duration: 2, repeat: Infinity }}
                        >+</motion.span> 
                        <span className="text-gray-300">{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div 
                  className="border-4 border-black p-4 bg-destructive/10 relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-0 right-0 bg-destructive text-white px-2 py-0.5 text-[10px] font-mono font-bold animate-pulse">
                    ⚠ ACTION REQ
                  </div>
                  <h3 className="font-display text-lg mb-3 text-destructive flex items-center gap-2">
                    <span className="w-6 h-6 bg-destructive text-white flex items-center justify-center text-sm">▼</span>
                    OPTIMIZATION REQUIRED
                  </h3>
                  <ul className="space-y-3">
                    {verdict.areasForImprovement.map((a, i) => (
                      <motion.li 
                        key={i} 
                        className="font-mono text-sm flex items-start gap-2" 
                        data-testid={`text-verdict-improvement-${i}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                      >
                        <motion.span 
                          className="text-destructive font-bold shrink-0 w-5 h-5 border border-destructive flex items-center justify-center text-xs"
                          animate={{ 
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ 
                            delay: 1.3 + i * 0.1,
                            duration: 1,
                            repeat: Infinity
                          }}
                        >!</motion.span> 
                        <span>{a}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>

              <motion.div 
                className="mb-8 p-5 border-4 border-secondary bg-secondary/5 relative"
                variants={itemVariants}
                whileHover={{ borderColor: "#ff00ff" }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 font-mono text-xs font-bold flex items-center gap-2">
                  <span className="animate-pulse">◉</span> CLASSIFIED: ACTUAL ADVICE <span className="animate-pulse">◉</span>
                </div>
                <div className="bg-white border-2 border-black p-4 mt-2">
                  <p className="font-mono text-sm leading-relaxed" data-testid="text-real-advice">{verdict.realAdvice}</p>
                </div>
                <p className="text-[10px] font-mono text-gray-400 mt-2 text-center">
                  *This section contains non-satirical content. We apologize for the inconvenience.*
                </p>
              </motion.div>

              <motion.div 
                className="mb-8 p-4 border-4 border-black bg-gray-900 text-white relative"
                variants={itemVariants}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-secondary to-accent"></div>
                <h3 className="font-display text-lg mb-4 flex items-center gap-2 text-accent">
                  <span className="text-xl">📋</span> MANDATORY COMPLIANCE PROTOCOL
                </h3>
                <ul className="space-y-3">
                  {verdict.interviewTips.map((tip, i) => (
                    <motion.li 
                      key={i} 
                      className="font-mono text-sm flex items-start gap-3 bg-black/50 p-2 border border-gray-700" 
                      data-testid={`text-tip-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + i * 0.1 }}
                    >
                      <motion.span 
                        className="bg-accent text-black px-2 py-1 text-xs font-bold shrink-0"
                        whileHover={{ backgroundColor: "#ff00ff", color: "#fff" }}
                      >
                        TIP-{String(i + 1).padStart(2, '0')}
                      </motion.span> 
                      <span className="text-gray-300">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                className="border-t-4 border-black pt-6 flex flex-col md:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => { playSound('click'); handleTryAgain(); }}
                  className="flex-1 bg-secondary text-white text-lg font-display py-4 border-4 border-black hover:bg-black transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center gap-2"
                  data-testid="button-try-again"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🔄</span> RESUBMIT FOR EVALUATION
                </motion.button>
                <Link href="/history" className="flex-1">
                  <motion.button 
                    onClick={() => playSound('click')}
                    className="w-full bg-accent text-black text-lg font-display py-4 border-4 border-black hover:bg-green-400 transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center gap-2" 
                    data-testid="button-view-history"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>📁</span> ACCESS FAILURE ARCHIVE
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div 
                className="mt-6 p-3 bg-black/5 border border-black/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="h-px bg-black/30 flex-1"></div>
                  <span className="text-xs font-mono text-gray-400">END OF TRANSMISSION</span>
                  <div className="h-px bg-black/30 flex-1"></div>
                </div>
                <p className="font-mono text-[10px] text-gray-400 text-center">
                  This evaluation is final and binding. Appeals will be processed in 3-5 business eternities.
                </p>
                <motion.p 
                  className="font-mono text-[10px] text-gray-400 text-center mt-1"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  SURVEILLANCE STATUS: ACTIVE • COMPLIANCE LEVEL: MONITORED • HR-9000 v6.66
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
