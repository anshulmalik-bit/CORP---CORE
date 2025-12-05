import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion } from "framer-motion";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import stampImg from "@assets/generated_images/gritty_ink_stamp_of_corporate_disapproval.png";
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
    if (score >= 80) return "CONDITIONALLY EMPLOYABLE";
    if (score >= 60) return "REQUIRES ADDITIONAL PROCESSING";
    if (score >= 40) return "CORPORATE POTENTIAL DETECTED";
    return "SYSTEM RECOMMENDS FURTHER EVALUATION";
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-black border-t-secondary mb-8"
          ></motion.div>
          <h2 className="font-display text-2xl uppercase animate-pulse">CALCULATING YOUR CORPORATE WORTH...</h2>
          <p className="font-mono text-sm mt-4 text-gray-500">HR-9000 is processing your life choices</p>
        </div>
      </Layout>
    );
  }

  if (!verdict) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
          <h2 className="font-display text-3xl uppercase mb-4">NO DATA FOUND</h2>
          <p className="font-mono mb-8">You must complete an interview first.</p>
          <Link href="/">
            <button className="bg-secondary text-white font-display px-8 py-4 border-4 border-black brutalist-shadow">
              START INTERVIEW
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>
           
      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="border-4 border-black bg-white p-6 md:p-10 relative brutalist-shadow-lg">
            <div className="absolute inset-0 bg-yellow-50 opacity-30 pointer-events-none"></div>

            <motion.div 
              initial={{ scale: 3, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 0.8, rotate: -15 }}
              transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
              className="absolute -top-8 -right-8 w-32 h-32 md:w-48 md:h-48 pointer-events-none z-30"
            >
               <img src={stampImg} alt="PROCESSED" className="w-full h-full object-contain opacity-70" />
            </motion.div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <p className="font-mono text-xs text-gray-500 mb-2">DOCUMENT #HR9000-{Date.now()}</p>
                <h1 className="font-display text-3xl md:text-5xl uppercase mb-4">CORPORATE FIT REPORT</h1>
                <div className="inline-block bg-black text-white px-4 py-2 font-mono text-sm">
                  {archetype || "UNKNOWN"} TRACK EVALUATION
                </div>
              </div>

              <div className="text-center mb-8 p-6 border-4 border-black bg-gray-50">
                <p className="font-mono text-sm mb-2">CORPORATE SURVIVAL SCORE</p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className={`font-display text-7xl md:text-9xl ${getScoreColor(verdict.score)}`}
                  data-testid="text-score"
                >
                  {verdict.score}
                </motion.p>
                <p className="font-mono text-xs mt-2 uppercase tracking-widest" data-testid="text-score-label">
                  {getScoreLabel(verdict.score)}
                </p>
              </div>

              <div className="mb-8 p-4 border-2 border-black bg-accent/20">
                <h3 className="font-display text-lg mb-2">ASSIGNED DESIGNATION:</h3>
                <p className="font-mono text-xl" data-testid="text-corporate-title">{verdict.corporateTitle}</p>
              </div>

              <div className="mb-8 p-4 border-2 border-black">
                <h3 className="font-display text-lg mb-3">HR-9000 ASSESSMENT:</h3>
                <p className="font-mono text-sm leading-relaxed" data-testid="text-verdict">{verdict.verdict}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-2 border-black p-4 bg-green-50">
                  <h3 className="font-display text-lg mb-3 border-b-2 border-black pb-2">DETECTED COMPETENCIES</h3>
                  <ul className="space-y-2">
                    {verdict.strengths.map((s, i) => (
                      <li key={i} className="font-mono text-sm flex items-start gap-2" data-testid={`text-verdict-strength-${i}`}>
                        <span className="text-green-600 font-bold">+</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-2 border-black p-4 bg-orange-50">
                  <h3 className="font-display text-lg mb-3 border-b-2 border-black pb-2">OPTIMIZATION TARGETS</h3>
                  <ul className="space-y-2">
                    {verdict.areasForImprovement.map((a, i) => (
                      <li key={i} className="font-mono text-sm flex items-start gap-2" data-testid={`text-verdict-improvement-${i}`}>
                        <span className="text-orange-600 font-bold">!</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-8 p-4 border-4 border-black bg-blue-50">
                <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                  <span className="bg-black text-white px-2 py-1 text-xs">REAL TALK</span>
                  ACTUAL CAREER ADVICE
                </h3>
                <p className="font-mono text-sm leading-relaxed" data-testid="text-real-advice">{verdict.realAdvice}</p>
              </div>

              <div className="mb-8 p-4 border-2 border-black">
                <h3 className="font-display text-lg mb-3">COMPLIANCE RECOMMENDATIONS (Interview Tips)</h3>
                <ul className="space-y-2">
                  {verdict.interviewTips.map((tip, i) => (
                    <li key={i} className="font-mono text-sm flex items-start gap-2" data-testid={`text-tip-${i}`}>
                      <span className="bg-black text-white px-2 text-xs">{i + 1}</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t-4 border-black pt-6 flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleTryAgain}
                  className="flex-1 bg-secondary text-white text-lg font-display py-4 border-4 border-black hover:bg-black transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  data-testid="button-try-again"
                >
                  Submit to Another Evaluation
                </button>
                <Link href="/history" className="flex-1">
                  <button className="w-full bg-accent text-black text-lg font-display py-4 border-4 border-black hover:bg-green-400 transition-colors uppercase brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none" data-testid="button-view-history">
                    View Past Failures
                  </button>
                </Link>
              </div>

              <p className="text-center font-mono text-xs text-gray-400 mt-6">
                This evaluation is final. Appeals will be processed in 3-5 business eternities.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
