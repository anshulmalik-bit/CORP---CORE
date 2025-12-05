import React, { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion } from "framer-motion";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import stampImg from "@assets/generated_images/gritty_ink_stamp_of_corporate_disapproval.png";
import { useMutation } from "@tanstack/react-query";

export default function Verdict() {
  const [_, setLocation] = useLocation();
  const { archetype, transcript, score, setScore } = useSession();

  // Initialize score if not set
  useEffect(() => {
    if (score === 50) {
      setScore(Math.floor(Math.random() * 40) + 30);
    }
  }, []);

  // Save session to database
  const saveSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetype: archetype || "Unknown",
          score,
          transcript,
        }),
      });
      if (!response.ok) throw new Error("Failed to save session");
      return response.json();
    },
  });

  // Auto-save on mount
  useEffect(() => {
    if (transcript.length > 0) {
      saveSessionMutation.mutate();
    }
  }, []);

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>
           
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh] relative z-10">
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl border-4 border-black bg-white p-8 md:p-12 relative brutalist-shadow-lg rotate-1"
        >
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-yellow-50 opacity-50 pointer-events-none mix-blend-multiply"></div>

          {/* Stamp */}
          <motion.div 
            initial={{ scale: 3, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 0.9, rotate: -15 }}
            transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
            className="absolute top-0 right-0 w-48 h-48 pointer-events-none z-30 mix-blend-multiply"
          >
             <img src={stampImg} alt="REJECTED" className="w-full h-full object-contain opacity-80" />
          </motion.div>

          <div className="relative z-20">
            <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-display uppercase leading-none">
                Candidate<br/>Assessment
              </h1>
              <div className="text-right font-mono text-xs">
                 DATE: {new Date().toLocaleDateString()}<br/>
                 REF: 666-HR-X
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 font-mono">
              <div className="border-l-2 border-black pl-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Subject ID</p>
                <p className="text-xl font-bold">#884-F-FAILED</p>
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Archetype</p>
                <p className="text-xl font-bold">{archetype || "Unknown"}</p>
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Corporate Fit</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-display">{score}%</span>
                  <span className="text-xs bg-black text-white px-1">SUB-OPTIMAL</span>
                </div>
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Soul Remaining</p>
                <p className="text-xl font-bold text-destructive animate-pulse">12%</p>
              </div>
            </div>

            <div className="bg-gray-100 border-2 border-black p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white text-xs px-2 py-1 font-mono">HR-9000 LOGS</div>
              <h3 className="font-bold mb-4 uppercase font-display text-xl">Performance Feedback:</h3>
              <ul className="space-y-3 text-sm font-mono">
                <li className="flex gap-2">
                  <span className="text-destructive">[-]</span>
                  <span>Your enthusiasm feels manufactured. Good job.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">[-]</span>
                  <span>Buzzword usage was adequate but lacked synergy.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">[-]</span>
                  <span>Eye contact simulation was 40% too intense.</span>
                </li>
                <li className="mt-4 pt-4 border-t border-dashed border-gray-400 font-bold">
                  Recommended Role: "Assistant to the Assistant Manager"
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Buzzword Enjoyer", "Excel Trauma Survivor", "Coffee Dependent", "Meeting Survivor"].map(badge => (
                <span key={badge} className="bg-white border-2 border-black px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {badge}
                </span>
              ))}
            </div>

            <button
              onClick={() => setLocation("/")}
              className="w-full bg-primary text-primary-foreground text-xl font-display py-5 border-4 border-black hover:bg-secondary hover:text-white hover:border-black transition-all uppercase brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Try Again And Suffer More
            </button>
          </div>

        </motion.div>
      </div>
    </Layout>
  );
}
