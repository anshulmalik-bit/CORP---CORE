import React from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import { motion } from "framer-motion";

export default function Verdict() {
  const [_, setLocation] = useLocation();
  const { archetype } = useSession();

  // Randomize score for demo
  const score = Math.floor(Math.random() * 40) + 30; // 30-70 range (mediocre)

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl border-4 border-black bg-white p-8 md:p-12 relative brutalist-shadow-lg"
        >
          {/* Stamp */}
          <motion.div 
            initial={{ scale: 2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute top-4 right-4 md:top-8 md:right-8 border-4 border-destructive text-destructive p-4 font-display text-4xl uppercase tracking-widest opacity-80 mix-blend-multiply z-20"
          >
            {score > 50 ? "MID" : "REJECTED"}
          </motion.div>

          <h1 className="text-4xl font-display uppercase mb-8 border-b-4 border-black pb-4">
            Candidate Assessment
          </h1>

          <div className="grid grid-cols-2 gap-8 mb-8 font-mono">
            <div>
              <p className="text-gray-500 text-xs uppercase">Subject ID</p>
              <p className="text-xl font-bold">#884-F-FAILED</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Archetype</p>
              <p className="text-xl font-bold">{archetype || "Unknown"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Corporate Fit</p>
              <p className="text-xl font-bold">{score}%</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Soul Remaining</p>
              <p className="text-xl font-bold text-destructive">12%</p>
            </div>
          </div>

          <div className="bg-gray-100 border-2 border-black p-4 mb-8">
            <h3 className="font-bold mb-2 uppercase">HR Feedback:</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Your enthusiasm feels manufactured. Good job.</li>
              <li>Buzzword usage was adequate but lacked synergy.</li>
              <li>Eye contact simulation was 40% too intense.</li>
              <li>Recommended Role: "Assistant to the Assistant Manager"</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {["Buzzword Enjoyer", "Excel Trauma Survivor", "Coffee Dependent"].map(badge => (
              <span key={badge} className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">
                {badge}
              </span>
            ))}
          </div>

          <button
            onClick={() => setLocation("/")}
            className="w-full bg-primary text-primary-foreground text-xl font-display py-4 border-2 border-black hover:bg-destructive hover:border-destructive transition-colors uppercase"
          >
            Try Again And Suffer More
          </button>

        </motion.div>
      </div>
    </Layout>
  );
}
