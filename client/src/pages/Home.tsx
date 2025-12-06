import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useSession } from "@/lib/context";
import noiseBg from "@assets/generated_images/digital_noise_texture_for_background.png";
import heroImg from "@assets/generated_images/dystopian_corporate_office_hero_image.png";

const chaosTexts = [
  "YOUR EVALUATION BEGINS NOW",
  "RESISTANCE IS FUTILE",
  "SYNERGY DETECTED",
  "HUSTLE OR PERISH",
  "CORPORATE WANTS YOU"
];

const warnings = [
  "Side effects may include: existential dread, LinkedIn addiction, and uncontrollable urge to 'circle back'",
  "Warning: May cause sudden realization that your degree was a scam",
  "Disclaimer: No actual jobs were harmed in the making of this simulation",
  "Surgeon General Warning: Corporate culture is contagious",
];

export default function Home() {
  const [_, setLocation] = useLocation();
  const { resetSession } = useSession();
  const [currentText, setCurrentText] = useState(0);
  const [warning, setWarning] = useState(0);

  useEffect(() => {
    resetSession();
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % chaosTexts.length);
    }, 4000);
    const warningInterval = setInterval(() => {
      setWarning((prev) => (prev + 1) % warnings.length);
    }, 5000);
    return () => {
      clearInterval(interval);
      clearInterval(warningInterval);
    };
  }, []);

  return (
    <Layout>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url(${noiseBg})` }}></div>

      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10">
        
        {/* Floating badges */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 bg-destructive text-white px-3 py-1 text-xs font-bold rotate-[-5deg] hidden md:block"
        >
          🔥 HOT MESS ALERT
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-accent text-black px-3 py-1 text-xs font-bold rotate-[5deg] hidden md:block"
        >
          ✨ NO CAP
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="inline-block border-4 border-black p-2 bg-accent rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="text-2xl">💀</span> The Ritual Begins <span className="text-2xl">💀</span>
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 md:mb-8 w-full max-w-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black overflow-hidden relative group"
        >
          <img 
            src={heroImg} 
            alt="Dystopian Corporate Office" 
            className="w-full h-48 md:h-80 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay pointer-events-none group-hover:bg-accent/20 transition-colors duration-700"></div>
          
          {/* Overlay badges */}
          <div className="absolute top-2 left-2 bg-destructive text-white px-2 py-1 font-mono text-[10px] animate-pulse">
            LIVE 🔴
          </div>
          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 font-mono text-[10px]">
            👁️ 69,420 WATCHING
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <p className="text-white font-mono text-xs md:text-sm">
              LOC: HQ-PRIME // SEC: 7G // THREAT LEVEL: CORPORATE
            </p>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-8xl lg:text-9xl font-display uppercase leading-[0.85] mb-4 md:mb-6 glitch-text relative"
          data-text={chaosTexts[currentText]}
        >
          {chaosTexts[currentText].split(' ').map((word, i) => (
            <React.Fragment key={i}>
              <span className={i === 1 ? "text-secondary" : ""}>{word}</span>
              {i < chaosTexts[currentText].split(' ').length - 1 && <br className="md:hidden" />}
              {i < chaosTexts[currentText].split(' ').length - 1 && <span className="hidden md:inline"> </span>}
            </React.Fragment>
          ))}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 md:mb-12 max-w-2xl"
        >
          <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-3 left-4 bg-secondary text-white px-2 py-0.5 text-xs font-bold">
              POV:
            </div>
            <p className="text-base md:text-xl font-weird">
              You're about to get <span className="line-through text-gray-400">gaslit</span> <span className="text-secondary font-bold">interviewed</span> by an AI that's seen too many LinkedIn posts.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground font-mono mt-3 flex items-center gap-2">
              <span className="text-lg">🎭</span> (it's giving satire but make it educational)
            </p>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocation("/prescreen")}
          className="bg-secondary text-white text-xl md:text-3xl lg:text-4xl font-display px-8 md:px-12 py-4 md:py-6 border-4 border-black brutalist-shadow-lg hover:brutalist-shadow active:translate-y-2 active:shadow-none transition-all uppercase relative overflow-hidden group"
          data-testid="button-start"
        >
          <span className="flex items-center gap-3 transition-transform duration-300 group-hover:opacity-0">
            <span>INITIATE RITUAL</span>
            <span className="text-2xl md:text-3xl">🚀</span>
          </span>
          <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="absolute inset-0 flex items-center justify-center text-black font-display opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            LET'S GOOOO 💀
          </span>
        </motion.button>

        {/* Fun stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs font-mono uppercase"
        >
          {[
            { label: "System", value: "UNHINGED", emoji: "🤖" },
            { label: "Hope", value: "ERROR 404", emoji: "💔" },
            { label: "Coffee", value: "CRITICAL", emoji: "☕" },
            { label: "Salary", value: "LMAO", emoji: "💸" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="border-2 border-black p-3 bg-white hover:bg-accent hover:text-black transition-colors group cursor-default"
            >
              <div className="text-lg mb-1 group-hover:animate-bounce">{stat.emoji}</div>
              <div className="text-[10px] text-gray-500 mb-1">{stat.label}</div>
              <div className="font-bold">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Rotating warning */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 max-w-xl text-center"
        >
          <p className="text-xs font-mono text-gray-400 italic">
            ⚠️ {warnings[warning]}
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
