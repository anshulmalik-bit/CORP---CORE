import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion, AnimatePresence } from "framer-motion";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import stampImg from "@assets/generated_images/neo-brutalist_corporate_processed_stamp.png";
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
  const { archetype, transcript, resumeAnalysis, setVerdictData, resetSession } = useSession();
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
            resumeSummary: resumeAnalysis?.feedback
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
    if (score >= 80) return "YOU ATE THAT 💅";
    if (score >= 60) return "MID BUT FIXABLE";
    if (score >= 40) return "IT'S GIVING... EFFORT";
    return "MAYBE TRY NEPOTISM?";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🔥";
    if (score >= 60) return "😅";
    if (score >= 40) return "💀";
    return "🚩";
  };

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
      transition: { duration: 0.5, ease: "easeOut" }
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
                <motion.p 
                  className="font-mono text-xs text-gray-500 mb-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  DOCUMENT #HR9000-{Date.now()}
                </motion.p>
                <motion.h1 
                  className="font-display text-3xl md:text-5xl uppercase mb-4"
                  animate={{ 
                    textShadow: [
                      "0 0 0px transparent",
                      "3px 3px 0px rgba(255,0,255,0.2)",
                      "0 0 0px transparent"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  CORPORATE FIT REPORT
                </motion.h1>
                <motion.div 
                  className="inline-block bg-black text-white px-4 py-2 font-mono text-sm"
                  whileHover={{ backgroundColor: "#ff00ff" }}
                >
                  {archetype || "UNKNOWN"} TRACK EVALUATION
                </motion.div>
              </motion.div>

              <motion.div 
                className="text-center mb-8 p-6 border-4 border-black bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden"
                variants={itemVariants}
              >
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  animate={{ 
                    backgroundPosition: ["0% 0%", "100% 100%"]
                  }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]"></div>
                </motion.div>
                <p className="font-mono text-sm mb-2 relative">CORPORATE SURVIVAL SCORE</p>
                <div className="flex items-center justify-center gap-4 relative">
                  <motion.span 
                    initial={{ opacity: 0, x: -30, rotate: -180 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="text-4xl md:text-6xl"
                  >
                    {getScoreEmoji(verdict.score)}
                  </motion.span>
                  <motion.p 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                    className={`font-display text-7xl md:text-9xl ${getScoreColor(verdict.score)}`}
                    data-testid="text-score"
                  >
                    {verdict.score}
                  </motion.p>
                  <motion.span 
                    initial={{ opacity: 0, x: 30, rotate: 180 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="text-4xl md:text-6xl"
                  >
                    {getScoreEmoji(verdict.score)}
                  </motion.span>
                </div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="font-mono text-sm mt-3 uppercase tracking-widest bg-black text-white px-4 py-1 inline-block" 
                  data-testid="text-score-label"
                >
                  {getScoreLabel(verdict.score)}
                </motion.p>
              </motion.div>

              <motion.div 
                className="mb-8 p-4 border-2 border-black bg-accent/20"
                variants={itemVariants}
                whileHover={{ backgroundColor: "rgba(0,255,0,0.3)" }}
              >
                <h3 className="font-display text-lg mb-2">ASSIGNED DESIGNATION:</h3>
                <motion.p 
                  className="font-mono text-xl" 
                  data-testid="text-corporate-title"
                  animate={{ 
                    textShadow: [
                      "0 0 0px transparent",
                      "0 0 5px rgba(255,0,255,0.3)",
                      "0 0 0px transparent"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {verdict.corporateTitle}
                </motion.p>
              </motion.div>

              <motion.div 
                className="mb-8 p-4 border-2 border-black"
                variants={itemVariants}
              >
                <h3 className="font-display text-lg mb-3">HR-9000 ASSESSMENT:</h3>
                <p className="font-mono text-sm leading-relaxed" data-testid="text-verdict">{verdict.verdict}</p>
              </motion.div>

              <motion.div 
                className="grid md:grid-cols-2 gap-6 mb-8"
                variants={itemVariants}
              >
                <motion.div 
                  className="border-2 border-black p-4 bg-green-50"
                  whileHover={{ scale: 1.02, borderColor: "#00ff00" }}
                >
                  <h3 className="font-display text-lg mb-3 border-b-2 border-black pb-2">DETECTED COMPETENCIES</h3>
                  <ul className="space-y-2">
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
                          className="text-green-600 font-bold"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ delay: 1.3 + i * 0.1 }}
                        >+</motion.span> {s}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div 
                  className="border-2 border-black p-4 bg-orange-50"
                  whileHover={{ scale: 1.02, borderColor: "#ff8800" }}
                >
                  <h3 className="font-display text-lg mb-3 border-b-2 border-black pb-2">OPTIMIZATION TARGETS</h3>
                  <ul className="space-y-2">
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
                          className="text-orange-600 font-bold"
                          animate={{ 
                            opacity: [1, 0.5, 1],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ 
                            delay: 1.3 + i * 0.1,
                            duration: 1,
                            repeat: Infinity
                          }}
                        >!</motion.span> {a}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>

              <motion.div 
                className="mb-8 p-4 border-4 border-black bg-blue-50"
                variants={itemVariants}
                whileHover={{ borderColor: "#0088ff" }}
              >
                <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                  <motion.span 
                    className="bg-black text-white px-2 py-1 text-xs"
                    animate={{ backgroundColor: ["#000", "#ff00ff", "#000"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >REAL TALK</motion.span>
                  ACTUAL CAREER ADVICE
                </h3>
                <p className="font-mono text-sm leading-relaxed" data-testid="text-real-advice">{verdict.realAdvice}</p>
              </motion.div>

              <motion.div 
                className="mb-8 p-4 border-2 border-black"
                variants={itemVariants}
              >
                <h3 className="font-display text-lg mb-3">COMPLIANCE RECOMMENDATIONS (Interview Tips)</h3>
                <ul className="space-y-2">
                  {verdict.interviewTips.map((tip, i) => (
                    <motion.li 
                      key={i} 
                      className="font-mono text-sm flex items-start gap-2" 
                      data-testid={`text-tip-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + i * 0.1 }}
                    >
                      <motion.span 
                        className="bg-black text-white px-2 text-xs"
                        whileHover={{ backgroundColor: "#ff00ff" }}
                      >{i + 1}</motion.span> {tip}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                className="border-t-4 border-black pt-6 flex flex-col md:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.button
                  onClick={handleTryAgain}
                  className="flex-1 bg-secondary text-white text-lg font-display py-4 border-4 border-black hover:bg-black transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  data-testid="button-try-again"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit to Another Evaluation
                </motion.button>
                <Link href="/history" className="flex-1">
                  <motion.button 
                    className="w-full bg-accent text-black text-lg font-display py-4 border-4 border-black hover:bg-green-400 transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none" 
                    data-testid="button-view-history"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Past Failures
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div 
                className="text-center mt-6 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                <p className="font-mono text-xs text-gray-400">
                  This evaluation is final. Appeals will be processed in 3-5 business eternities.
                </p>
                <motion.p 
                  className="font-mono text-[10px] text-gray-300"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  no thoughts just corporate | slay responsibly | HR is watching 👁️
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
